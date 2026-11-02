import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CasillaProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
}

/** Casilla de verificación. Con React Hook Form: <Casilla label="..." {...register("campo")} /> */
export function Casilla({ label, className, ...props }: CasillaProps) {
  return (
    <label className={cn("flex items-center gap-2 text-sm text-texto", className)}>
      <input type="checkbox" className="size-4 accent-primario" {...props} />
      {label}
    </label>
  );
}
