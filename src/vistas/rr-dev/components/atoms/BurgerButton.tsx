import type { Ref } from "react";
import { cn } from "@/lib/cn";

interface BurgerButtonProps {
  abierto: boolean;
  /** id del menú que abre */
  controla: string;
  etiquetas: { abrir: string; cerrar: string };
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}

/** Botón del menú de celular: tres líneas que se convierten en una X */
export function BurgerButton({ abierto, controla, etiquetas, onClick, ref }: BurgerButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={abierto ? etiquetas.cerrar : etiquetas.abrir}
      aria-expanded={abierto}
      aria-controls={controla}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded-full text-texto transition-colors hover:bg-primario/10"
    >
      <span aria-hidden className="hamburguesa relative block h-3.5 w-5">
        <span className={abierto ? "top-1.5 rotate-45" : "top-0"} />
        <span className={cn("top-1.5", abierto && "opacity-0")} />
        <span className={abierto ? "top-1.5 -rotate-45" : "top-3"} />
      </span>
    </button>
  );
}
