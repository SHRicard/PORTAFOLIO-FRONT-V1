import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/cn";

interface TarjetaEleccionProps {
  /** Nombre del grupo de radios: una sola tarjeta del grupo queda elegida */
  grupo: string;
  valor: string;
  elegida: boolean;
  onElegir: () => void;
  nombre: string;
  descripcion: string;
  /** La muestra de lo que se elige */
  children: ReactNode;
}

/** Tarjeta de Apariencia para elegir una opción entre varias. Es un radio: anda con teclado. */
export function TarjetaEleccion({ grupo, valor, elegida, onElegir, nombre, descripcion, children }: TarjetaEleccionProps) {
  return (
    <label
      className={cn(
        "cursor-pointer space-y-3 rounded-card border p-3 transition-colors",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-secundario",
        elegida ? "border-primario ring-2 ring-primario/20" : "border-borde hover:border-primario/50",
      )}
    >
      <input type="radio" name={grupo} value={valor} checked={elegida} onChange={onElegir} className="sr-only" />
      {children}
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-texto">
          {nombre}
          {elegida && <CircleCheck className="size-4 text-secundario" aria-hidden />}
        </p>
        <p className="mt-0.5 text-sm text-texto-suave">{descripcion}</p>
      </div>
    </label>
  );
}
