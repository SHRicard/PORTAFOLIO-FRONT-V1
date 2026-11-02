import { Title } from "@/components/ui/Typography";
import { useGetExperienciaQuery, useGetPerfilQuery } from "@/features/portafolio/portafolioApi";
import { APELLIDO, NOMBRE, NOMBRE_COMPLETO } from "@/lib/identidad";
import { AuroraGlow } from "@/vistas/rr-dev/components/atoms/AuroraGlow";
import { GradientText } from "@/vistas/rr-dev/components/atoms/GradientText";
import { HeroBadge } from "@/vistas/rr-dev/components/atoms/HeroBadge";
import { HorizonGlow } from "@/vistas/rr-dev/components/atoms/HorizonGlow";
import { PortraitFrame } from "@/vistas/rr-dev/components/atoms/PortraitFrame";
import { ShootingStar } from "@/vistas/rr-dev/components/atoms/ShootingStar";
import { StarField } from "@/vistas/rr-dev/components/atoms/StarField";
import { StatusBadge } from "@/vistas/rr-dev/components/atoms/StatusBadge";
import { TechBubble } from "@/vistas/rr-dev/components/atoms/TechBubble";
import { SocialLinks } from "@/vistas/rr-dev/components/molecules/SocialLinks";
import { StatsBar } from "@/vistas/rr-dev/components/molecules/StatsBar";
import { TechConstellation } from "@/vistas/rr-dev/components/molecules/TechConstellation";
import { TechMarquee } from "@/vistas/rr-dev/components/molecules/TechMarquee";
import {
  armarEstadisticas,
  SERVICIOS,
  TECNOLOGIAS,
  TECNOLOGIAS_POR_LADO,
  TEXTOS_INICIO,
} from "@/vistas/rr-dev/contenido";

/** El nombre con la foto arriba, las constelaciones en espejo a los lados, las redes en el margen, y abajo los datos y el carrusel */
export default function InicioPage() {
  const { data: perfil } = useGetPerfilQuery();
  const { data: experiencia } = useGetExperienciaQuery();
  const redes = perfil?.redes ?? [];

  return (
    <div className="rr-dev">
      {/* El cielo cubre toda la pantalla, por detrás del navbar y del contenido */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <StarField />
        <ShootingStar />
        <AuroraGlow />
      </div>

      <section className="relative pt-2 md:pt-8">
        <div className="absolute top-1/2 -left-[2.5vw] z-10 hidden -translate-y-1/2 md:block">
          <SocialLinks redes={redes} etiqueta={TEXTOS_INICIO.seguime} vertical />
        </div>

        <div className="grid grid-cols-1 items-center gap-x-16 xl:grid-cols-[1fr_auto_1fr]">
          <div className="hidden justify-end xl:flex">
            <TechConstellation
              items={TECNOLOGIAS.slice(0, TECNOLOGIAS_POR_LADO)}
              lado="izquierda"
              etiqueta={TEXTOS_INICIO.tecnologias}
            />
          </div>

          {/* El margen deja libre la columna de redes hasta que aparecen las constelaciones */}
          <div className="flex min-w-0 flex-col items-center text-center md:px-8 xl:px-0">
            <div className="w-23 md:w-28">
              <PortraitFrame
                src={perfil?.foto?.url}
                alt={perfil?.foto?.alt ?? NOMBRE_COMPLETO}
                reservado={TEXTOS_INICIO.tuFoto}
              />
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3 md:mt-9">
              <HeroBadge etiqueta={TEXTOS_INICIO.saludo} />
              {perfil?.disponibilidad.disponible && <StatusBadge etiqueta={TEXTOS_INICIO.disponible} />}
            </div>

            {/* Con constelaciones al lado baja a 6vw: las fuentes anchas las empujarían sobre las redes */}
            <Title className="mt-6 text-[length:clamp(2.75rem,7vw,5.5rem)] leading-[1.05] tracking-[-0.03em] text-balance md:mt-8 xl:text-[length:clamp(4.25rem,6vw,5.5rem)]">
              {NOMBRE} <GradientText>{APELLIDO}</GradientText>
            </Title>

            <p className="mt-5 flex items-center gap-2 font-subtitulo text-[length:clamp(1.4rem,2.5vw,1.75rem)] leading-tight font-medium text-texto sm:gap-3 md:mt-6 md:gap-4">
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

            <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-texto md:mt-8">{TEXTOS_INICIO.descripcion}</p>

            {/* Sin lugar a los costados, las constelaciones pasan a ser una fila de logos */}
            <ul aria-label={TEXTOS_INICIO.tecnologias} className="mt-9 flex flex-wrap justify-center gap-3 xl:hidden">
              {TECNOLOGIAS.map((tecnologia) => (
                <li key={tecnologia.id}>
                  <TechBubble tecnologia={tecnologia} tamano="sm" />
                </li>
              ))}
            </ul>
            <div className="mt-8 md:hidden">
              <SocialLinks redes={redes} etiqueta={TEXTOS_INICIO.seguime} />
            </div>
          </div>

          <div className="hidden justify-start xl:flex">
            <TechConstellation
              items={TECNOLOGIAS.slice(TECNOLOGIAS_POR_LADO, TECNOLOGIAS_POR_LADO * 2)}
              lado="derecha"
              etiqueta={TEXTOS_INICIO.tecnologias}
            />
          </div>
        </div>
      </section>

      {/* El ancho de RR-DEV: más ancha, la barra queda aplastada */}
      <div className="relative mx-auto mt-14 max-w-260 md:mt-20">
        {/* Ancla sin ancho en el centro: el borde del planeta pasa por la mitad de la barra y, en celular, debajo de su última fila */}
        <div className="absolute top-[calc(100%-4.5rem)] left-1/2 -z-10 h-350 w-0 md:top-[calc(50%-3.5rem)]">
          <HorizonGlow />
        </div>
        <StatsBar items={armarEstadisticas(perfil, experiencia)} />
      </div>

      {/* El margen de abajo deja a la vista el planeta */}
      <div className="velo-lectura mx-auto mt-10 mb-16 max-w-245 md:mt-12">
        <TechMarquee items={SERVICIOS} etiqueta={TEXTOS_INICIO.loQueHago} />
      </div>
    </div>
  );
}
