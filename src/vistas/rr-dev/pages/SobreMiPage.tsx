import { ArrowRight, Laptop, MapPin } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Title } from "@/components/ui/Typography";
import { MODALIDAD, parrafos } from "@/features/portafolio/formato";
import { useGetEstudiosQuery, useGetExperienciaQuery, useGetPerfilQuery } from "@/features/portafolio/portafolioApi";
import { getErrorMessage } from "@/lib/errors";
import { PASOS, PLANETAS } from "@/vistas/rr-dev/camara";
import { GradientText } from "@/vistas/rr-dev/components/atoms/GradientText";
import { HeroBadge } from "@/vistas/rr-dev/components/atoms/HeroBadge";
import { StatusBadge } from "@/vistas/rr-dev/components/atoms/StatusBadge";
import { FactConstellation } from "@/vistas/rr-dev/components/molecules/FactConstellation";
import { type ItemBarra, JourneyBar } from "@/vistas/rr-dev/components/molecules/JourneyBar";
import { TechMarquee } from "@/vistas/rr-dev/components/molecules/TechMarquee";
import { AboutReader } from "@/vistas/rr-dev/components/organisms/AboutReader";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";
import { TrajectoryReader } from "@/vistas/rr-dev/components/organisms/TrajectoryReader";
import { TEXTOS_INICIO, TEXTOS_SOBRE_MI } from "@/vistas/rr-dev/contenido";
import { useParrafosQueEntran } from "@/vistas/rr-dev/hooks/useParrafosQueEntran";
import { useSobrePlaneta } from "@/vistas/rr-dev/hooks/useSobrePlaneta";
import {
  type CategoriaTrayectoria,
  categoriasCon,
  estudiosDe,
  repartirDatos,
  trabajosDe,
  type Trayectoria,
} from "@/vistas/rr-dev/sobreMi";

/**
 * Al entrar al apartado, en ms, con los tiempos de Inicio: el lugar, el título, la frase, la bio, la
 * disponibilidad, cada costado, la barra con sus pasos y el carrusel de los datos del celular
 */
const ENCENDIDO = {
  lugar: 0,
  titulo: 430,
  frase: 1000,
  bio: 1400,
  estado: 1870,
  izquierda: 670,
  derecha: 1100,
  lejanaDerecha: 4200,
  lejanaIzquierda: 4700,
  barra: 2130,
  pasos: 2400,
  carrusel: 3330,
};

/** El planeta de cerca en este apartado: lo que cae encima lleva un vidrio oscuro */
const PLANETA = PLANETAS[PASOS["/sobre-mi"] ?? 1]?.clase ?? "venus";

/**
 * Sobre mí como la constelación de Inicio, sobre el espacio visto desde Venus. Al centro, dónde estoy
 * y cómo trabajo, el título, la frase en el renglón del rol, la bio y la disponibilidad. A los
 * costados, los datos curiosos: los del trabajo a la izquierda y los personales a la derecha. Abajo,
 * la barra de Inicio con tres listas, Trabajos, Estudios e Idiomas: cada una abre el panel de lectura
 * con su línea de tiempo, y ahí se pasa de una lista a otra. Con más de cinco datos de un tipo, los más viejos van en una constelación lejana, más
 * chica, en el hueco de debajo de su costado. Ocupa justo el alto de la pantalla, sin scroll: la bio muestra los párrafos que entran y
 * el resto se lee en el panel. Sin lugar a los costados, los datos curiosos pasan al carrusel
 */
