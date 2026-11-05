import { Title } from "@/components/ui/Typography";
import { useGetExperienciaQuery, useGetPerfilQuery } from "@/features/portafolio/portafolioApi";
import { APELLIDO, NOMBRE, NOMBRE_COMPLETO } from "@/lib/identidad";
import { GradientText } from "@/vistas/rr-dev/components/atoms/GradientText";
import { HeroBadge } from "@/vistas/rr-dev/components/atoms/HeroBadge";
import { PortraitFrame } from "@/vistas/rr-dev/components/atoms/PortraitFrame";
import { StatusBadge } from "@/vistas/rr-dev/components/atoms/StatusBadge";
import { TechBubble } from "@/vistas/rr-dev/components/atoms/TechBubble";
import { SocialLinks } from "@/vistas/rr-dev/components/molecules/SocialLinks";
import { StatsBar } from "@/vistas/rr-dev/components/molecules/StatsBar";
import { TechConstellation } from "@/vistas/rr-dev/components/molecules/TechConstellation";
import { TechMarquee } from "@/vistas/rr-dev/components/molecules/TechMarquee";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";
import {
  armarEstadisticas,
  SERVICIOS,
  TECNOLOGIAS,
  TECNOLOGIAS_POR_LADO,
  TEXTOS_INICIO,
} from "@/vistas/rr-dev/contenido";

/** En celular, la fila de logos se enciende salteada: el cuarto, el primero, el quinto... */
const SALTEADO = [1, 3, 5, 0, 2, 4];

/**
 * El nombre con la foto arriba, las constelaciones en espejo a los lados, las redes en el margen, y
 * abajo los datos y el carrusel. Detrás, el espacio visto desde Mercurio (`SpaceScene`).
 * Al entrar, cada parte se enciende a sus ms (`data-encender`): la foto, el nombre, las
 * constelaciones, los saludos, el rol, la descripción, las redes, los datos y al final el carrusel
 */
export default function InicioPage() {
  const { data: perfil } = useGetPerfilQuery();
  const { data: experiencia } = useGetExperienciaQuery();
  const redes = perfil?.redes ?? [];

  return (
    <SectionReveal>
      <section className="relative pt-2 md:pt-8">
        <div className="absolute top-1/2 -left-[2.5vw] z-10 hidden -translate-y-1/2 md:block" data-encender={2270}>
          <SocialLinks redes={redes} etiqueta={TEXTOS_INICIO.seguime} vertical />
        </div>

        <div className="grid grid-cols-1 items-center gap-x-16 xl:grid-cols-[1fr_auto_1fr]">
          <div className="hidden justify-end xl:flex">
            <TechConstellation
              items={TECNOLOGIAS.slice(0, TECNOLOGIAS_POR_LADO)}
              lado="izquierda"
              etiqueta={TEXTOS_INICIO.tecnologias}
              encender={670}
            />
          </div>

          {/* El margen deja libre la columna de redes hasta que aparecen las constelaciones */}
          <div className="flex min-w-0 flex-col items-center text-center md:px-8 xl:px-0">
            <div className="w-23 md:w-28" data-encender={0}>
              <PortraitFrame
                src={perfil?.foto?.url}
                alt={perfil?.foto?.alt ?? NOMBRE_COMPLETO}
                reservado={TEXTOS_INICIO.tuFoto}
              />
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3 md:mt-9">
              <HeroBadge etiqueta={TEXTOS_INICIO.saludo} encender={1000} />
              {perfil?.disponibilidad.disponible && <StatusBadge etiqueta={TEXTOS_INICIO.disponible} encender={1300} />}
            </div>

            {/* Con constelaciones al lado baja a 6vw: las fuentes anchas las empujarían sobre las redes */}
            <Title
              data-encender={430}
              className="mt-6 text-[length:clamp(2.75rem,7vw,5.5rem)] leading-[1.05] tracking-[-0.03em] text-balance md:mt-8 xl:text-[length:clamp(4.25rem,6vw,5.5rem)]">
              {NOMBRE} <GradientText>{APELLIDO}</GradientText>
            </Title>

            <p
              data-encender={1400}
              className="mt-5 flex items-center gap-2 font-subtitulo text-[length:clamp(1.4rem,2.5vw,1.75rem)] leading-tight font-medium text-texto sm:gap-3 md:mt-6 md:gap-4">
              <span
                aria-hidden
                className="h-px w-3 shrink-0 bg-linear-to-r from-transparent to-secundario sm:w-6 md:w-10"
              />
              {TEXTOS_INICIO.rol}
              <span
                aria-hidden
                className="h-px w-3 shrink-0 bg-linear-to-r from-secundario to-transparent sm:w-6 md:w-10"
              />
            </p>

            <p data-encender={1870} className="mt-6 max-w-[56ch] text-lg leading-relaxed text-texto md:mt-8">
              {TEXTOS_INICIO.descripcion}
            </p>

            {/* Sin lugar a los costados, las constelaciones pasan a ser una fila de logos */}
            <ul aria-label={TEXTOS_INICIO.tecnologias} className="mt-9 flex flex-wrap justify-center gap-3 xl:hidden">
              {TECNOLOGIAS.map((tecnologia, indice) => (
                <li key={tecnologia.id} data-encender={2070 + (SALTEADO[indice] ?? indice) * 230}>
                  <TechBubble tecnologia={tecnologia} tamano="sm" />
                </li>
              ))}
            </ul>
            <div className="mt-8 md:hidden" data-encender={2270}>
              <SocialLinks redes={redes} etiqueta={TEXTOS_INICIO.seguime} />
            </div>
          </div>

          <div className="hidden justify-start xl:flex">
            <TechConstellation
              items={TECNOLOGIAS.slice(TECNOLOGIAS_POR_LADO, TECNOLOGIAS_POR_LADO * 2)}
              lado="derecha"
              etiqueta={TEXTOS_INICIO.tecnologias}
              encender={1100}
            />
          </div>
        </div>
      </section>

      {/* El ancho de RR-DEV: más ancha, la barra queda aplastada */}
      <div className="mx-auto mt-14 max-w-260 md:mt-20" data-encender={2130} data-sin-estrella>
        <StatsBar items={armarEstadisticas(perfil, experiencia)} encender={2400} />
      </div>

      <div className="mx-auto mt-10 mb-16 max-w-245 md:mt-12" data-encender={3330}>
        <TechMarquee items={SERVICIOS} etiqueta={TEXTOS_INICIO.loQueHago} />
      </div>
    </SectionReveal>
  );
}
