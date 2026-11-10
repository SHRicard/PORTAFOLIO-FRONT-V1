import { useContext, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  CircleCheck,
  CloudUpload,
  ExternalLink,
  File as Hoja,
  FilePlus2,
  Link2,
  Paperclip,
  RefreshCw,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { REGLAS_ARCHIVO, useSubirArchivoMutation, validarArchivo } from "./archivosApi";
import { SubidasPendientesContexto } from "./subidasPendientes";

/** 3774874 -> "3,6 MB" */
const megas = (bytes: number) => `${(bytes / 1024 / 1024).toLocaleString("es-AR", { maximumFractionDigits: 1 })} MB`;

/** El servidor de un link pegado a mano (ej. "github.com"), o null si es de Cloudinary o no es un link */
function linkExterno(valor: string): string | null {
  if (!valor.startsWith("https://")) return null;
  try {
    const { hostname } = new URL(valor);
    return hostname.endsWith("cloudinary.com") ? null : hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Los botones chicos de la línea de estado */
const ACCION = "h-7 px-2 text-[0.8125rem]";

interface CampoPdfProps {
  id: string;
  valor: string;
  onCambio: (url: string) => void;
  /** Subcarpeta, ej. "proyectos/facturacion-fct" (solo si sube al elegir, fuera de SubidasPendientesContexto) */
  carpeta?: string;
  /** Error del link (del esquema o del backend) */
  error?: string;
  /** Lo que va al lado del ícono, arriba del estado (ej. el campo Título) */
  children?: ReactNode;
  /** Con «Quitar», que vacía el campo. Para un PDF suelto (ej. un certificado); en una lista lo quita su fila */
  quitable?: boolean;
}

/**
 * Un PDF de un formulario, sin mostrar su link: a la izquierda el ícono del PDF y al lado lo que se pase en
 * children (el título) con el estado debajo: «PDF guardado» con «Abrir», el archivo elegido con «Se sube al
 * guardar», o «Elegir PDF» si no tiene. Un PDF de más de 10 MB no entra en Cloudinary: para esos, sin archivo,
 * «¿Más de 10 MB? Pegá el link» muestra un campo para el link de GitHub (también se abre solo si el PDF elegido
 * es demasiado grande). Un link pegado se ve en ese campo; uno de Cloudinary, nunca.
 * Dentro de SubidasPendientesContexto, elegir no sube nada hasta guardar. Con React Hook Form, dentro de un <Controller />
 */
export function CampoPdf({ id, valor, onCambio, carpeta, error, children, quitable }: CampoPdfProps) {
  const [subir, { isLoading }] = useSubirArchivoMutation();
  const subidas = useContext(SubidasPendientesContexto);
  const selector = useRef<HTMLInputElement>(null);
  const [problema, setProblema] = useState<string | null>(null);
  const externo = linkExterno(valor);
  const [pegando, setPegando] = useState(externo !== null);
  /** Lo escrito en el campo del link (el valor del formulario puede ser otro mientras no empiece con https://) */
  const [link, setLink] = useState(externo ? valor : "");
  const sinSubir = subidas?.pendiente(valor);
  const guardado = valor.startsWith("https://") && !externo;
  const vacio = !sinSubir && !guardado && !externo;
  const elegir = () => selector.current?.click();

  async function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = ""; // permite volver a elegir el mismo archivo
    if (!archivo) return;

    const motivo = validarArchivo(archivo, REGLAS_ARCHIVO.documento);
    setProblema(motivo);
    if (motivo) {
      // Demasiado grande para Cloudinary: va el link de GitHub
      if (archivo.size > REGLAS_ARCHIVO.documento.maxBytes) setPegando(true);
      return;
    }
    setPegando(false);
    setLink("");
    if (subidas) {
      onCambio(subidas.agregar(archivo, "documento"));
      return;
    }
    try {
      const registrado = await subir({ archivo, tipo: "documento", carpeta }).unwrap();
      onCambio(registrado.url);
    } catch (err) {
      setProblema(getErrorMessage(err));
    }
  }

  function quitar() {
    setProblema(null);
    setPegando(false);
    setLink("");
    onCambio("");
  }

  // El botón principal lleva el id cuando no está el campo del link: la etiqueta y el foco del error van ahí
  const idBoton = pegando ? undefined : id;

  return (
    <div className="flex items-start gap-3.5">
      {/* El ícono: una hoja con la etiqueta PDF; punteado mientras no tiene archivo */}
      <span
        aria-hidden
        className={cn(
          "relative mt-0.5 grid h-15 w-12 shrink-0 place-items-center rounded-boton",
          vacio
            ? "border border-dashed border-texto/25 text-texto-suave"
            : "bg-rosa/12 text-rosa ring-1 ring-rosa/30 ring-inset",
        )}
      >
        {vacio ? <FilePlus2 className="size-5" /> : <Hoja className="-mt-2.5 size-6" strokeWidth={1.75} />}
        {!vacio && (
          <span className="absolute bottom-2 rounded-[0.1875rem] bg-rosa px-1 text-[0.5625rem] leading-3.5 font-bold tracking-wider text-fondo">
            PDF
          </span>
        )}
      </span>

      <div className="min-w-0 flex-1 space-y-2">
        {children}

        {/* El estado del archivo y lo que se puede hacer con él */}
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 text-[0.8125rem] text-texto-suave">
          {sinSubir && (
            <span className="mr-2 flex min-w-0 items-center gap-1.5">
              <CloudUpload className="size-4 shrink-0" aria-hidden />
              <span className="truncate" title={sinSubir.name}>
                {sinSubir.name} · {megas(sinSubir.size)} · se sube al guardar
              </span>
            </span>
          )}
          {guardado && (
            <span className="mr-2 flex items-center gap-1.5 text-texto">
              <CircleCheck className="size-4 shrink-0 text-exito" aria-hidden />
              PDF guardado
            </span>
          )}
          {externo && (
            <span className="mr-2 flex min-w-0 items-center gap-1.5 text-texto">
              <Link2 className="size-4 shrink-0" aria-hidden />
              <span className="truncate">Link a {externo}</span>
            </span>
          )}
          {vacio && !pegando && <span className="mr-2">Todavía no tiene el PDF</span>}

          {(guardado || externo) && (
            <a
              href={valor}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 items-center gap-1.5 rounded-boton px-2 font-medium text-secundario transition-colors hover:bg-primario/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secundario"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              Abrir
            </a>
          )}
          <Button
            id={idBoton}
            estilo={vacio ? "contorno" : "texto"}
            tamano="sm"
            className={vacio ? undefined : ACCION}
            aria-invalid={(!!error && !pegando) || undefined}
            cargando={isLoading}
            onClick={elegir}
          >
            {!isLoading &&
              (vacio ? <Paperclip className="size-4" aria-hidden /> : <RefreshCw className="size-3.5" aria-hidden />)}
            {vacio ? "Elegir PDF" : "Cambiar"}
          </Button>
          {quitable && !vacio && (
            <Button estilo="texto" tamano="sm" className={ACCION} onClick={quitar}>
              <X className="size-3.5" aria-hidden />
              Quitar
            </Button>
          )}
          {vacio && !pegando && (
            <Button estilo="texto" tamano="sm" className={ACCION} onClick={() => setPegando(true)}>
              <Link2 className="size-3.5" aria-hidden />
              ¿Más de 10 MB? Pegá el link
            </Button>
          )}
        </div>

        {pegando && (
          <Field label="Link del PDF" htmlFor={id} ayuda="Para los PDF de más de 10 MB: subilo a GitHub y pegá el link">
            <Input
              id={id}
              type="url"
              placeholder="https://github.com/..."
              invalid={!!error}
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                onCambio(e.target.value);
              }}
            />
          </Field>
        )}
        <input ref={selector} id={`${id}-archivo`} type="file" accept="application/pdf" hidden onChange={alElegir} />
        {(problema || error) && (
          <p role="alert" className="text-sm text-peligro">
            {problema ?? error}
          </p>
        )}
      </div>
    </div>
  );
}
