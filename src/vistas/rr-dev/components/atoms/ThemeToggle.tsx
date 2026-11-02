import { useState } from "react";
import { Moon, SunDim } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { PALETAS } from "@/features/theme/paletas";
import { setPaleta } from "@/features/theme/themeSlice";
import { cn } from "@/lib/cn";

/** Pasa a la siguiente paleta. El icono muestra a dónde va: el sol vuelve a la más clara, la luna a la más oscura. */
export function ThemeToggle({ etiqueta }: { etiqueta: string }) {
  const dispatch = useAppDispatch();
  const paleta = useAppSelector((state) => state.theme.paleta);
  // Gira solo después de un clic, no al cargar la página
  const [giro, setGiro] = useState(false);

  const actual = PALETAS.findIndex(({ id }) => id === paleta);
  const siguiente = PALETAS[(actual + 1) % PALETAS.length];
  const Icono = actual === 0 ? SunDim : Moon;

  return (
    <button
      type="button"
      aria-label={`${etiqueta} ${siguiente.nombre}`}
      onClick={() => {
        dispatch(setPaleta(siguiente.id));
        setGiro(true);
      }}
      className="inline-flex size-11 items-center justify-center rounded-full text-texto-suave transition-colors hover:text-secundario"
    >
      <span key={paleta} className={cn("inline-flex", giro && "icono-girando")}>
        <Icono className="size-6" aria-hidden />
      </span>
    </button>
  );
}
