import type { InputHTMLAttributes } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CasillaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

/**
 * Casilla de verificación: un cuadrado redondeado que se llena de violeta con un tilde.
 * Con React Hook Form: <Casilla label="..." {...register("campo")} />
 */
export function Casilla({ label, className, ...props }: CasillaProps) {
  return (
    <label className={cn("flex w-fit cursor-pointer items-center gap-2.5 text-sm text-texto", className)}>
      <span className="relative grid size-5 shrink-0 place-items-center">
        <input
          type="checkbox"
          className={cn(
            "peer size-5 cursor-pointer appearance-none rounded-md border border-texto/22 bg-fondo transition-colors duration-300",
            "hover:border-texto/40 checked:border-primario checked:bg-primario",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secundario",
          )}
          {...props}
        />
        <Check
          aria-hidden
          strokeWidth={3}
          className="pointer-events-none absolute size-3.5 text-primario-texto opacity-0 transition-opacity duration-300 peer-checked:opacity-100"
        />
      </span>
      {label}
    </label>
  );
}
