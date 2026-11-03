import { StatCard } from "@/vistas/rr-dev/components/molecules/StatCard";
import type { Estadistica } from "@/vistas/rr-dev/contenido";

/** Al entrar al apartado se encienden salteadas, de a 300 ms: la primera, la tercera, la segunda y la cuarta */
const SALTEADO = [0, 2, 1, 3];
const PASO_ENCENDIDO = 300;

interface StatsBarProps {
  items: Estadistica[];
  /** Los ms en que se enciende la primera al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/** Todas las estadísticas en una barra de vidrio, separadas por líneas. En celulares, dos por fila. */
export function StatsBar({ items, encender }: StatsBarProps) {
  return (
    <ul className="grid grid-cols-2 gap-y-2 rounded-2xl border border-borde bg-superficie/70 p-2 shadow-(--sombra-panel) backdrop-blur-md md:grid-cols-4 md:p-3">
      {items.map((item, indice) => (
        <li
          key={item.etiqueta}
          data-encender={
            encender === undefined ? undefined : encender + (SALTEADO[indice] ?? indice) * PASO_ENCENDIDO
          }
          className="relative md:not-first:before:absolute md:not-first:before:inset-y-[20%] md:not-first:before:left-0 md:not-first:before:w-px md:not-first:before:bg-borde"
        >
          <StatCard {...item} />
        </li>
      ))}
    </ul>
  );
}
