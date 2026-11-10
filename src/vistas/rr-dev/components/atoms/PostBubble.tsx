import { cva, type VariantProps } from "class-variance-authority";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const burbuja = cva(
  "relative block shrink-0 rounded-full p-0.5 transition-[scale,box-shadow] duration-500 ease-(--rebote) group-hover:scale-108",
  {
    variants: {
      tamano: { sm: "size-11", md: "size-15", lg: "size-19" },
    },
    defaultVariants: { tamano: "md" },
  },
);

interface PostBubbleProps extends VariantProps<typeof burbuja> {
  /** La portada. Sin portada queda el círculo vacío */
  src?: string;
  /** La que está al centro lleva el anillo de luz que gira, como la foto de Inicio */
  activa?: boolean;
  /** Con los segundos de espera, un anillo de luz late a su alrededor, como en la constelación de Inicio */
  pulso?: number;
}

/**
 * La portada de una publicación en un círculo, como las burbujas de la constelación de Inicio.
 * Es decorativa: el botón que la lleva dice cuál es. Crece al pasar por encima de ese botón (`group`)
 */
export function PostBubble({ src, activa = false, pulso, tamano }: PostBubbleProps) {
  const interior = "size-full rounded-full border-3 border-fondo";

  return (
    <span
      aria-hidden
      className={cn(burbuja({ tamano }), activa ? "anillo-foto" : "bg-borde", pulso !== undefined && "pulso-luz")}
      style={pulso === undefined ? undefined : ({ "--demora": `${pulso}s` } as CSSProperties)}
    >
      {src ? (
        <img src={src} alt="" loading="lazy" className={cn(interior, "block object-cover")} />
      ) : (
        <span className={cn(interior, "block bg-superficie")} />
      )}
    </span>
  );
}
