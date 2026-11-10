import { useCallback, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Title } from "@/components/ui/Typography";
import { useGetProyectosQuery } from "@/features/portafolio/portafolioApi";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/errors";
import { paginaDe } from "@/vistas/rr-dev/blog";
import { PASOS, PLANETAS } from "@/vistas/rr-dev/camara";
import { GradientText } from "@/vistas/rr-dev/components/atoms/GradientText";
import { BlogPagination } from "@/vistas/rr-dev/components/molecules/BlogPagination";
import { ProjectList } from "@/vistas/rr-dev/components/molecules/ProjectList";
import { ProjectReader } from "@/vistas/rr-dev/components/organisms/ProjectReader";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";
import { TEXTOS_PROYECTOS } from "@/vistas/rr-dev/contenido";
import { useLugaresProyectos } from "@/vistas/rr-dev/hooks/useLugaresProyectos";
import { useSobrePlaneta } from "@/vistas/rr-dev/hooks/useSobrePlaneta";
import {
  busquedaDeProyectos,
  paginasDeProyectos,
  porPaginaDe,
  proyectosDeLaPagina,
  repartirProyectos,
} from "@/vistas/rr-dev/proyectos";

/**
 * Al entrar al apartado, en ms, con los tiempos de Habilidades: el título, la cuenta, la frase, la
 * primera ficha y el paginado. Las fichas se encienden de a una, alternando los costados
 */
const ENCENDIDO = { titulo: 0, cuenta: 430, frase: 1000, fichas: 1400, entreFichas: 160, paginado: 3300 };

/**
 * Los planetas que se ven en este apartado: Marte, de cerca, la Tierra en el medio de la pantalla, y
 * Venus y Mercurio al lado del sol. Lo que cae encima de uno lleva un vidrio oscuro
 */
const PLANETAS_DETRAS = PLANETAS.slice(0, (PASOS["/proyectos"] ?? 3) + 1).map(({ clase }) => clase);

/**
 * Proyectos como Sobre mí y Habilidades, sobre el espacio visto desde Marte. Al centro, arriba, el
 * título, cuántos proyectos hay y una frase: que escucho ideas y las convierto en soluciones. Debajo
 * queda libre para la Tierra y la Luna, que en este apartado están en el medio de la pantalla. Los
 * proyectos van en fichas, con una abierta en cada costado: desde `xl`, a la izquierda desde arriba
 * y a la derecha debajo del sol, Mercurio y Venus. Cuántas entran depende de la pantalla
 * (`useLugaresProyectos`); las demás van al paginado, abajo en el centro (`?pagina=`). «Ver
 * proyecto» lo abre en el panel del blog (`?ver=`), y `/proyectos/:slug` abre la misma página con él abierto.
 * Ocupa justo el alto de la pantalla, sin scroll.
 * Debajo de `xl`, el texto va arriba y las fichas debajo: en dos listas en una tableta y en una en
 * el celular
 */
