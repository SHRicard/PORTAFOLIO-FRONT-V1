import { FolderGit2 } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { mes, parrafos, TIPO_PROYECTO } from "@/features/portafolio/formato";
import type { Proyecto } from "@/features/portafolio/types";
import { cn } from "@/lib/cn";
import { documentosDe } from "@/vistas/rr-dev/blog";
import { BrandLogo } from "@/vistas/rr-dev/components/atoms/BrandLogo";
import { DocumentLink } from "@/vistas/rr-dev/components/atoms/DocumentLink";
import { ProjectEmblem } from "@/vistas/rr-dev/components/atoms/ProjectEmblem";
import { tonoArea } from "@/vistas/rr-dev/components/atoms/SkillBubble";
import { PhotoViewer } from "@/vistas/rr-dev/components/organisms/PhotoViewer";
import { ReaderPanel } from "@/vistas/rr-dev/components/organisms/ReaderPanel";
import { TEXTOS_BLOG, TEXTOS_PROYECTOS } from "@/vistas/rr-dev/contenido";
import { LOGOS_TECNOLOGIA, logoTecnologia } from "@/vistas/rr-dev/logos";
import { tonoProyecto } from "@/vistas/rr-dev/proyectos";

const ROTULO = "mt-2 text-[0.8rem] font-medium tracking-[.24em] text-texto-suave uppercase";
const ENLACE =
  "inline-flex items-center gap-2 rounded-xl border border-borde bg-superficie/70 px-3.5 py-2 text-sm font-medium text-texto transition-colors hover:border-(--tono)/55";

interface ProjectReaderProps {
  /** Sin proyecto, el enlace era de uno que no existe o no está publicado */
  proyecto?: Proyecto;
  /** Su lugar en la lista entera: de él sale su color */
  indice: number;
  onCerrar: () => void;
}

/** Un enlace que sale del sitio, con su ícono */
function EnlaceExterno({ href, icono, children }: { href: string; icono: ReactNode; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={ENLACE}>
      {icono}
      {children}
    </a>
  );
}

/**
 * La portada de cabecera («Portada arriba»): entera, a su forma y de borde a borde del panel. Hasta que
 * carga guarda un lugar 16:9, así el texto no salta hacia abajo cuando aparece
 */
function PortadaArriba({ foto, onAbrir }: { foto: Proyecto["galeria"][number]; onAbrir: () => void }) {
  const [cargada, setCargada] = useState(false);
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={TEXTOS_BLOG.verFoto(foto.alt)}
      className={cn(
        "-mx-5 mb-1 cursor-zoom-in border-y border-texto/10 bg-superficie focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secundario md:-mx-10",
        !cargada && "aspect-video",
      )}
    >
      <img src={foto.url} alt={foto.alt} onLoad={() => setCargada(true)} className="block h-auto w-full" />
    </button>
  );
}

/**
 * Un proyecto entero en el panel de lectura (`ReaderPanel`, el del blog), encima de Proyectos: la
 * portada arriba de todo, de borde a borde, y justo abajo los documentos (el manual); de qué se trata;
 * las demás fotos en una tira; la descripción, todas las tecnologías y los repositorios. Con una foto
 * abierta, Escape cierra la foto: el visor tiene el suyo
 */
