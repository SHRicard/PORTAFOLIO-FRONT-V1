import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const titleVariants = cva("font-titulo font-bold tracking-tight text-texto", {
  variants: {
    tamano: { sm: "text-xl", md: "text-2xl", lg: "text-4xl", xl: "text-5xl" },
  },
  defaultVariants: { tamano: "md" },
});

type TitleProps = HTMLAttributes<HTMLHeadingElement> & VariantProps<typeof titleVariants> & { as?: "h1" | "h2" | "h3" };

/** Título con la fuente de títulos del tema */
export function Title({ as: Tag = "h1", tamano, className, ...props }: TitleProps) {
  return <Tag className={cn(titleVariants({ tamano }), className)} {...props} />;
}

/** Subtítulo con la fuente de subtítulos del tema */
export function Subtitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-subtitulo text-lg text-texto-suave", className)} {...props} />;
}
