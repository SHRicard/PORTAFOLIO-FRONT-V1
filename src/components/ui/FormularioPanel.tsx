import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Link } from "react-router";
import { cva } from "class-variance-authority";
import { ArrowLeft, CircleAlert, CircleCheck, ExternalLink, Pencil, Save, Trash2, type LucideIcon } from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { cn } from "@/lib/cn";
import { Alert } from "./Alert";
import { Badge, type BadgeProps } from "./Badge";
import { Button, buttonVariants } from "./Button";
import { Title } from "./Typography";

/*
 * LOS FORMULARIOS DEL PANEL «CON VISTA PREVIA» (proyectos y blog)
 * Arriba, una barra que acompaña al bajar, con el nombre, el estado, «Volver», «Ver en la web» y
 * «Guardar». A la izquierda, el formulario en secciones con su ícono de color; a la derecha, quieta
 * mientras se baja, cómo se ve en la lista, la publicación y lo que tiene. Cada formulario arma lo
 * suyo con estas piezas
 */

/** El ícono de cada sección, en su color */
const medallaVariants = cva("grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset sm:size-10", {
  variants: {
    tono: {
      info: "bg-info/14 text-info ring-info/30",
      aviso: "bg-aviso/14 text-aviso ring-aviso/30",
      exito: "bg-exito/14 text-exito ring-exito/30",
      rosa: "bg-rosa/14 text-rosa ring-rosa/30",
      secundario: "bg-secundario/14 text-secundario ring-secundario/30",
    },
  },
});
export type TonoSeccion = NonNullable<Parameters<typeof medallaVariants>[0]>["tono"];

interface SeccionProps {
  icono: LucideIcon;
  tono: TonoSeccion;
  titulo: string;
  descripcion: string;
  children: ReactNode;
}

/** Una sección del formulario: la cabecera con su ícono de color, el título y para qué sirve. El cuerpo es `@container` */
export function Seccion({ icono: Icono, tono, titulo, descripcion, children }: SeccionProps) {
  return (
    <section className="rounded-card border border-borde bg-superficie">
      <header className="flex items-center gap-3 border-b border-borde p-4 sm:gap-3.5 sm:px-6 sm:py-5">
        <span className={medallaVariants({ tono })}>
          <Icono className="size-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h2 className="font-subtitulo text-[1.0625rem] font-semibold text-texto">{titulo}</h2>
          <p className="text-[0.8125rem] text-texto-suave">{descripcion}</p>
        </div>
      </header>
      <div className="@container grid gap-5 p-4 pb-5 sm:px-6 sm:pt-5.5 sm:pb-6">{children}</div>
    </section>
  );
}

/** Una caja de la columna de la derecha, con su título chico en mayúsculas */
export function CajaLado({
  icono: Icono,
  titulo,
  className,
  children,
}: {
  icono: LucideIcon;
  titulo: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("grid gap-3 rounded-card border border-borde bg-superficie p-4", className)}>
      <h2 className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-texto-suave uppercase">
        <Icono className="size-3.5" aria-hidden />
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/** Lo que va debajo de un campo de texto: para qué es y cuánto lleva */
export function PieCampo({ izquierda, derecha, pasado }: { izquierda: string; derecha: string; pasado?: boolean }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-3 text-xs text-texto-suave tabular-nums">
      <span>{izquierda}</span>
      <span className={cn(pasado && "text-peligro")}>{derecha}</span>
    </div>
  );
}

/** Con la navegación del panel en «Tabs arriba», esa barra ya queda pegada arriba: la del formulario no */
function useNavegacionArriba() {
  return useAppSelector((state) => state.theme.navegacion) === "tabs";
}