export function ProjectReader({ proyecto, indice, onCerrar }: ProjectReaderProps) {
  const titulo = useId();
  const [fotoAbierta, setFotoAbierta] = useState<number | null>(null);

  if (!proyecto) {
    return (
      <ReaderPanel etiqueta={TEXTOS_PROYECTOS.panel} icono={FolderGit2} tituloId={titulo} onCerrar={onCerrar}>
        <Alert tipo="error">
          <span id={titulo}>{TEXTOS_PROYECTOS.noExiste}</span>
        </Alert>
      </ReaderPanel>
    );
  }

  const fotos = proyecto.galeria; // la primera es la portada; la web pública ya viene sin las pendientes
  const [portada, ...masFotos] = fotos;
  const documentos = documentosDe([proyecto]);

  return (
    <ReaderPanel
      etiqueta={TEXTOS_PROYECTOS.panel}
      icono={FolderGit2}
      tituloId={titulo}
      onCerrar={onCerrar}
      escapeCierra={fotoAbierta === null}
      encima={
        fotoAbierta !== null && (
          <PhotoViewer
            fotos={fotos}
            indice={fotoAbierta}
            onCambiar={setFotoAbierta}
            onCerrar={() => setFotoAbierta(null)}
          />
        )
      }
    >
      <div className={cn(tonoArea({ tono: tonoProyecto(indice) }), "contents")}>
        {portada && <PortadaArriba key={portada.url} foto={portada} onAbrir={() => setFotoAbierta(0)} />}

        {/* El manual y los demás PDF, justo abajo de la portada */}
        {documentos.length > 0 && (
          <>
            <h3 className={ROTULO}>{TEXTOS_PROYECTOS.documentos}</h3>
            {documentos.map((documento) => (
              <DocumentLink key={documento.url} documento={documento} />
            ))}
          </>
        )}

        <div className="flex items-center gap-3 [--emblema:3.25rem]">
          <ProjectEmblem proyecto={proyecto} soloIniciales />
          <p className="text-sm text-texto-suave">
            <span className="font-semibold text-(--tono)">{TIPO_PROYECTO[proyecto.tipo]}</span>
            {proyecto.rol && ` · ${proyecto.rol}`} · {mes(proyecto.fecha)}
          </p>
        </div>

        <h2
          id={titulo}
          className="font-titulo text-[length:clamp(1.5rem,3vw,1.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance"
        >
          {proyecto.titulo}
        </h2>
        <p className="text-lg leading-relaxed font-medium">{proyecto.resumen}</p>

        {masFotos.length > 0 && (
          <>
            <h3 className={ROTULO}>{TEXTOS_PROYECTOS.masFotos(masFotos.length)}</h3>
            {/* Cada una a su forma (una captura de celular queda angosta), en una tira que se desliza de costado */}
            <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1.5 [scrollbar-width:thin]">
              {masFotos.map((foto, numero) => (
                <button
                  key={foto.url}
                  type="button"
                  onClick={() => setFotoAbierta(numero + 1)}
                  aria-label={TEXTOS_BLOG.verFoto(foto.alt)}
                  className="h-26 shrink-0 cursor-zoom-in overflow-hidden rounded-xl border border-texto/10 bg-superficie focus-visible:outline-2 focus-visible:outline-secundario md:h-30"
                >
                  <img src={foto.url} alt={foto.alt} loading="lazy" className="h-full w-auto max-w-none" />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="grid gap-3.5">
          {parrafos(proyecto.descripcion).map((parrafo, numero) => (
            <p key={numero} className="text-[1.03rem] leading-[1.75]">
              {parrafo}
            </p>
          ))}
        </div>

        {proyecto.tecnologias.length > 0 && (
          <>
            <h3 className={ROTULO}>{TEXTOS_PROYECTOS.tecnologias(proyecto.tecnologias.length)}</h3>
            <ul className="flex flex-wrap gap-1.5">
              {proyecto.tecnologias.map((tecnologia) => {
                const logo = logoTecnologia(tecnologia);
                return (
                  <li
                    key={tecnologia}
                    className="tarjeta-habilidad inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.8125rem] font-medium text-texto"
                  >
                    {logo && <BrandLogo logo={logo} className="size-3.5 text-texto-suave" />}
                    {tecnologia}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {proyecto.repositorios.length > 0 && (
          <>
            <h3 className={ROTULO}>{TEXTOS_PROYECTOS.codigo}</h3>
            <div className="flex flex-wrap gap-2">
              {proyecto.repositorios.map((repositorio) => (
                <EnlaceExterno
                  key={repositorio.url}
                  href={repositorio.url}
                  icono={<BrandLogo logo={LOGOS_TECNOLOGIA.github} className="size-4" />}
                >
                  {repositorio.nombre}
                </EnlaceExterno>
              ))}
            </div>
          </>
        )}

      </div>
    </ReaderPanel>
  );
}
