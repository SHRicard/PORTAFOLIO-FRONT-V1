import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconBadge } from "@/vistas/rr-dev/components/atoms/IconBadge";
import type { TonoEstadistica } from "@/vistas/rr-dev/contenido";

export interface ItemBarra {
  clave: string;
  /** Lo grande: el nombre de la lista */
  valor: string;
  /** Lo chico de abajo, desde la tableta: qué es esa lista */
  etiqueta: string;
  icono: LucideIcon;
  tono: TonoEstadistica;
  /** Si se puede tocar: abre su detalle. `nombre` dice qué abre, para los lectores de pantalla */
  abrir?: { nombre: string; alTocar: () => void };
}

/** Una columna por lista, también en el celular */
const COLUMNAS = ["grid-cols-1", "grid-cols-1", "grid-cols-2", "grid-cols-3"];
/** Al entrar al apartado se encienden de a 300 ms, como las de StatsBar */
const PASO_ENCENDIDO = 300;

interface JourneyBarProps {
  items: ItemBarra[];
  /** Nombra la lista */
  etiqueta: string;
  /** Los ms en que se enciende la primera al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/**
 * La barra de vidrio de Inicio (StatsBar) con las listas de la trayectoria: cada una con su ícono
 * teñido, su nombre y qué es. Las que abren algo son botones con una flecha. En el celular van en una
 * fila, con el ícono arriba del nombre y sin la etiqueta
 */
export function JourneyBar({ items, etiqueta, encender }: JourneyBarProps) {
  const celda =
    "flex size-full flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2 text-center md:flex-row md:justify-start md:gap-3 md:px-3.5 md:py-2.5 md:text-left";
  const contenido = ({ valor, etiqueta: lugar, icono, tono }: ItemBarra) => (
    <>
      <IconBadge icono={icono} tono={tono} />
      <span className="grid min-w-0 md:flex-1">
        <span className="font-titulo text-sm leading-tight font-bold text-texto md:text-xl md:whitespace-nowrap">
          {valor}
        </span>
        <span className="hidden truncate text-[0.8rem] text-texto md:block">{lugar}</span>
      </span>
    </>
  );

  return (
    <ul
      aria-label={etiqueta}
      className={cn(
        "grid gap-y-1 rounded-2xl border border-borde bg-superficie/70 p-1.5 shadow-(--sombra-panel) backdrop-blur-md md:p-2",
        COLUMNAS[Math.min(items.length, 3)],
      )}
    >
      {items.map((item, indice) => (
        <li
          key={item.clave}
          data-encender={encender === undefined ? undefined : encender + indice * PASO_ENCENDIDO}
          className="relative min-w-0 md:not-first:before:absolute md:not-first:before:inset-y-[20%] md:not-first:before:left-0 md:not-first:before:w-px md:not-first:before:bg-borde"
        >
          {item.abrir ? (
            <button
              type="button"
              onClick={item.abrir.alTocar}
              aria-label={item.abrir.nombre}
              className={cn("group transition-colors duration-400 hover:bg-texto/5", celda)}
            >
              {contenido(item)}
              <ChevronRight
                className="hidden size-4 shrink-0 text-texto-suave transition-[translate,color] duration-400 ease-(--salida) group-hover:translate-x-0.75 group-hover:text-secundario md:block"
                aria-hidden
              />
            </button>
          ) : (
            <div className={celda}>{contenido(item)}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