export default function SobreMiPage() {
  const escena = useRef<HTMLDivElement>(null);
  const { data: perfil, error } = useGetPerfilQuery();
  const { data: experiencia } = useGetExperienciaQuery();
  const { data: estudios } = useGetEstudiosQuery();
  // Lo que está abierto en el panel de lectura: la bio entera o una de las listas
  const [abierto, setAbierto] = useState<"bio" | CategoriaTrayectoria | null>(null);
  const cerrar = useCallback(() => setAbierto(null), []);

  const bio = perfil ? parrafos(perfil.bioLarga) : [];
  const visibles = useParrafosQueEntran(escena, bio.length);
  useSobrePlaneta(escena, PLANETA);

  const datos = perfil?.datosCuriosos ?? [];
  const profesionales = repartirDatos(datos, "profesional");
  const personales = repartirDatos(datos, "personal");

  const trayectoria: Trayectoria = {
    trabajos: trabajosDe(experiencia ?? []),
    estudios: estudiosDe(estudios ?? []),
    idiomas: perfil?.idiomas ?? [],
  };
  // Una por lista que tenga algo: el nombre y qué es, que no cambia con cuántos haya
  const items: ItemBarra[] = categoriasCon(trayectoria).map(({ id, icono, tono }) => ({
    clave: id,
    valor: TEXTOS_SOBRE_MI.categorias[id],
    etiqueta: TEXTOS_SOBRE_MI.etiquetas[id],
    icono,
    tono,
    abrir: {
      nombre: TEXTOS_SOBRE_MI.verCategoria(TEXTOS_SOBRE_MI.categorias[id]),
      alTocar: () => setAbierto(id),
    },
  }));

  return (
    <SectionReveal>
      {/*
        El alto de la pantalla menos la barra (5rem) y la mitad del margen de la página, que se
        recupera con -my-6: así entra todo sin scroll, como el blog
      */}
      <div ref={escena} className="escena-sobre-mi -my-6 h-[calc(100dvh-8rem)]">
        <div className="grid h-full grid-cols-1 grid-rows-[minmax(0,1fr)_auto] gap-[clamp(0.875rem,2.4cqh,1.75rem)]">
          <div className="grid min-h-0 grid-cols-1 items-center [--etiqueta:150px] xl:grid-cols-[minmax(0,1fr)_minmax(0,32.5rem)_minmax(0,1fr)] xl:gap-x-8 min-[106.25rem]:grid-cols-[minmax(0,1fr)_minmax(0,41.25rem)_minmax(0,1fr)] min-[106.25rem]:gap-x-12 min-[106.25rem]:[--etiqueta:200px]">
            {/*
              Cada costado: arriba, a la altura del texto, la constelación de cerca (más abajo, la de la
              izquierda quedaría encima de Venus). Debajo, en el hueco que queda, la lejana
            */}
            <div className="hidden min-h-0 flex-col items-end self-stretch xl:flex">
              <div className="flex h-[min(31.875rem,100%)] shrink-0 justify-end pt-[clamp(0px,4cqh,3rem)]">
                {profesionales.cerca.length > 0 && (
                  <FactConstellation
                    datos={profesionales.cerca}
                    lado="izquierda"
                    etiqueta={TEXTOS_SOBRE_MI.enElTrabajo}
                    encender={ENCENDIDO.izquierda}
                  />
                )}
              </div>
              {profesionales.lejos.length > 0 && (
                <div className="constelacion-lejana h-[min(7.5rem,100%)] min-h-0 pt-3">
                  <FactConstellation
                    datos={profesionales.lejos}
                    lado="izquierda"
                    etiqueta={TEXTOS_SOBRE_MI.anteriores(TEXTOS_SOBRE_MI.enElTrabajo)}
                    lejania="muyLejos"
                    encender={ENCENDIDO.lejanaIzquierda}
                  />
                </div>
              )}
            </div>

            {/* El centro tiene que entrar en el alto de su fila: si no, la bio deja párrafos para el panel */}
            <div
              data-encaja
              className="sombra-texto flex min-w-0 flex-col items-center gap-[clamp(0.625rem,1.7cqh,1.125rem)] text-center"
            >
              {perfil && (
                <div data-encender={ENCENDIDO.lugar} className="flex flex-wrap justify-center gap-2.5">
                  <HeroBadge icono={MapPin} etiqueta={`${perfil.ubicacion.ciudad}, ${perfil.ubicacion.pais}`} />
                  <HeroBadge icono={Laptop} etiqueta={MODALIDAD[perfil.modalidad]} />
                </div>
              )}

              <Title
                data-encender={ENCENDIDO.titulo}
                data-respaldo
                className="text-[2.75rem] leading-[1.05] tracking-[-0.03em] md:text-[length:clamp(2.75rem,7cqh,4.75rem)]"
              >
                {TEXTOS_SOBRE_MI.titulo} <GradientText>{TEXTOS_SOBRE_MI.tituloDegradado}</GradientText>
              </Title>

              {error ? (
                <Alert tipo="error">{getErrorMessage(error)}</Alert>
              ) : !perfil ? (
                <Spinner />
              ) : (
                <>
                  {perfil.frase && (
                    <p
                      data-encender={ENCENDIDO.frase}
                      data-respaldo
                      className="flex items-center gap-2.5 font-subtitulo text-[1.0625rem] leading-tight font-medium text-texto md:gap-4 md:text-[length:clamp(1.125rem,2.3cqh,1.5rem)]"
                    >
                      <span
                        aria-hidden
                        className="h-px w-4.5 shrink-0 bg-linear-to-r from-transparent to-secundario md:w-10"
                      />
                      {perfil.frase}
                      <span
                        aria-hidden
                        className="h-px w-4.5 shrink-0 bg-linear-to-r from-secundario to-transparent md:w-10"
                      />
                    </p>
                  )}

                  {bio.length > 0 && (
                    <div
                      data-encender={ENCENDIDO.bio}
                      data-respaldo
                      className="grid max-w-[64ch] justify-items-center gap-2.5"
                    >
                      <div className="grid gap-[0.8em] text-[0.9375rem] leading-[1.65] text-pretty text-texto md:text-[length:clamp(0.9375rem,1.65cqh,1.0625rem)]">
                        {bio.slice(0, visibles).map((parrafo, indice) => (
                          <p key={indice}>{parrafo}</p>
                        ))}
                      </div>
                      {visibles < bio.length && (
                        <button
                          type="button"
                          onClick={() => setAbierto("bio")}
                          className="group inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-secundario"
                        >
                          {TEXTOS_SOBRE_MI.seguirLeyendo}
                          <ArrowRight
                            className="size-4 transition-[translate] duration-400 ease-(--salida) group-hover:translate-x-0.75"
                            aria-hidden
                          />
                        </button>
                      )}
                    </div>
                  )}

                  {perfil.disponibilidad.disponible && (
                    <div data-encender={ENCENDIDO.estado} data-respaldo className="estado-sobre-mi rounded-full">
                      <StatusBadge etiqueta={perfil.disponibilidad.texto || TEXTOS_INICIO.disponible} />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="hidden min-h-0 flex-col items-start self-stretch xl:flex">
              <div className="flex h-[min(31.875rem,100%)] shrink-0 justify-start pt-[clamp(0px,4cqh,3rem)]">
                {personales.cerca.length > 0 && (
                  <FactConstellation
                    datos={personales.cerca}
                    lado="derecha"
                    etiqueta={TEXTOS_SOBRE_MI.fueraDelTrabajo}
                    encender={ENCENDIDO.derecha}
                  />
                )}
              </div>
              {/* En el medio del hueco y corrida hacia afuera: más atrás que la de cerca */}
              {personales.lejos.length > 0 && (
                <div className="constelacion-lejana flex min-h-0 flex-1 items-center pl-[clamp(2rem,5cqw,6rem)]">
                  <div className="h-[min(12rem,100%)]">
                    <FactConstellation
                      datos={personales.lejos}
                      lado="derecha"
                      etiqueta={TEXTOS_SOBRE_MI.anteriores(TEXTOS_SOBRE_MI.fueraDelTrabajo)}
                      lejania="lejos"
                      encender={ENCENDIDO.lejanaDerecha}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Con una columna fija: si no, la barra y el carrusel crecerían con su contenido */}
          <div className="grid min-w-0 grid-cols-1 justify-items-center gap-3 empty:hidden">
            {items.length > 0 && (
              <div data-encender={ENCENDIDO.barra} data-sin-estrella className="w-full max-w-260">
                <JourneyBar items={items} etiqueta={TEXTOS_SOBRE_MI.trayectoria} encender={ENCENDIDO.pasos} />
              </div>
            )}
            {datos.length > 0 && (
              <div data-encender={ENCENDIDO.carrusel} data-respaldo className="w-full max-w-245 xl:hidden">
                <TechMarquee
                  items={datos.map(({ titulo, valor }) => `${titulo}: ${valor}`)}
                  etiqueta={TEXTOS_SOBRE_MI.datosCuriosos}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {abierto === "bio" && perfil && <AboutReader perfil={perfil} onCerrar={cerrar} />}
      {abierto && abierto !== "bio" && (
        <TrajectoryReader trayectoria={trayectoria} inicial={abierto} onCerrar={cerrar} />
      )}
    </SectionReveal>
  );
}
