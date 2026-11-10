import { ArrowRight, Images } from "lucide-react";
import type { CSSProperties } from "react";
import { Link, type To } from "react-router";
import type { EntradaResumen } from "@/features/blog/types";
import { fechaLarga } from "@/features/portafolio/formato";
import { cn } from "@/lib/cn";
import { fotosDe, partesDelTitulo } from "@/vistas/rr-dev/blog";
import { GradientText } from "@/vistas/rr-dev/components/atoms/GradientText";
import { Hashtags } from "@/vistas/rr-dev/components/atoms/Hashtags";
import { HeroBadge } from "@/vistas/rr-dev/components/atoms/HeroBadge";
import { TEXTOS_BLOG } from "@/vistas/rr-dev/contenido";

/** Cuándo se enciende cada pieza al entrar, en ms después de `encender` */
const ENCENDIDO = { foto: 0, insignias: 430, titulo: 700, resumen: 1000, acciones: 1300 };

interface PostSpotlightProps {
  entrada: EntradaResumen;
  /** Adónde lleva: la abre en el panel de lectura */
  href: To;
  /** La más nueva del blog lleva el aviso de «Lo último» */
  ultima?: boolean;
  /**
   * Los ms en que se enciende al entrar al apartado (ver `useEncendido`). Sin ellos, como al elegir
   * otra publicación, las piezas aparecen de a una con un fundido corto
   */
  encender?: number;
}

/**
 * La publicación del centro de la constelación: la foto con la luz que recorre su borde, la fecha,
 * el título con el degradado de Inicio, el resumen, los temas y el botón para leerla
 */
export function PostSpotlight({ entrada, href, ultima = false, encender }: PostSpotlightProps) {
  const fotos = fotosDe(entrada);
  const [portada] = fotos;
  const [antes, conDegradado] = partesDelTitulo(entrada.titulo);
  const cambio = encender === undefined;
  // Al entrar, cada pieza se enciende a su hora; al cambiar de publicación, se funden en cadena
  const aparecer = (pieza: keyof typeof ENCENDIDO, orden: number) =>
    cambio ? { style: { "--orden": orden } as CSSProperties } : { "data-encender": encender + ENCENDIDO[pieza] };

  return (
    <article className="foco flex min-w-0 flex-col items-center gap-3.5 text-center">
      {/* El mismo enlace que el botón de leer: con el mouse se toca la foto, con el teclado basta el botón */}
      <Link
        to={href}
        preventScrollReset
        tabIndex={-1}
        aria-hidden
        {...aparecer("foto", 0)}
        className={cn(
          "foco-foto borde-luz group relative block aspect-video overflow-hidden rounded-[22px] bg-superficie shadow-[0_30px_60px_-30px_color-mix(in_srgb,var(--primario)_60%,transparent)]",
          cambio && "cambio-suave",
        )}
      >
        {portada && (
          <img
            src={portada.url}
            alt=""
            className="size-full object-cover transition-[scale] duration-700 ease-(--salida) group-hover:scale-103"
          />
        )}
        {fotos.length > 1 && (
          <span className="absolute top-3 right-3 z-2 inline-flex items-center gap-1.5 rounded-full bg-superficie/70 px-2.5 py-1 text-xs font-semibold text-texto backdrop-blur-sm">
            <Images className="size-3.5" aria-hidden />
            {fotos.length}
          </span>
        )}
      </Link>

      <div {...aparecer("insignias", 1)} className={cn("flex flex-wrap justify-center gap-2.5", cambio && "cambio-suave")}>
        {ultima && (
          <span className="inline-flex items-center gap-2 rounded-full border border-secundario/40 bg-primario/14 px-4 py-1.5 text-sm font-medium text-texto backdrop-blur-sm">
            <span aria-hidden className="size-2 rounded-full bg-secundario shadow-[0_0_10px_var(--secundario)]" />
            {TEXTOS_BLOG.loUltimo}
          </span>
        )}
        {entrada.publicadoEn && <HeroBadge etiqueta={fechaLarga(entrada.publicadoEn)} />}
        {fotos.length > 1 && <span className="sr-only">{TEXTOS_BLOG.fotos(fotos.length)}</span>}
      </div>

      <h2
        {...aparecer("titulo", 2)}
        className={cn(
          "max-w-[30ch] font-titulo text-[length:clamp(1.375rem,3.6cqh,2.375rem)] leading-[1.14] font-bold tracking-[-0.02em] text-balance max-xl:text-[1.375rem]",
          cambio && "cambio-suave",
        )}
      >
        {antes && `${antes} `}
        <GradientText>{conDegradado}</GradientText>
      </h2>

      <p
        {...aparecer("resumen", 3)}
        className={cn(
          "sombra-texto line-clamp-2 max-w-[62ch] text-[length:clamp(0.906rem,1.7cqh,1.0625rem)] leading-relaxed text-texto",
          cambio && "cambio-suave",
        )}
      >
        {entrada.resumen}
      </p>

      <div
        {...aparecer("acciones", 4)}
        className={cn("flex flex-wrap items-center justify-center gap-x-5 gap-y-3", cambio && "cambio-suave")}
      >
        <Hashtags etiquetas={entrada.etiquetas.slice(0, 3)} className="foco-temas sombra-texto justify-center" />
        <Link
          to={href}
          preventScrollReset
          className="inline-flex items-center gap-2 rounded-full bg-primario px-4.5 py-2.5 text-sm font-semibold whitespace-nowrap text-primario-texto transition-colors hover:bg-primario-hover"
        >
          {TEXTOS_BLOG.leer}
          <span className="sr-only">: {entrada.titulo}</span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
