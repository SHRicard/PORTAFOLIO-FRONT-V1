import type { EntradaResumen } from "@/features/blog/types";
import { fotosDe } from "@/vistas/rr-dev/blog";
import { PostBubble } from "@/vistas/rr-dev/components/atoms/PostBubble";
import { TEXTOS_BLOG } from "@/vistas/rr-dev/contenido";

/** Al entrar al apartado se encienden de a una, cada 230 ms: como la fila de logos de Inicio en celular */
const PASO_ENCENDIDO = 230;

interface PostBubbleRowProps {
  entradas: EntradaResumen[];
  /** El slug de la que está al centro: su burbuja lleva el anillo de luz */
  elegida?: string;
  /** Al tocar una, pasa al centro */
  onElegir: (slug: string) => void;
  /** Los ms en que se enciende la primera al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/** En pantallas sin lugar a los costados, la constelación pasa a ser una fila de burbujas debajo de la del centro */
export function PostBubbleRow({ entradas, elegida, onElegir, encender }: PostBubbleRowProps) {
  return (
    <ul aria-label={TEXTOS_BLOG.deEstaPagina} className="flex flex-wrap justify-center gap-2.5">
      {entradas.map((entrada, indice) => {
        const [portada] = fotosDe(entrada);
        return (
          <li key={entrada.id} data-encender={encender === undefined ? undefined : encender + indice * PASO_ENCENDIDO}>
            <button
              type="button"
              aria-pressed={entrada.slug === elegida}
              aria-label={TEXTOS_BLOG.ver(entrada.titulo)}
              title={entrada.titulo}
              onClick={() => onElegir(entrada.slug)}
              className="group block rounded-full"
            >
              <PostBubble src={portada?.url} tamano="sm" activa={entrada.slug === elegida} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
