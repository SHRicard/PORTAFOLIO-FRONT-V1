import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, Info } from "lucide-react";
import { cn } from "@/lib/cn";

const alertVariants = cva("flex items-start gap-2 rounded-boton border p-3 text-sm", {
  variants: {
    tipo: {
      error: "border-peligro/40 bg-peligro/10 text-peligro",
      info: "border-borde bg-superficie text-texto",
    },
  },
  defaultVariants: { tipo: "info" },
});

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

export function Alert({ className, tipo, children, ...props }: AlertProps) {
  const Icon = tipo === "error" ? CircleAlert : Info;
  return (
    <div role={tipo === "error" ? "alert" : "status"} className={cn(alertVariants({ tipo }), className)} {...props}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
