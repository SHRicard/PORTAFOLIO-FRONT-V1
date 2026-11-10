import { useState } from "react";
import type { To } from "react-router";
import type { Proyecto } from "@/features/portafolio/types";
import { cn } from "@/lib/cn";
import { ProjectRow } from "@/vistas/rr-dev/components/molecules/ProjectRow";

interface ProjectListProps {
  /** Los proyectos de este costado, con su lugar en la lista entera */
  proyectos: { proyecto: Proyecto; indice: number }[];
  /** El enlace que abre cada uno en el panel */
  hrefDe: (slug: string) => To;
  /** Los ms en que se enciende cada ficha, por su lugar en la lista (ver `useEncendido`) */
  encenderDe?: (lugar: number) => number;
  className?: string;
}

/**
 * Las fichas de un costado de Proyectos, con una sola abierta: entra abierta la primera, y al tocar
 * otra se abre esa y se cierra la anterior. Las medidas salen del alto del apartado (`cqh`)
 */
export function ProjectList({ proyectos, hrefDe, encenderDe, className }: ProjectListProps) {
  const [abierta, setAbierta] = useState(0);

  return (
    <ul
      className={cn(
        "grid min-w-0 content-start gap-2 xl:gap-[clamp(0.375rem,1cqh,0.625rem)]",
        "[--burbuja:clamp(1.5rem,3.8cqh,1.875rem)] [--emblema:2.25rem]",
        "xl:[--burbuja:clamp(1.5rem,3.6cqh,2.125rem)] xl:[--emblema:clamp(2rem,4.6cqh,2.75rem)]",
        className,
      )}
    >
      {proyectos.map(({ proyecto, indice }, lugar) => (
        <li key={proyecto.id} className="min-w-0">
          <ProjectRow
            proyecto={proyecto}
            indice={indice}
            abierta={lugar === Math.min(abierta, proyectos.length - 1)}
            onAbrir={() => setAbierta(lugar)}
            href={hrefDe(proyecto.slug)}
            encender={encenderDe?.(lugar)}
          />
        </li>
      ))}
    </ul>
  );
}
