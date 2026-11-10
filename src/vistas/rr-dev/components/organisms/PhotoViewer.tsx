import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import type { ImagenEntrada } from "@/features/blog/types";
import type { ConUrl } from "@/vistas/rr-dev/blog";
import { TEXTOS_BLOG } from "@/vistas/rr-dev/contenido";

interface PhotoViewerProps {
  fotos: ConUrl<ImagenEntrada>[];
  indice: number;
  onCambiar: (indice: number) => void;
  onCerrar: () => void;
}

const redondo =
  "grid size-11 place-items-center rounded-full border border-texto/10 bg-superficie/80 text-texto transition-colors hover:bg-superficie";

/** Una foto de la publicación en grande, con su descripción. Las flechas pasan a la otra y Escape cierra */
export function PhotoViewer({ fotos, indice, onCambiar, onCerrar }: PhotoViewerProps) {
  const cerrar = useRef<HTMLButtonElement>(null);
  const foto = fotos[indice];
  const mover = useCallback(
    (paso: number) => onCambiar((indice + paso + fotos.length) % fotos.length),
    [indice, fotos.length, onCambiar],
  );

  // Abre con el foco en Cerrar y, al cerrar, vuelve a la foto que se tocó
  useEffect(() => {
    const antes = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    cerrar.current?.focus();
    return () => antes?.focus();
  }, []);

  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") onCerrar();
      if (fotos.length > 1 && evento.key === "ArrowRight") mover(1);
      if (fotos.length > 1 && evento.key === "ArrowLeft") mover(-1);
    };
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [onCerrar, mover, fotos.length]);

  if (!foto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={foto.alt}
      className="fixed inset-0 z-60 grid place-items-center bg-fondo/85 p-4 backdrop-blur-md"
      onClick={(evento) => evento.target === evento.currentTarget && onCerrar()}
    >
      <figure className="grid max-w-full justify-items-center gap-3">
        <img src={foto.url} alt={foto.alt} className="max-h-[calc(100dvh-11rem)] max-w-full rounded-2xl object-contain" />
        <figcaption className="max-w-[60ch] text-center text-sm text-texto-suave">
          {foto.alt} · {TEXTOS_BLOG.fotoDe(indice + 1, fotos.length)}
        </figcaption>
      </figure>

      {fotos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label={TEXTOS_BLOG.fotoAnterior}
            className={`${redondo} absolute bottom-6 left-4 md:top-1/2 md:bottom-auto md:left-6 md:-translate-y-1/2`}
          >
            <ChevronLeft className="size-5.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label={TEXTOS_BLOG.fotoSiguiente}
            className={`${redondo} absolute right-4 bottom-6 md:top-1/2 md:right-6 md:bottom-auto md:-translate-y-1/2`}
          >
            <ChevronRight className="size-5.5" aria-hidden />
          </button>
        </>
      )}

      <button
        ref={cerrar}
        type="button"
        onClick={onCerrar}
        aria-label={TEXTOS_BLOG.cerrar}
        className={`${redondo} absolute top-4 right-4 md:top-6 md:right-6`}
      >
        <X className="size-5.5" aria-hidden />
      </button>
    </div>
  );
}
