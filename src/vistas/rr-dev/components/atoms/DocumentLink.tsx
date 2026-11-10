import { FileText } from "lucide-react";
import type { DocumentoEntrada } from "@/features/blog/types";
import { type ConUrl, dominio } from "@/vistas/rr-dev/blog";

/** Un PDF adjunto a una publicación: se abre en otra pestaña */
export function DocumentLink({ documento }: { documento: ConUrl<DocumentoEntrada> }) {
  return (
    <a
      href={documento.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 items-center gap-3 rounded-xl border border-texto/10 bg-texto/4 p-2.5 transition-colors hover:border-secundario/45"
    >
      <span aria-hidden className="grid size-9.5 shrink-0 place-items-center rounded-[10px] bg-rosa/14 text-rosa">
        <FileText className="size-4.5" />
      </span>
      <span className="grid min-w-0">
        <span className="truncate text-sm font-semibold text-texto">{documento.titulo}</span>
        <span className="text-xs text-texto-suave">PDF · {dominio(documento.url)}</span>
      </span>
    </a>
  );
}
