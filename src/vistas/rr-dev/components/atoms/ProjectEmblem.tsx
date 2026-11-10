import { cn } from "@/lib/cn";
import type { Proyecto } from "@/features/portafolio/types";
import { iniciales } from "@/vistas/rr-dev/proyectos";

interface ProjectEmblemProps {
  proyecto: Pick<Proyecto, "titulo" | "galeria">;
  className?: string;
  /** Solo las iniciales, aunque tenga portada: en el panel la portada ya va grande, arriba */
  soloIniciales?: boolean;
}

/**
 * El emblema de un proyecto: un anillo del color del proyecto (`--tono`) con la luz que gira, como el
 * de la foto de Inicio. Adentro va la portada, o sus iniciales mientras no tenga una (o con `soloIniciales`).
 * Mide `--emblema`.
 * Es decorativo: el título va al lado
 */
export function ProjectEmblem({ proyecto, className, soloIniciales = false }: ProjectEmblemProps) {
  const portada = soloIniciales ? undefined : proyecto.galeria[0]; // en la web pública todas tienen URL
  return (
    <span
      aria-hidden
      className={cn("anillo-proyecto grid size-(--emblema) shrink-0 place-items-center rounded-full p-0.5", className)}
    >
      {portada ? (
        <img src={portada.url} alt="" className="size-full rounded-full object-cover" />
      ) : (
        <span className="grid size-full place-items-center rounded-full bg-superficie font-titulo text-[length:calc(var(--emblema)*0.3)] font-bold tracking-[-0.02em] text-(--tono)">
          {iniciales(proyecto.titulo)}
        </span>
      )}
    </span>
  );
}
