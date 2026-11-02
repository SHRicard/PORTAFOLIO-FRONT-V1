import { UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

interface PortraitFrameProps {
  /** Sin foto muestra un espacio reservado */
  src?: string;
  alt: string;
  /** Texto del espacio reservado */
  reservado: string;
}

/** Foto redonda con una luz que recorre el anillo. Ocupa el ancho de su contenedor. */
export function PortraitFrame({ src, alt, reservado }: PortraitFrameProps) {
  const interior = "size-full rounded-full border-4 border-fondo";

  return (
    <div className="anillo-foto aspect-square w-full rounded-full p-[3px]">
      {src ? (
        <img src={src} alt={alt} className={cn(interior, "block object-cover")} />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className={cn(interior, "flex flex-col items-center justify-center gap-0.5 bg-superficie text-texto-suave")}
        >
          <UserRound className="size-[34%]" strokeWidth={1.5} aria-hidden />
          <span aria-hidden className="text-xs leading-tight font-medium tracking-[.06em] uppercase">
            {reservado}
          </span>
        </div>
      )}
    </div>
  );
}
