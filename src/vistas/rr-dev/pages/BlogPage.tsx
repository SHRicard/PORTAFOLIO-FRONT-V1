import { type ReactNode, useCallback, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useGetPaginaBlogQuery } from "@/features/blog/blogApi";
import { useGetPerfilQuery } from "@/features/portafolio/portafolioApi";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/errors";
import { busquedaDelBlog, paginaDe, POR_PAGINA, temasDe } from "@/vistas/rr-dev/blog";
import { BlogPagination } from "@/vistas/rr-dev/components/molecules/BlogPagination";
import { PostBubbleRow } from "@/vistas/rr-dev/components/molecules/PostBubbleRow";
import { PostConstellation } from "@/vistas/rr-dev/components/molecules/PostConstellation";
import { PostSpotlight } from "@/vistas/rr-dev/components/molecules/PostSpotlight";
import { TechMarquee } from "@/vistas/rr-dev/components/molecules/TechMarquee";
import { PostReader } from "@/vistas/rr-dev/components/organisms/PostReader";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";
import { TEXTOS_BLOG } from "@/vistas/rr-dev/contenido";

/** Al entrar al apartado, en ms: el centro, la constelación de cada lado, la fila del celular, el paginado y los temas */
const ENCENDIDO = { centro: 0, izquierda: 670, derecha: 1100, fila: 1500, paginado: 2400, temas: 2700 };

/** Un aviso en el medio de la pantalla: cargando, error o sin publicaciones */
function Aviso({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-full place-items-center">
      <div className="vidrio grid justify-items-center gap-3 rounded-3xl px-8 py-10 text-center text-texto-suave">
        {children}
      </div>
    </div>
  );
}

/**
 * El blog como la constelación de Inicio, sobre el espacio visto desde Saturno: una publicación al
 * centro y las demás de la página alrededor, tres de cada lado, unidas por líneas finas. Tocar una la
 * pasa al centro. Abajo, el paginado del backend (de a 6) y los temas en el carrusel de «Lo que hago».
 * Ocupa justo el alto de la pantalla, sin scroll: si falta lugar se achica la foto del centro. Una
 * publicación se lee en un panel encima (`?leer=`), y `/blog/:slug` abre la misma página con ella
 * abierta. En celular, las de alrededor son una fila de burbujas. El espacio lo pone `SpaceScene`
 */
export default function BlogPage() {
  const { slug } = useParams();
  const [busqueda] = useSearchParams();
  const navegar = useNavigate();
  const pagina = paginaDe(busqueda.get("pagina"));
  const leyendo = slug ?? busqueda.get("leer") ?? undefined;
  // La que se tocó para el centro. Vale solo en su página: en otra, el centro vuelve a la primera
  const [elegida, setElegida] = useState<{ pagina: number; slug: string }>();

  const { data, error, isFetching } = useGetPaginaBlogQuery({ page: pagina, limit: POR_PAGINA });
  const { data: perfil } = useGetPerfilQuery();

  const entradas = data?.entradas ?? [];
  // La página de lo que se ve: mientras llega la siguiente, sigue la anterior
  const vista = data?.paginacion.page ?? pagina;
  const eligio = elegida?.pagina === vista ? elegida.slug : undefined;
  const alCentro = entradas.find((entrada) => entrada.slug === eligio) ?? entradas[0];
  const elegir = useCallback((aElegir: string) => setElegida({ pagina: vista, slug: aElegir }), [vista]);

  const hrefLeer = (aLeer: string) => ({ pathname: "/blog", search: busquedaDelBlog(pagina, aLeer) });
  const hrefPagina = (numero: number) => ({ pathname: "/blog", search: busquedaDelBlog(numero) });

  // Saca la publicación de la URL sin mover la página; desde /blog/:slug vuelve al blog
  const cerrarLector = useCallback(
    () => navegar({ pathname: "/blog", search: busquedaDelBlog(pagina) }, { replace: !slug, preventScrollReset: true }),
    [navegar, pagina, slug],
  );

  let escena: ReactNode;
  if (error) {
    escena = (
      <Aviso>
        <Alert tipo="error">{getErrorMessage(error)}</Alert>
      </Aviso>
    );
  } else if (!data) {
    escena = (
      <Aviso>
        <Spinner />
      </Aviso>
    );
  } else if (!alCentro) {
    escena = (
      <Aviso>
        <p>{pagina > 1 ? TEXTOS_BLOG.sinPagina : TEXTOS_BLOG.vacio}</p>
        {pagina > 1 && (
          <Link to={hrefPagina(1)} className="font-semibold text-secundario hover:underline">
            {TEXTOS_BLOG.irAlPrincipio}
          </Link>
        )}
      </Aviso>
    );
  } else {
    const temas = temasDe(entradas);
    escena = (
      // Cada página se monta de nuevo: así se encienden sus burbujas y se trazan sus líneas. Las
      // columnas no crecen con su contenido: el carrusel de temas las estiraría más que la pantalla
      <div key={vista} className="grid h-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto] gap-4">
        <div className="grid min-h-0 grid-cols-1 items-center [--etiqueta:140px] xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)_minmax(0,1fr)] xl:gap-x-7 min-[106.25rem]:grid-cols-[minmax(0,1fr)_minmax(0,41.25rem)_minmax(0,1fr)] min-[106.25rem]:gap-x-12 min-[106.25rem]:[--etiqueta:190px]">
          <div className="hidden justify-end xl:flex">
            <PostConstellation
              entradas={entradas.slice(0, 3)}
              lado="izquierda"
              elegida={alCentro.slug}
              onElegir={elegir}
              encender={ENCENDIDO.izquierda}
            />
          </div>

          <PostSpotlight
            key={alCentro.slug}
            entrada={alCentro}
            href={hrefLeer(alCentro.slug)}
            ultima={vista === 1 && alCentro === entradas[0]}
            encender={eligio ? undefined : ENCENDIDO.centro}
          />

          <div className="hidden justify-start xl:flex">
            <PostConstellation
              entradas={entradas.slice(3, 6)}
              lado="derecha"
              elegida={alCentro.slug}
              onElegir={elegir}
              encender={ENCENDIDO.derecha}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 justify-items-center gap-3 empty:hidden">
          {entradas.length > 1 && (
            <div className="xl:hidden">
              <PostBubbleRow entradas={entradas} elegida={alCentro.slug} onElegir={elegir} encender={ENCENDIDO.fila} />
            </div>
          )}
          <BlogPagination paginacion={data.paginacion} hrefDe={hrefPagina} encender={ENCENDIDO.paginado} />
          {temas.length > 0 && (
            <div className="temas-blog w-full max-w-245" data-encender={ENCENDIDO.temas}>
              <TechMarquee items={temas} etiqueta={TEXTOS_BLOG.temas} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <SectionReveal>
      <h1 className="sr-only">{TEXTOS_BLOG.titulo}</h1>

      {/*
        El alto de la pantalla menos la barra (5rem) y la mitad del margen de la página, que se
        recupera con -my-6: así entra todo sin scroll
      */}
      <section
        aria-label={TEXTOS_BLOG.publicaciones}
        aria-busy={isFetching}
        className={cn(
          "escena-blog -my-6 h-[calc(100dvh-8rem)] transition-opacity duration-300",
          isFetching && data && "opacity-60",
        )}
      >
        {escena}
      </section>

      {leyendo && (
        <PostReader key={leyendo} slug={leyendo} foto={perfil?.foto} rol={perfil?.rol} onCerrar={cerrarLector} />
      )}
    </SectionReveal>
  );
}
