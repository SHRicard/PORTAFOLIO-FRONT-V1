import type { LucideIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** El ícono de la izquierda, que toma el color de acento al escribir */
  icono: LucideIcon;
  invalid?: boolean;
}

/**
 * Campo de vidrio con un ícono a la izquierda, para escribir sobre el cielo del login. Con React Hook
 * Form: <GlassInput icono={Mail} {...register("correo")} /> (en React 19 el ref viaja como prop)
 */
export function GlassInput({ icono: Icono, invalid, className, ...props }: GlassInputProps) {
  return (
    <div className="group relative">
      <Icono
        className="pointer-events-none absolute top-1/2 left-3.75 size-4.5 -translate-y-1/2 text-texto-suave transition-colors duration-300 group-focus-within:text-secundario"
        aria-hidden
      />
      <input
        aria-invalid={invalid || undefined}
        className={cn(
          "h-12 w-full rounded-xl border bg-superficie/55 pr-3.5 pl-11 text-[0.9375rem] text-texto outline-none backdrop-blur-md transition-[border-color,box-shadow] duration-300",
          "focus:border-secundario focus:ring-4 focus:ring-primario/22",
          invalid ? "border-peligro/70" : "border-texto/14",
          className,
        )}
        {...props}
      />
    </div>
  );
}
