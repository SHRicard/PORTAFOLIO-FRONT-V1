import { BookOpen, Share2 } from "lucide-react";
import { useId, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useGetEntradaQuery } from "@/features/blog/blogApi";
import { fechaLarga, mensajeDetalle, parrafos } from "@/features/portafolio/formato";
import { APELLIDO, NOMBRE, NOMBRE_COMPLETO } from "@/lib/identidad";
import { documentosDe, fotosDe } from "@/vistas/rr-dev/blog";
import { DocumentLink } from "@/vistas/rr-dev/components/atoms/DocumentLink";
import { Hashtags } from "@/vistas/rr-dev/components/atoms/Hashtags";
import { PortraitFrame } from "@/vistas/rr-dev/components/atoms/PortraitFrame";
import { PhotoViewer } from "@/vistas/rr-dev/components/organisms/PhotoViewer";
import { ReaderPanel } from "@/vistas/rr-dev/components/organisms/ReaderPanel";
import { TEXTOS_BLOG, TEXTOS_INICIO } from "@/vistas/rr-dev/contenido";

interface PostReaderProps {
  slug: string;
  /** La foto del perfil, para firmar la publicación */
  foto?: { url: string | null; alt: string } | null;
  rol?: string;
  onCerrar: () => void;
}

/**
 * Una publicación entera en el panel de lectura (`ReaderPanel`), encima del blog: así se lee sin
 * perder la página en la que estaba. Con una foto abierta, Escape cierra la foto: el visor tiene el suyo
 */
export function PostReader({ slug, foto, rol, onCerrar }: PostReaderProps) {
  // currentData y no data: al cambiar de publicación no se muestra la anterior mientras carga
  const { currentData: entrada, error } = useGetEntradaQuery(slug);
  const titulo = useId();
  const [fotoAbierta, setFotoAbierta] = useState<number | null>(null);
  const [copiado, setCopiado] = useState(false);

  // En el celular abre el menú de compartir; en la compu copia el enlace
  const compartir = async () => {
    const url = `${window.location.origin}/blog/${encodeURIComponent(slug)}`;
    try {
      if (navigator.share) await navigator.share({ title: entrada?.titulo, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
      }
    } catch {
      // Se canceló o el navegador no lo permite: no hay nada que avisar
    }
  };

  const fotos = entrada ? fotosDe(entrada) : [];
  const [principal, ...resto] = fotos;

  return (
    <ReaderPanel
      etiqueta={TEXTOS_BLOG.leyendo}
      icono={BookOpen}
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
      {error ? (
        <Alert tipo="error">
          <span id={titulo}>{mensajeDetalle(error, TEXTOS_BLOG.noExiste)}</span>
        </Alert>
      ) : !entrada ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <div className="w-11 shrink-0">
              <PortraitFrame src={foto?.url ?? undefined} alt={foto?.alt ?? NOMBRE_COMPLETO} reservado="" />
            </div>
            <div className="grid">
              <span className="text-[0.95rem] font-semibold">
                {NOMBRE} {APELLIDO}
              </span>
              <span className="text-sm text-texto-suave">
                {rol || TEXTOS_INICIO.rol}
                {entrada.publicadoEn && ` · ${fechaLarga(entrada.publicadoEn)}`}
              </span>
            </div>
          </div>

          <h2
            id={titulo}
            className="font-titulo text-[length:clamp(1.5rem,3vw,1.9rem)] leading-tight font-bold tracking-[-0.02em] text-balance"
          >
            {entrada.titulo}
          </h2>
          <p className="text-lg leading-relaxed font-medium">{entrada.resumen}</p>

          {principal && (
            <div className="grid gap-0.75 overflow-hidden rounded-2xl border border-texto/10">
              <button
                type="button"
                onClick={() => setFotoAbierta(0)}
                aria-label={TEXTOS_BLOG.verFoto(principal.alt)}
                className="aspect-video cursor-zoom-in overflow-hidden bg-superficie"
              >
                <img src={principal.url} alt={principal.alt} className="size-full object-cover" />
              </button>
              {resto.length > 0 && (
                <div className="grid auto-cols-fr grid-flow-col gap-0.75">
                  {resto.map((imagen, indice) => (
                    <button
                      key={imagen.url}
                      type="button"
                      onClick={() => setFotoAbierta(indice + 1)}
                      aria-label={TEXTOS_BLOG.verFoto(imagen.alt)}
                      className="aspect-4/3 cursor-zoom-in overflow-hidden bg-superficie"
                    >
                      <img src={imagen.url} alt={imagen.alt} loading="lazy" className="size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-3.5">
            {parrafos(entrada.contenido).map((parrafo, indice) => (
              <p key={indice} className="text-[1.03rem] leading-[1.75]">
                {parrafo}
              </p>
            ))}
          </div>

          <Hashtags etiquetas={entrada.etiquetas} />
          {documentosDe([entrada]).map((documento) => (
            <DocumentLink key={documento.url} documento={documento} />
          ))}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={compartir}
              className="inline-flex items-center gap-2 rounded-full border border-texto/10 px-3.5 py-2 text-sm font-semibold text-texto transition-colors hover:bg-texto/8"
            >
              <Share2 className="size-4" aria-hidden />
              {TEXTOS_BLOG.compartir}
            </button>
            <span role="status" className="text-sm text-texto-suave">
              {copiado && TEXTOS_BLOG.copiado}
            </span>
          </div>
        </>
      )}
    </ReaderPanel>
  );
}