export default function ProyectosPage() {
  const escena = useRef<HTMLDivElement>(null);
  const { slug } = useParams();
  const [busqueda] = useSearchParams();
  const navegar = useNavigate();
  const { data: proyectos, error } = useGetProyectosQuery();
  const lugares = useLugaresProyectos();
  useSobrePlaneta(escena, PLANETAS_DETRAS);

  const lista = proyectos ?? [];
  const porPagina = porPaginaDe(lugares);
  const paginas = paginasDeProyectos(lista.length, porPagina);
  const pagina = Math.min(paginaDe(busqueda.get("pagina")), paginas);
  const { izquierda, derecha } = repartirProyectos(proyectosDeLaPagina(lista, pagina, porPagina), lugares);
  const ver = slug ?? busqueda.get("ver") ?? undefined;
  const abierto = lista.findIndex(({ slug }) => slug === ver);

  const hrefPagina = (numero: number) => ({ pathname: "/proyectos", search: busquedaDeProyectos(numero) });
  const hrefVer = (slug: string) => ({ pathname: "/proyectos", search: busquedaDeProyectos(pagina, slug) });
  // Saca el proyecto de la URL sin mover la página; desde /proyectos/:slug vuelve a Proyectos
  const cerrar = useCallback(
    () =>
      navegar(
        { pathname: "/proyectos", search: busquedaDeProyectos(pagina) },
        { replace: !slug, preventScrollReset: true },
      ),
    [navegar, pagina, slug],
  );
  // La izquierda y la derecha se turnan: la 1.ª de la izquierda, la 1.ª de la derecha, la 2.ª de la izquierda...
  const encenderDe = (costado: 0 | 1) => (lugar: number) =>
    ENCENDIDO.fichas + (2 * lugar + costado) * ENCENDIDO.entreFichas;
  // Al cambiar de página o de pantalla, cada costado vuelve a abrir su primera ficha
  const llave = `${pagina}-${porPagina}`;

  return (
    <SectionReveal>
      {/*
        El alto de la pantalla menos la barra (5rem) y la mitad del margen de la página, que se
        recupera con -my-6: así entra todo sin scroll, como Habilidades
      */}
      <div ref={escena} className={cn("escena-proyectos -my-6 h-[calc(100dvh-8rem)]", paginas > 1 && "con-paginas")}>
        <div
          className={cn(
            "grid h-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-y-[clamp(1rem,3cqh,2rem)]",
            "xl:grid-cols-[minmax(0,1fr)_minmax(0,32.5rem)_minmax(0,1fr)] xl:gap-x-8 xl:gap-y-0",
            "min-[106.25rem]:grid-cols-[minmax(0,1fr)_minmax(0,41.25rem)_minmax(0,1fr)] min-[106.25rem]:gap-x-12",
          )}
        >
          {/* Arriba, para dejar libres a la Tierra y la Luna */}
          <div className="sombra-texto flex min-w-0 flex-col items-center gap-[clamp(0.375rem,1.2cqh,1rem)] text-center xl:col-start-2 xl:row-start-1 xl:pt-[clamp(0px,2.5cqh,1.5rem)]">
            <Title
              data-encender={ENCENDIDO.titulo}
              data-respaldo
              className="text-[length:clamp(2rem,6cqh,2.75rem)] leading-[1.05] tracking-[-0.03em] xl:text-[length:clamp(2.75rem,7cqh,4.75rem)]"
            >
              <GradientText>{TEXTOS_PROYECTOS.titulo}</GradientText>
            </Title>

            {error ? (
              <Alert tipo="error">{getErrorMessage(error)}</Alert>
            ) : !proyectos ? (
              <Spinner />
            ) : (
              <>
                {lista.length > 0 && (
                  <p
                    data-encender={ENCENDIDO.cuenta}
                    data-respaldo
                    className="cuenta-proyectos flex items-center gap-2.5 font-subtitulo text-[0.9375rem] leading-tight font-medium text-texto md:gap-4 md:text-[length:clamp(1rem,2.2cqh,1.375rem)]"
                  >
                    <span
                      aria-hidden
                      className="h-px w-4.5 shrink-0 bg-linear-to-r from-transparent to-secundario md:w-10"
                    />
                    {TEXTOS_PROYECTOS.cuenta(lista.length)}
                    <span
                      aria-hidden
                      className="h-px w-4.5 shrink-0 bg-linear-to-r from-secundario to-transparent md:w-10"
                    />
                  </p>
                )}
                <p
                  data-encender={ENCENDIDO.frase}
                  data-respaldo
                  className="frase-proyectos max-w-[42ch] text-[0.875rem] leading-[1.6] text-balance text-texto md:text-[length:clamp(0.9375rem,1.8cqh,1.125rem)]"
                >
                  {TEXTOS_PROYECTOS.frase} <GradientText>{TEXTOS_PROYECTOS.fraseRemate}</GradientText>
                </p>
                {lista.length === 0 && (
                  <p data-encender={ENCENDIDO.frase} data-respaldo className="text-sm text-texto-suave">
                    {TEXTOS_PROYECTOS.vacio}
                  </p>
                )}
              </>
            )}
          </div>

          {/*
            Debajo de xl, las fichas van en el medio del alto que deja el texto: en dos listas en una
            tableta y en una en el celular. Desde xl esta caja no cuenta (`contents`): cada lista va a
            su costado
          */}
          <div className="grid min-h-0 grid-cols-1 content-center items-start gap-x-10 md:grid-cols-2 xl:contents">
            {izquierda.length > 0 && (
              <ProjectList
                key={`izquierda-${llave}`}
                proyectos={izquierda}
                hrefDe={hrefVer}
                encenderDe={encenderDe(0)}
                className={cn(
                  "xl:col-start-1 xl:row-span-3 xl:row-start-1 xl:pt-[clamp(1rem,3.8cqh,2.25rem)]",
                  derecha.length === 0 && "md:col-span-2 md:mx-auto md:w-full md:max-w-md xl:max-w-none",
                )}
              />
            )}
            {derecha.length > 0 && (
              <ProjectList
                key={`derecha-${llave}`}
                proyectos={derecha}
                hrefDe={hrefVer}
                encenderDe={encenderDe(1)}
                className="xl:col-start-3 xl:row-span-3 xl:row-start-1 xl:pt-[calc(22cqh+1.5rem)]"
              />
            )}
          </div>

          {/* Abajo, en el centro: debajo de la Tierra y la Luna */}
          {paginas > 1 && (
            <div className="justify-self-center xl:col-start-2 xl:row-start-3">
              <BlogPagination
                paginacion={{ page: pagina, limit: porPagina, total: lista.length, paginas }}
                hrefDe={hrefPagina}
                encender={ENCENDIDO.paginado}
                etiqueta={TEXTOS_PROYECTOS.paginas}
              />
            </div>
          )}
        </div>
      </div>

      {ver && proyectos && (
        <ProjectReader key={ver} proyecto={lista[abierto]} indice={Math.max(0, abierto)} onCerrar={cerrar} />
      )}
    </SectionReveal>
  );
}
