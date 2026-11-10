import { Globe } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { Link } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useElegirVistaMutation } from "@/features/perfil/perfilApi";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/errors";
import { VISTAS } from "@/vistas";
import type { Vista } from "@/vistas/types";
import { useVista } from "@/vistas/useVista";
import { partirNombre } from "./nombreVista";

const TARJETA = "flex flex-col overflow-hidden rounded-card border bg-superficie";
const PIE = "flex items-center gap-3 py-3 pr-3 pl-4";
const NOMBRE = "min-w-0 flex-1 truncate font-titulo text-base font-bold tracking-tight text-texto";

/**
 * La vidriera de portafolios del Inicio del panel: todas las tarjetas del mismo tamaño, en grilla
 * («Todas iguales», la que eligió el dueño después de que «Cielo propio» le pareciera muy grande).
 * El aplicado va primero y es el único con su cielo propio; los demás muestran su portada y «Aplicar».
 * Aplicar guarda la vista en el perfil (`PATCH /perfil`): la ven todos los visitantes
 */
export function Vidriera() {
  const aplicado = useVista(); // lee perfil.vista: se actualiza solo al guardar
  const [elegirVista, { isLoading: guardando, error }] = useElegirVistaMutation();
  const otros = VISTAS.filter(({ id }) => id !== aplicado.id);
  const grilla = useRef<HTMLUListElement>(null);
  const pedido = useRef(false);

  // El nuevo aplicado pasa al primer lugar: si quedó fuera de la pantalla, se sube a verlo
  useEffect(() => {
    if (!pedido.current) return;
    pedido.current = false;
    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    grilla.current?.scrollIntoView?.({ behavior: quieto ? "auto" : "smooth", block: "nearest" });
  }, [aplicado.id]);

  const aplicar = (id: string) => {
    pedido.current = true;
    void elegirVista(id);
  };

  return (
    <div className="space-y-4">
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      <ul ref={grilla} className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-5">
        {/* Con otra clave, la tarjeta del aplicado se monta de nuevo y entra con su brillo */}
        <Aplicado key={`aplicado-${aplicado.id}`} vista={aplicado} />
        {otros.map((vista) => (
          <EnVidriera key={vista.id} vista={vista} guardando={guardando} onAplicar={() => aplicar(vista.id)} />
        ))}
      </ul>
    </div>
  );
}

/**
 * El aplicado, con su «cielo propio»: su portada desenfocada tiñe la tarjeta con sus colores, y
 * encima van la captura en una computadora y en un celular, con el sello «Aplicado». Borde violeta
 */
function Aplicado({ vista }: { vista: Vista }) {
  const { nombre, capturas } = vista;

  return (
    <li
      aria-current="true"
      className={cn(
        TARJETA,
        "border-primario/65 shadow-[0_26px_60px_-36px_var(--primario)] ring-2 ring-primario/16 motion-safe:animate-[entrar-vidriera_0.9s_cubic-bezier(0.2,0.8,0.2,1)]",
      )}
    >
      <div className="relative isolate aspect-16/10 overflow-hidden border-b border-borde bg-fondo">
        <img
          src={capturas.escritorio}
          alt=""
          aria-hidden
          className="absolute -inset-[10%] -z-10 size-[120%] max-w-none object-cover blur-[36px] brightness-60 saturate-140"
        />
        <div className="absolute top-[21%] left-[7%] w-[68%] overflow-hidden rounded-lg border border-borde bg-fondo shadow-[0_18px_40px_-18px_var(--sombra)]">
          <BarraVentana nombre={nombre} chica />
          <img src={capturas.escritorio} alt={`${nombre} en una computadora`} className="aspect-16/10 w-full object-cover object-top" />
        </div>
        <div className="absolute top-[27%] left-[71%] aspect-[390/844] w-[17%] overflow-hidden rounded-xl border-3 border-superficie bg-fondo shadow-[0_0_0_1px_var(--borde),0_20px_36px_-14px_var(--sombra)]">
          <img src={capturas.celular} alt={`${nombre} en un celular`} className="size-full object-cover object-top" />
        </div>
        <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full border border-exito/45 bg-fondo/72 py-1.5 pr-3 pl-2.5 text-[0.8125rem] font-semibold text-texto backdrop-blur-md">
          <Latido />
          Aplicado
        </span>
      </div>
      <div className={PIE}>
        <h2 className={NOMBRE}>
          <NombreVista nombre={nombre} />
        </h2>
        <Link to="/" className={cn(buttonVariants({ estilo: "contorno", tamano: "sm" }), "shrink-0")}>
          <Globe className="size-4" aria-hidden />
          Ver sitio
        </Link>
      </div>
    </li>
  );
}

/** Uno sin aplicar: su portada en una ventana, el nombre y «Aplicar» (deshabilitado mientras se guarda) */
function EnVidriera({ vista, guardando, onAplicar }: { vista: Vista; guardando: boolean; onAplicar: () => void }) {
  const { nombre, capturas } = vista;

  return (
    <li className={cn(TARJETA, "group border-borde transition-colors duration-500 hover:border-primario/50")}>
      <div className="flex aspect-16/10 flex-col overflow-hidden border-b border-borde bg-fondo">
        <BarraVentana nombre={nombre} />
        <img
          src={capturas.escritorio}
          alt={`${nombre} en una computadora`}
          className="min-h-0 w-full flex-1 object-cover object-top transition-[scale] duration-[7s] ease-linear group-hover:scale-104 motion-reduce:transition-none"
        />
      </div>
      <div className={PIE}>
        <h2 className={NOMBRE}>
          <NombreVista nombre={nombre} />
        </h2>
        <Button tamano="sm" className="shrink-0" onClick={onAplicar} disabled={guardando} aria-label={`Aplicar ${nombre}`}>
          Aplicar
        </Button>
      </div>
    </li>
  );
}

/** La barra de una ventana de navegador, con el nombre del portafolio. `chica`, dentro del cielo propio */
function BarraVentana({ nombre, chica = false }: { nombre: string; chica?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center border-b border-borde bg-superficie",
        chica ? "h-6 gap-1.25 px-2.5" : "h-7 gap-1.5 px-3",
      )}
    >
      {[0, 1, 2].map((punto) => (
        <span key={punto} className={cn("shrink-0 rounded-full bg-texto/16", chica ? "size-1.75" : "size-2")} />
      ))}
      <span
        className={cn(
          "truncate rounded-full bg-texto/6 text-texto-suave",
          chica ? "ml-1.5 px-2 py-px text-[0.6875rem]" : "ml-2 px-2.5 py-0.5 text-xs",
        )}
      >
        <NombreVista nombre={nombre} />
      </span>
    </div>
  );
}

/** El nombre, con lo que sigue al punto en el color de acento: mi<.universo> */
function NombreVista({ nombre }: { nombre: string }): ReactNode {
  const [base, acento] = partirNombre(nombre);
  return (
    <>
      {base}
      {acento && <span className="text-secundario">{acento}</span>}
    </>
  );
}

/** El punto verde del aplicado, que late despacio */
function Latido() {
  return (
    <span aria-hidden className="relative size-2 shrink-0 rounded-full bg-exito">
      <span className="absolute inset-0 animate-ping rounded-full bg-exito [animation-duration:2.6s] motion-reduce:hidden" />
    </span>
  );
}
