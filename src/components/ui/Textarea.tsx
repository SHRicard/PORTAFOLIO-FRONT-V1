import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** Con React Hook Form: <Textarea {...register("campo")} /> */
export function Textarea({ className, invalid, rows = 4, ...props }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "w-full rounded-boton border bg-fondo px-3 py-2 text-sm text-texto outline-none transition-colors",
        "placeholder:text-texto-suave focus:border-primario focus:ring-2 focus:ring-primario/20",
        invalid ? "border-peligro" : "border-borde",
        className,
      )}
      {...props}
    />
  );
}
