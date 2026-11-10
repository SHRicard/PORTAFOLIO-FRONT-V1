import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Link, type To } from "react-router";
import { cn } from "@/lib/cn";
import type { Paginacion } from "@/types/api";
import { numerosDePagina } from "@/vistas/rr-dev/blog";
import { TEXTOS_BLOG } from "@/vistas/rr-dev/contenido";

interface BlogPaginationProps {
  paginacion: Paginacion;
  /** El enlace a cada página */
  hrefDe: (pagina: number) => To;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
  /** Nombra la lista de páginas: por defecto, las del blog */
  etiqueta?: string;
}

const burbuja = "inline-grid h-9 min-w-9 place-items-center rounded-full border px-2 text-sm font-semibold tabular-nums";
/** Como las burbujas de los logos de Inicio: vidrio, y al pasar por encima crecen y se tiñen */
const tocable =
  "border-borde bg-superficie/75 text-texto-suave backdrop-blur-[10px] transition-[color,border-color,scale] duration-300 ease-(--rebote) hover:scale-108 hover:border-secundario/60 hover:text-secundario";

/**
 * El paginado con números, hecho de burbujas chicas, con «Página 1 de 3» arriba como el título de
 * «Lo que hago». La actual no es un enlace. Se ve aunque haya una sola página, con las flechas
 * apagadas: así se sabe que el blog pasa de página cuando hay más publicaciones. Proyectos lo usa
 * con su propia `etiqueta`
 */
export function BlogPagination({ paginacion, hrefDe, encender, etiqueta = TEXTOS_BLOG.paginas }: BlogPaginationProps) {
  const { page } = paginacion;
  const paginas = Math.max(1, paginacion.paginas);

  const flecha = (destino: number, Icono: LucideIcon, texto: string, rel: "prev" | "next") =>
    destino >= 1 && destino <= paginas ? (
      <Link to={hrefDe(destino)} rel={rel} aria-label={texto} className={cn(burbuja, tocable)}>
        <Icono className="size-4" aria-hidden />
      </Link>
    ) : (
      <span aria-disabled="true" className={cn(burbuja, "border-borde text-texto-suave opacity-30")}>
        <Icono className="size-4" aria-hidden />
      </span>
    );

  return (
    <nav aria-label={etiqueta} data-encender={encender} className="grid justify-items-center gap-2.5">
      <p className="paginado-rotulo text-center text-[0.8rem] font-medium tracking-[.24em] text-texto-suave uppercase">
        {TEXTOS_BLOG.paginaDeTotal(page, paginas)}
      </p>
      <ul className="flex items-center gap-1.5">
        <li>{flecha(page - 1, ChevronLeft, TEXTOS_BLOG.anterior, "prev")}</li>
        {numerosDePagina(page, paginas).map((numero, indice) => (
          <li key={numero === "…" ? `salto-${indice}` : numero}>
            {numero === "…" ? (
              <span aria-hidden className="px-0.5 text-texto-suave">
                …
              </span>
            ) : numero === page ? (
              <span
                aria-current="page"
                className={cn(
                  burbuja,
                  "border-transparent bg-primario text-primario-texto shadow-[0_0_18px_-4px_var(--secundario)]",
                )}
              >
                {numero}
              </span>
            ) : (
              <Link to={hrefDe(numero)} aria-label={TEXTOS_BLOG.pagina(numero)} className={cn(burbuja, tocable)}>
                {numero}
              </Link>
            )}
          </li>
        ))}
        <li>{flecha(page + 1, ChevronRight, TEXTOS_BLOG.siguiente, "next")}</li>
      </ul>
    </nav>
  );
}
