import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/** Con React Hook Form: <Input {...register("campo")} /> (en React 19 el ref viaja como prop) */
export function Input({ className, invalid, ...props }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cn(
        "h-10 w-full rounded-boton border bg-fondo px-3 text-sm text-texto outline-none transition-colors",
        "placeholder:text-texto-suave focus:border-primario focus:ring-2 focus:ring-primario/20",
        invalid ? "border-peligro" : "border-borde",
        className,
      )}
      {...props}
    />
  );
}