/** true mientras el elemento que se pasa ya quedó arriba, fuera de la pantalla (la barra está pegada) */
function usePasoArriba() {
  const marca = useRef<HTMLDivElement>(null);
  const [paso, setPaso] = useState(false);
  useEffect(() => {
    const elemento = marca.current;
    if (!elemento || typeof IntersectionObserver === "undefined") return;
    const observador = new IntersectionObserver(([entrada]) =>
      setPaso(!!entrada && !entrada.isIntersecting && entrada.boundingClientRect.top < 0),
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);
  return { marca, paso };
}

interface BarraFormularioProps {
  /** El nombre (o «Nuevo proyecto», «Sin título»...) */
  titulo: string;
  estado: { etiqueta: string; estilo: BadgeProps["estilo"] };
  /** «Volver», como «Guardar» pero en rojo: a dónde lleva y qué dice a los lectores de pantalla */
  volver?: { a: string; etiqueta: string };
  /** «Ver en la web»: solo si lo guardado está publicado. En el celular no va */
  verEnLaWeb?: string;
  textoGuardar: string;
  guardando: boolean;
}

/**
 * La barra de arriba: se queda pegada al bajar y muestra un borde cuando ya está pegada. Ocupa todo el
 * ancho de la pantalla, más allá del 90% del contenido. Va adentro del <form>: «Guardar» es su submit
 */
export function BarraFormulario({ titulo, estado, volver, verEnLaWeb, textoGuardar, guardando }: BarraFormularioProps) {
  const barraArriba = useNavegacionArriba();
  const { marca, paso: pegada } = usePasoArriba();

  return (
    <>
      <div ref={marca} aria-hidden />
      <div
        className={cn(
          "z-20 -mx-[calc(100%/18)] flex flex-wrap items-center gap-x-4 gap-y-2.5 border-b bg-fondo/82 px-[calc(100%/18)] py-3 backdrop-blur-md transition-colors duration-300 sm:py-3.5",
          !barraArriba && "sticky top-0",
          pegada ? "border-borde" : "border-transparent",
        )}
      >
        {/* El título no se aplasta: si no entra al lado de los botones (un título largo en el celular), ellos
            bajan a la línea de abajo */}
        <Title className="flex min-w-[min(100%,16rem)] flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-[1.375rem] leading-tight lg:text-2xl xl:text-[1.875rem]">
          <span className="min-w-0 wrap-break-word">{titulo}</span>
          <Badge estilo={estado.estilo}>{estado.etiqueta}</Badge>
        </Title>
        <div className="ml-auto flex shrink-0 gap-2.5">
          {/* «Volver», como «Guardar» pero en rojo; en el celular, solo la flecha */}
          {volver && (
            <Link to={volver.a} className={buttonVariants({ estilo: "peligro" })} aria-label={volver.etiqueta}>
              <ArrowLeft className="size-4" aria-hidden />
              <span className="hidden sm:inline">Volver</span>
            </Link>
          )}
          {verEnLaWeb && (
            <Link to={verEnLaWeb} className={cn(buttonVariants({ estilo: "contorno" }), "hidden sm:inline-flex")}>
              <ExternalLink className="size-4" aria-hidden />
              Ver en la web
            </Link>
          )}
          <Button type="submit" cargando={guardando}>
            {!guardando && <Save className="size-4" aria-hidden />}
            {textoGuardar}
          </Button>
        </div>
      </div>
    </>
  );
}

/** Los errores de arriba, debajo de la barra: los de subir, los del backend y «Revisá los campos marcados» */
export function AvisosFormulario({ errores, conCampos }: { errores: (string | null)[]; conCampos: boolean }) {
  const lista = errores.filter((error): error is string => !!error);
  if (lista.length === 0 && !conCampos) return null;
  return (
    <div className="mt-4 space-y-3">
      {lista.map((error) => (
        <Alert key={error} tipo="error">
          {error}
        </Alert>
      ))}
      {conCampos && <Alert tipo="error">Revisá los campos marcados.</Alert>}
    </div>
  );
}

/**
 * Al guardar con errores (los del esquema o los que devuelva el backend), enfoca el primer campo marcado;
 * si el error es de una lista entera, la muestra. `campos` va en el contenedor de las secciones; `buscar`
 * se llama al enviar
 */
export function useEnfocarError(clavesConError: string) {
  const campos = useRef<HTMLDivElement>(null);
  const buscarError = useRef(false);
  useEffect(() => {
    if (!buscarError.current || !clavesConError) return;
    buscarError.current = false;
    const campo = campos.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (campo) campo.focus();
    else campos.current?.querySelector('[role="alert"]')?.scrollIntoView?.({ block: "center" });
  }, [clavesConError]);
  return {
    campos,
    buscar: () => {
      buscarError.current = true;
    },
  };
}

interface CuerpoFormularioProps {
  /** El contenedor de las secciones (de `useEnfocarError`) */
  campos: RefObject<HTMLDivElement | null>;
  /** La columna de la derecha */
  lado: ReactNode;
  children: ReactNode;
}

/**
 * Las secciones a la izquierda y la columna de la derecha, quieta mientras se baja (desde `lg`), por debajo
 * de la barra y por encima de la navegación del pie. Si no entra en la pantalla (una laptop), se desliza por
 * dentro. En el celular va debajo
 */
export function CuerpoFormulario({ campos, lado, children }: CuerpoFormularioProps) {
  const barraArriba = useNavegacionArriba();
  return (
    <div className="mt-4.5 grid items-start gap-5.5 lg:grid-cols-[minmax(0,1fr)_21.25rem] xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-7">
      <div ref={campos} className="grid min-w-0 gap-5.5">
        {children}
      </div>
      <aside
        className={cn(
          "grid min-w-0 gap-3",
          !barraArriba &&
            "lg:sticky lg:top-22 lg:-m-1 lg:max-h-[calc(100dvh-11rem)] lg:overflow-y-auto lg:overscroll-contain lg:p-1 lg:[scrollbar-width:thin]",
        )}
      >
        {lado}
      </aside>
    </div>
  );
}

/** Cada estado, un botón con su punto de color; el elegido se tiñe de ese color */
const opcionEstadoVariants = cva(
  "flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[0.5625rem] text-[0.8125rem] font-semibold text-texto-suave " +
    "transition-colors duration-500 hover:text-texto has-checked:text-texto has-checked:ring-1 " +
    "has-focus-visible:outline-2 has-focus-visible:outline-secundario",
  {
    variants: {
      tono: {
        neutro: "has-checked:bg-texto-suave/14 has-checked:ring-texto-suave/45 [--punto:var(--texto-suave)]",
        exito: "has-checked:bg-exito/14 has-checked:ring-exito/45 [--punto:var(--exito)]",
        peligro: "has-checked:bg-peligro/14 has-checked:ring-peligro/45 [--punto:var(--peligro)]",
      },
    },
  },
);

const COLUMNAS_ESTADO: Record<number, string> = { 2: "grid-cols-2", 3: "grid-cols-3" };

interface OpcionesEstadoProps {
  opciones: { valor: string; etiqueta: string; tono: "neutro" | "exito" | "peligro" }[];
  /** `register("estado")`: cada opción es un radio */
  registro: UseFormRegisterReturn;
  /** Qué significa el elegido */
  ayuda: { icono: LucideIcon; texto: string };
  error?: string;
}

/** El estado de lo que se edita (borrador, publicado...), en botones con su punto de color, y debajo qué significa */
export function OpcionesEstado({ opciones, registro, ayuda: { icono: Icono, texto }, error }: OpcionesEstadoProps) {
  return (
    <fieldset className="min-w-0 space-y-2">
      {/* La caja ya se llama «Publicación»: el nombre queda para los lectores de pantalla */}
      <legend className="sr-only">Estado</legend>
      <div
        className={cn(
          "grid gap-1.5 rounded-card border border-texto/15 bg-fondo p-1",
          COLUMNAS_ESTADO[opciones.length] ?? "grid-cols-3",
        )}
      >
        {opciones.map(({ valor, etiqueta, tono }) => (
          <label key={valor} className={opcionEstadoVariants({ tono })}>
            <input type="radio" value={valor} className="sr-only" {...registro} />
            <span aria-hidden className="size-2 rounded-full bg-(--punto) shadow-[0_0_10px_var(--punto)]" />
            {etiqueta}
          </label>
        ))}
      </div>
      <p className="flex items-center gap-2 text-sm text-texto-suave">
        <Icono className="size-4 shrink-0" aria-hidden />
        {texto}
      </p>
      {error && (
        <p role="alert" className="text-sm text-peligro">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** «Lo que tiene»: cada cosa con un tilde verde o un aviso, en dos columnas */
export function LoQueTiene({ items }: { items: { ok: boolean; si: string; no: string }[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
      {items.map(({ ok, si, no }) => (
        <li key={si} className="flex items-center gap-2 text-[0.8125rem] text-texto">
          {ok ? (
            <CircleCheck className="size-4 shrink-0 text-exito" aria-hidden />
          ) : (
            <CircleAlert className="size-4 shrink-0 text-aviso" aria-hidden />
          )}
          {ok ? si : no}
        </li>
      ))}
    </ul>
  );
}

/** Los botones de la lista en la vista previa: de muestra, sin acción */
export function AccionesDeMuestra({ conVer }: { conVer: boolean }) {
  return (
    <div aria-hidden className="flex items-center gap-1 text-secundario *:grid *:size-8 *:place-items-center">
      {conVer && (
        <span>
          <ExternalLink className="size-4" />
        </span>
      )}
      <span>
        <Pencil className="size-4" />
      </span>
      <span>
        <Trash2 className="size-4" />
      </span>
    </div>
  );
}
