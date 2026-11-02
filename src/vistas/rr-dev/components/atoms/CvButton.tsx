import { Download } from "lucide-react";
import { cn } from "@/lib/cn";

interface CvButtonProps {
  /** Sin CV cargado en el perfil, el botón se ve pero queda deshabilitado */
  href?: string;
  etiqueta: string;
  anchoCompleto?: boolean;
}

/** Con tinte violeta y una banda de luz que lo cruza; violeta sólido al pasar por encima */
export function CvButton({ href, etiqueta, anchoCompleto = false }: CvButtonProps) {
  const clases = cn(
    "boton-cv relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg border border-primario/50 bg-primario/12 font-medium whitespace-nowrap text-texto",
    anchoCompleto ? "w-full px-6 py-3" : "px-4 py-2 text-sm",
  );
  const contenido = (
    <>
      {etiqueta}
      <Download className="size-4" aria-hidden />
    </>
  );

  if (!href) {
    return (
      <button type="button" disabled className={cn(clases, "cursor-not-allowed opacity-60")}>
        {contenido}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      className={cn(clases, "transition-colors hover:border-primario hover:bg-primario hover:text-primario-texto")}
    >
      {contenido}
    </a>
  );
}
