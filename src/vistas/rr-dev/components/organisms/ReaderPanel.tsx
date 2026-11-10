import { type LucideIcon, X } from "lucide-react";
import { type KeyboardEvent as EventoTeclado, type ReactNode, useEffect, useRef } from "react";
import { TEXTOS_PANEL } from "@/vistas/rr-dev/contenido";

/** Lo que se puede enfocar adentro del panel, para que Tab no se escape a la página de atrás */
const ENFOCABLES = "a[href], button:not([disabled])";

interface ReaderPanelProps {
  /** Lo que dice la barra de arriba, al lado del ícono */
  etiqueta: string;
  icono: LucideIcon;
  /** El id del título del contenido: nombra el diálogo */
  tituloId: string;
  onCerrar: () => void;
  /** Con algo abierto encima, como el visor de fotos, Escape es de eso y no cierra el panel */
  escapeCierra?: boolean;
  children: ReactNode;
  /** Lo que va por encima del panel, como el visor de fotos */
  encima?: ReactNode;
}

/**
 * Un panel de vidrio que entra por la derecha, encima de la página: así se lee algo largo sin
 * perder la página en la que estaba. Abre con el foco en Cerrar, Escape cierra, Tab no se escapa
 * del panel y la página de atrás no se desliza mientras está abierto. Al cerrar, el foco vuelve
 * adonde estaba. Lo usan el blog y Sobre mí
 */
export function ReaderPanel({
  etiqueta,
  icono: Icono,
  tituloId,
  onCerrar,
  escapeCierra = true,
  children,
  encima,
}: ReaderPanelProps) {
  const cerrar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    cerrar.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      antes?.focus();
    };
  }, []);

  useEffect(() => {
    if (!escapeCierra) return;
    const alPresionar = (evento: KeyboardEvent) => evento.key === "Escape" && onCerrar();
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [escapeCierra, onCerrar]);

  const atraparFoco = (evento: EventoTeclado<HTMLElement>) => {
    if (evento.key !== "Tab") return;
    const enfocables = [...evento.currentTarget.querySelectorAll<HTMLElement>(ENFOCABLES)];
    const [primero] = enfocables;
    const ultimo = enfocables.at(-1);
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo?.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden className="aparecer absolute inset-0 bg-fondo/35" onClick={onCerrar} />

      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        onKeyDown={atraparFoco}
        className="vidrio-fuerte entrada-lector absolute inset-y-0 right-0 w-full overflow-y-auto overscroll-contain border-l border-texto/10 md:w-[min(43.75rem,100%)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-linear-to-b from-superficie/70 to-transparent px-5 py-3 md:pr-6 md:pl-10">
          <span className="flex items-center gap-2 text-sm text-texto-suave">
            <Icono className="size-4" aria-hidden />
            {etiqueta}
          </span>
          <button
            ref={cerrar}
            type="button"
            onClick={onCerrar}
            aria-label={TEXTOS_PANEL.cerrar}
            className="grid size-10 place-items-center rounded-full text-texto transition-colors hover:bg-texto/12"
          >
            <X className="size-5.5" aria-hidden />
          </button>
        </div>

        <div className="grid gap-4 px-5 pb-12 md:px-10 md:pb-14">{children}</div>
      </article>

      {encima}
    </div>
  );
}
