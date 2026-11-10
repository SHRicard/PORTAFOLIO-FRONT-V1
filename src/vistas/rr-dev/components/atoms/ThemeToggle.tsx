import { useState } from "react";
import { Moon, SunDim } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTemaVista } from "@/vistas/useTemaVista";

/**
 * Pasa al siguiente modo de mi.universo. El icono muestra a dónde va: el sol vuelve al primero,
 * la luna sigue. Cambia solo este portafolio: ni el panel ni los demás portafolios se enteran.
 * Con un solo modo no se dibuja
 */
export function ThemeToggle({ etiqueta }: { etiqueta: string }) {
  const { modo, modos, cambiarModo } = useTemaVista();
  // Gira solo después de un clic, no al cargar la página
  const [giro, setGiro] = useState(false);

  if (modos.length < 2) return null;

  const actual = modos.indexOf(modo);
  const siguiente = modos[(actual + 1) % modos.length]!;
  const Icono = actual === 0 ? SunDim : Moon;

  return (
    <button
      type="button"
      aria-label={`${etiqueta} ${siguiente.nombre}`}
      onClick={() => {
        cambiarModo(siguiente.id);
        setGiro(true);
      }}
      className="inline-flex size-11 items-center justify-center rounded-full text-texto-suave transition-colors hover:text-secundario"
    >
      <span key={modo.id} className={cn("inline-flex", giro && "icono-girando")}>
        <Icono className="size-6" aria-hidden />
      </span>
    </button>
  );
}
