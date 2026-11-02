import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ className, invalid, children, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-boton border bg-fondo px-3 text-sm text-texto outline-none transition-colors",
        "focus:border-primario focus:ring-2 focus:ring-primario/20",
        invalid ? "border-peligro" : "border-borde",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
