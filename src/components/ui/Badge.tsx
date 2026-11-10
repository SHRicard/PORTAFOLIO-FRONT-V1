import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva("inline-flex items-center rounded-boton px-2 py-0.5 text-xs font-medium", {
  variants: {
    estilo: {
      neutro: "border border-borde bg-superficie text-texto-suave",
      primario: "bg-primario/10 text-secundario",
      peligro: "bg-peligro/10 text-peligro",
      aviso: "bg-aviso/10 text-aviso",
    },
  },
  defaultVariants: { estilo: "neutro" },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, estilo, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ estilo }), className)} {...props} />;
}
