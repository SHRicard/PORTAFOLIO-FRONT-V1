import { ArrowRight, CodeXml } from "lucide-react";
import { Link, type To } from "react-router";
import { mes } from "@/features/portafolio/formato";
import type { Proyecto } from "@/features/portafolio/types";
import { BrandLogo } from "@/vistas/rr-dev/components/atoms/BrandLogo";
import { ProjectEmblem } from "@/vistas/rr-dev/components/atoms/ProjectEmblem";
import { BubbleTrail } from "@/vistas/rr-dev/components/molecules/BubbleTrail";
import { BOTON_FICHA, FLECHA_BOTON_FICHA, FoldRow } from "@/vistas/rr-dev/components/molecules/FoldRow";
import { TEXTOS_PROYECTOS } from "@/vistas/rr-dev/contenido";
import { LOGOS_TECNOLOGIA } from "@/vistas/rr-dev/logos";
import { TIPO_CORTO, tecnologiasConLogo, tecnologiasOcultas, tonoProyecto } from "@/vistas/rr-dev/proyectos";

/** En la que entra abierta: cuánto después de su fila aparecen el resumen, las burbujas, la línea, los nombres y los botones */
const DEMORA = { resumen: 300, burbujas: 600, linea: 1000, nombres: 1100, botones: 1400 };

interface ProjectRowProps {
  proyecto: Proyecto;
  /** Su lugar en la lista entera: de él sale su color */
  indice: number;
  abierta: boolean;
  onAbrir: () => void;
  /** El enlace que lo abre en el panel */
  href: To;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/**
 * Un proyecto como una ficha de la lista (`FoldRow`): en la fila, el emblema, el título, el tipo y el
 * mes. Abierta, el resumen, sus tecnologías como una constelación de Habilidades (las que tienen logo,
 * y el resto en «+N») con los nombres en una tarjeta de su color, y los botones: «Ver proyecto», que
 * lo abre en el panel, y el código de cada repositorio. Mide con `--emblema` y `--burbuja`, que pone
 * la lista
 */
export function ProjectRow({ proyecto, indice, abierta, onAbrir, href, encender }: ProjectRowProps) {
  const aLaVista = tecnologiasConLogo(proyecto.tecnologias);
  const ocultas = tecnologiasOcultas(proyecto.tecnologias, aLaVista);

  return (
    <FoldRow
      tono={tonoProyecto(indice)}
      abierta={abierta}
      onAbrir={onAbrir}
      encender={encender}
      emblema={<ProjectEmblem proyecto={proyecto} />}
      titulo={proyecto.titulo}
      subtitulo={
        <>
          <span className="font-semibold text-(--tono)">{TIPO_CORTO[proyecto.tipo]}</span> · {mes(proyecto.fecha)}
        </>
      }
    >
      {(despues) => (
        <>
          <p
            data-encender={despues(DEMORA.resumen)}
            data-respaldo
            className="resumen-proyecto sombra-texto line-clamp-3 text-[0.8125rem] leading-normal text-texto xl:line-clamp-2 xl:text-[length:clamp(0.78125rem,1.6cqh,0.9375rem)] xl:leading-[1.55]"
          >
            {proyecto.resumen}
          </p>

          {aLaVista.length > 0 && (
            <>
              <div className="burbujas-proyecto flex items-start gap-[calc(var(--burbuja)/3)]">
                <BubbleTrail
                  nombres={aLaVista.map(({ nombre }) => nombre)}
                  icono={CodeXml}
                  encender={despues(DEMORA.burbujas)}
                  trazar={despues(DEMORA.linea)}
                />
                {ocultas.length > 0 && (
                  <span
                    aria-hidden
                    title={ocultas.join(", ")}
                    data-encender={despues(DEMORA.burbujas)}
                    className="inline-grid h-(--burbuja) place-items-center rounded-full border border-dashed border-(--tono)/55 px-2.5 text-[0.71875rem] font-semibold whitespace-nowrap text-(--tono) tabular-nums xl:text-[length:clamp(0.65625rem,1.3cqh,0.75rem)]"
                  >
                    +{ocultas.length}
                  </span>
                )}
              </div>
              <p
                data-encender={despues(DEMORA.nombres)}
                className="nombres-proyecto tarjeta-habilidad hidden rounded-lg px-2.5 py-0.5 text-xs leading-[1.45] text-texto xl:block xl:text-[length:clamp(0.71875rem,1.35cqh,0.8125rem)]"
              >
                {aLaVista.map(({ nombre }) => nombre).join(" · ")}
                {ocultas.length > 0 && (
                  <span className="sr-only">{`, ${TEXTOS_PROYECTOS.masTecnologias(ocultas.length, ocultas)}`}</span>
                )}
              </p>
            </>
          )}

          <div data-encender={despues(DEMORA.botones)} className="flex flex-wrap items-center gap-2">
            <Link to={href} preventScrollReset className={BOTON_FICHA}>
              {TEXTOS_PROYECTOS.verProyecto}
              <span className="sr-only">: {proyecto.titulo}</span>
              <ArrowRight className={FLECHA_BOTON_FICHA} aria-hidden />
            </Link>
            {proyecto.repositorios.map((repositorio) => (
              <a
                key={repositorio.url}
                href={repositorio.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={TEXTOS_PROYECTOS.codigoDe(repositorio.nombre)}
                title={TEXTOS_PROYECTOS.codigoDe(repositorio.nombre)}
                className="grid size-7.5 place-items-center rounded-full border border-borde bg-superficie/75 text-texto-suave backdrop-blur-sm transition-colors duration-300 hover:border-(--tono)/60 hover:text-(--tono) xl:size-[clamp(1.6875rem,3.6cqh,2.125rem)]"
              >
                <BrandLogo logo={LOGOS_TECNOLOGIA.github} className="size-3.5 xl:size-[45%]" />
              </a>
            ))}
          </div>
        </>
      )}
    </FoldRow>
  );
}
