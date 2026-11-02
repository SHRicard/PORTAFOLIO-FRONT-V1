import { StatCard } from "@/vistas/rr-dev/components/molecules/StatCard";
import type { Estadistica } from "@/vistas/rr-dev/contenido";

interface StatsBarProps {
  items: Estadistica[];
}

/** Todas las estadísticas en una barra de vidrio, separadas por líneas. En celulares, dos por fila. */
export function StatsBar({ items }: StatsBarProps) {
  return (
    <ul className="grid grid-cols-2 gap-y-2 rounded-2xl border border-borde bg-superficie/70 p-2 shadow-(--sombra-panel) backdrop-blur-md md:grid-cols-4 md:p-3">
      {items.map((item) => (
        <li
          key={item.etiqueta}
          className="relative md:not-first:before:absolute md:not-first:before:inset-y-[20%] md:not-first:before:left-0 md:not-first:before:w-px md:not-first:before:bg-borde"
        >
          <StatCard {...item} />
        </li>
      ))}
    </ul>
  );
}
