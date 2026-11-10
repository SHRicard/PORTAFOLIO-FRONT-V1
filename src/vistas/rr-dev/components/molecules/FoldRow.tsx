import { ChevronRight } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { tonoArea } from "@/vistas/rr-dev/components/atoms/SkillBubble";
import type { TonoEstadistica } from "@/vistas/rr-dev/contenido";

/** El botón principal de una ficha abierta, como «Ver proyecto» o «Escribir» */
export const BOTON_FICHA =
  "group inline-flex items-center gap-2 rounded-full bg-primario px-3.5 py-1.5 text-[0.78125rem] font-semibold whitespace-nowrap text-primario-texto shadow-[0_10px_30px_-12px_var(--primario)] transition-colors hover:bg-primario-hover xl:px-[clamp(0.75rem,1.6cqh,0.9375rem)] xl:py-[clamp(0.3125rem,0.75cqh,0.4375rem)] xl:text-[length:clamp(0.75rem,1.42cqh,0.84375rem)]";

/** Su flecha, que se corre un poco al pasar por encima */
export const FLECHA_BOTON_FICHA =
  "size-3.5 transition-transform duration-400 ease-(--salida) group-hover:translate-x-0.75 xl:size-[clamp(0.8125rem,1.6cqh,1rem)]";

interface FoldRowProps {
  tono: TonoEstadistica;
  abierta: boolean;
  onAbrir: () => void;
  /** El emblema de la izquierda. Es decorativo: el título va al lado */
  emblema: ReactNode;
  titulo: string;
  /** El renglón chico de debajo del título */
  subtitulo: ReactNode;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
  /**
   * Lo de adentro. Recibe `despues(ms)`: los ms en que se enciende cada pieza, contados desde la fila.
   * Solo en la ficha que entra abierta; en las demás da undefined y, al abrirse, aparecen despacio
   */
  children: (despues: (ms: number) => number | undefined) => ReactNode;
}

/**
 * Una ficha de una lista, como las de Proyectos y Contacto: una píldora con el emblema, el título, un
 * renglón chico y una flecha. Al tocarla se abre despacio y muestra lo de adentro (`.ficha` en
 * estilos.css). La lista decide cuál está abierta. Lo de una cerrada lleva `inert`. Mide con
 * `--emblema`, que pone la lista
 */
export function FoldRow({ tono, abierta, onAbrir, emblema, titulo, subtitulo, encender, children }: FoldRowProps) {
  const id = useId();
  const [abiertaAlEntrar] = useState(abierta);
  const despues = (ms: number) => (encender === undefined || !abiertaAlEntrar ? undefined : encender + ms);

  return (
    <article
      aria-labelledby={`${id}-titulo`}
      data-abierta={abierta || undefined}
      className={cn(tonoArea({ tono }), "ficha grid min-w-0")}
    >
      <h2>
        <button
          type="button"
          id={`${id}-boton`}
          aria-expanded={abierta}
          aria-controls={`${id}-cuerpo`}
          onClick={onAbrir}
          data-encender={encender}
          data-respaldo
          className="cabeza-ficha sombra-texto flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-full border border-transparent p-0.75 pr-3.5 text-left hover:bg-texto/5 aria-expanded:cursor-default xl:gap-3 xl:p-1 xl:pr-4.5"
        >
          {emblema}
          <span className="grid min-w-0 flex-1 gap-px">
            <span
              id={`${id}-titulo`}
              className="font-titulo text-[0.96875rem] leading-tight font-bold tracking-[-0.01em] text-texto xl:text-[length:clamp(0.90625rem,2cqh,1.1875rem)]"
            >
              {titulo}
            </span>
            <span className="truncate text-[0.71875rem] text-texto-suave xl:text-[length:clamp(0.6875rem,1.3cqh,0.78125rem)]">
              {subtitulo}
            </span>
          </span>
          <ChevronRight
            aria-hidden
            className="flecha-ficha size-4 shrink-0 text-texto-suave xl:size-[clamp(0.9375rem,1.9cqh,1.125rem)]"
          />
        </button>
      </h2>

      <div id={`${id}-cuerpo`} role="region" aria-labelledby={`${id}-boton`} inert={!abierta} className="cuerpo-ficha">
        <div className="recorte-ficha">
          <div className="interior-ficha grid justify-items-start gap-2.5 pt-2.5 pb-1 pl-1 md:pl-[calc(var(--emblema)+0.875rem)] xl:gap-[clamp(0.5rem,1.25cqh,0.75rem)] xl:pt-[clamp(0.5rem,1.25cqh,0.75rem)] xl:pl-[calc(var(--emblema)+1rem)]">
            {children(despues)}
          </div>
        </div>
      </div>
    </article>
  );
}
