import type { CSSProperties } from "react";
import type { EntradaResumen } from "@/features/blog/types";
import { fechaLarga } from "@/features/portafolio/formato";
import { cn } from "@/lib/cn";
import { fotosDe } from "@/vistas/rr-dev/blog";
import { PostBubble } from "@/vistas/rr-dev/components/atoms/PostBubble";
import { TEXTOS_BLOG } from "@/vistas/rr-dev/contenido";

/** Tamaño de la caja del arco, en píxeles. Los nombres van afuera, al costado de cada burbuja */
const ANCHO = 150;
const ALTO = 340;

/**
 * Centros de las burbujas del lado izquierdo: un arco "(" que abre hacia el centro, como la
 * constelación de Inicio. La del medio es más grande. El lado derecho lo espeja
 */
const PUNTOS = [
  { x: 114, y: 34, tamano: "md", radio: 30 },
  { x: 38, y: 170, tamano: "lg", radio: 38 },
  { x: 114, y: 306, tamano: "md", radio: 30 },
] as const;

/** Lo que separa cada burbuja de su nombre, en píxeles */
const HUECO = 12;
/** Segundos entre los anillos de luz que laten en las burbujas */
const PASO_PULSO = 1.2;
/** Al entrar al apartado: ms entre una burbuja y la siguiente, y cuánto después de la primera empieza la línea */
const PASO_ENCENDIDO = 800;
const DEMORA_LINEA = 730;

interface PostConstellationProps {
  /** Hasta tres publicaciones, de arriba a abajo */
  entradas: EntradaResumen[];
  /** Lado de la página en el que va: el arco abre hacia el centro */
  lado: "izquierda" | "derecha";
  /** El slug de la que está al centro: su burbuja lleva el anillo de luz */
  elegida?: string;
  /** Al tocar una, pasa al centro */
  onElegir: (slug: string) => void;
  /** Los ms en que se enciende la primera burbuja al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/**
 * Las publicaciones de un costado como la constelación de Inicio: burbujas con su portada, unidas
 * por una línea fina, con la fecha y el título al lado. El ancho de los nombres sale de `--etiqueta`
 */
export function PostConstellation({ entradas, lado, elegida, onElegir, encender }: PostConstellationProps) {
  const izquierda = lado === "izquierda";
  const visibles = entradas.slice(0, PUNTOS.length);
  const puntos = PUNTOS.slice(0, visibles.length).map((punto) => ({
    ...punto,
    x: izquierda ? punto.x : ANCHO - punto.x,
  }));

  return (
    <div className="relative shrink-0" style={{ width: `calc(var(--etiqueta) + ${HUECO + ANCHO}px)`, height: ALTO }}>
      <svg
        aria-hidden
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className={cn("absolute top-0 overflow-visible text-secundario", izquierda ? "right-0" : "left-0")}
        style={{ width: ANCHO, height: ALTO }}
      >
        <polyline
          points={puntos.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1}
          data-trazar={encender === undefined ? undefined : encender + DEMORA_LINEA}
          data-durante={PASO_ENCENDIDO * (visibles.length - 1)}
        />
      </svg>
      <ul aria-label={TEXTOS_BLOG.deEstaPagina}>
        {visibles.map((entrada, indice) => {
          const { x, y, tamano, radio } = puntos[indice]!;
          const activa = entrada.slug === elegida;
          const [portada] = fotosDe(entrada);
          // Arranca en el borde de afuera de la burbuja: así su centro cae justo en el punto del arco
          const lugar: CSSProperties = izquierda ? { right: ANCHO - x - radio, top: y } : { left: x - radio, top: y };

          return (
            <li
              key={entrada.id}
              className="absolute -translate-y-1/2"
              style={lugar}
              data-encender={encender === undefined ? undefined : encender + indice * PASO_ENCENDIDO}
            >
              <button
                type="button"
                aria-pressed={activa}
                onClick={() => onElegir(entrada.slug)}
                className={cn("group flex items-center text-left", izquierda && "flex-row-reverse text-right")}
                style={{ gap: HUECO }}
              >
                <PostBubble src={portada?.url} tamano={tamano} activa={activa} pulso={indice * PASO_PULSO} />
                {/* La sombra los despega de los anillos de Saturno, que pasan por detrás */}
                <span className="sombra-texto grid w-(--etiqueta) gap-0.5">
                  {entrada.publicadoEn && (
                    <span className="text-xs text-texto-suave">{fechaLarga(entrada.publicadoEn)}</span>
                  )}
                  <span
                    className={cn(
                      "line-clamp-2 text-[0.8125rem] leading-snug font-semibold transition-colors duration-500 min-[106.25rem]:text-sm",
                      activa ? "text-secundario" : "text-texto",
                    )}
                  >
                    {entrada.titulo}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
