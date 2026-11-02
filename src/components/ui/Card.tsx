import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const cardVariants = cva("rounded-card p-6", {
  variants: {
    tipo: {
      simple: "bg-superficie",
      borde: "border border-borde bg-fondo",
      sombra: "bg-fondo shadow-card",
      vidrio: "border border-borde/60 bg-fondo/60 shadow-card backdrop-blur-md",
      minimal: "bg-transparent",
    },
  },
  defaultVariants: { tipo: "borde" },
});

export type CardTipo = NonNullable<VariantProps<typeof cardVariants>["tipo"]>;
export const CARD_TIPOS: CardTipo[] = ["simple", "borde", "sombra", "vidrio", "minimal"];

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export function Card({ className, tipo, ...props }: CardProps) {
  return <div className={cn(cardVariants({ tipo }), className)} {...props} />;
}
