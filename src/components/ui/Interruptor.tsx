import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface InterruptorProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  titulo: string;
  descripcion?: string;
  /** Un ícono chico antes del título, con su color */
  icono?: ReactNode;
}

/**
 * Un sí o no con forma de interruptor. Por dentro es una casilla (role="switch"), así que con
 * React Hook Form se usa igual: <Interruptor titulo="Destacado" {...register("destacado")} />
 */
export function Interruptor({ titulo, descripcion, icono, className, ...props }: InterruptorProps) {
  return (
    <label
      className={cn(
        "flex min-h-14.5 cursor-pointer items-center justify-between gap-4 rounded-card border border-texto/15 bg-fondo px-4 py-3",
        "transition-colors duration-300 hover:border-texto/26",
        "has-focus-visible:border-primario has-focus-visible:ring-4 has-focus-visible:ring-primario/16",
        className,
      )}
    >
      <span className="grid min-w-0 gap-0.5">
        <span className="flex items-center gap-2 text-sm font-medium text-texto">
          {icono}
          {titulo}
        </span>
        {descripcion && <span className="text-xs text-texto-suave">{descripcion}</span>}
      </span>
      <input type="checkbox" role="switch" className="peer sr-only" {...props} />
      <span
        aria-hidden
        className={cn(
          "relative h-6 w-10.5 shrink-0 rounded-full bg-borde transition-colors duration-500 peer-checked:bg-primario",
          "after:absolute after:top-0.75 after:left-0.75 after:size-4.5 after:rounded-full after:bg-texto-suave peer-checked:after:bg-primario-texto",
          "after:transition-[translate] after:duration-500 after:ease-[cubic-bezier(0.2,0.8,0.2,1)] peer-checked:after:translate-x-4.5",
        )}
      />
    </label>
  );
}
