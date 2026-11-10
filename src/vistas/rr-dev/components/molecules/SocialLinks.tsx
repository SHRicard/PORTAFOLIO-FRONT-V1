import { useId } from "react";
import type { Perfil } from "@/features/portafolio/types";
import { cn } from "@/lib/cn";
import { SocialIconButton } from "@/vistas/rr-dev/components/atoms/SocialIconButton";

interface SocialLinksProps {
  redes: Perfil["contacto"]["redes"];
  /** Texto de adelante. También nombra la lista */
  etiqueta: string;
  /** Texto escrito de arriba a abajo, una línea y los iconos en columna */
  vertical?: boolean;
}

/** Un enlace por red. Sin redes cargadas no dibuja nada. */
export function SocialLinks({ redes, etiqueta, vertical = false }: SocialLinksProps) {
  const etiquetaId = useId();

  if (redes.length === 0) return null;

  return (
    <div className={cn("flex items-center", vertical ? "flex-col gap-3" : "gap-4")}>
      {/* La lista lee esta etiqueta: se oculta acá para que no se anuncie dos veces */}
      <span
        id={etiquetaId}
        aria-hidden
        className={cn(
          "whitespace-nowrap text-texto-suave",
          vertical ? "text-xs font-medium tracking-[.2em] uppercase [writing-mode:vertical-rl]" : "text-[0.8rem]",
        )}
      >
        {etiqueta}
      </span>
      <span
        aria-hidden
        className={vertical ? "h-10 w-px bg-linear-to-b from-borde to-secundario" : "h-px w-8 bg-borde"}
      />
      <ul aria-labelledby={etiquetaId} className={cn("flex", vertical ? "flex-col gap-3" : "gap-2")}>
        {redes.map((red) => (
          <li key={red.url}>
            <SocialIconButton tipo={red.tipo} href={red.url} />
          </li>
        ))}
      </ul>
    </div>
  );
}
