import { useRef, useState, type ChangeEvent } from "react";
import { Copy, FileText, Smartphone, Trash2, Upload } from "lucide-react";
import {
  esApk,
  useEliminarArchivoMutation,
  useGetArchivosQuery,
  useSubirArchivoMutation,
} from "@/features/archivos/archivosApi";
import type { Archivo, TipoArchivo } from "@/features/archivos/types";
import { useGetEntradasAdminQuery } from "@/features/blog/blogApi";
import { useGetProyectosAdminQuery } from "@/features/proyectos/proyectosApi";
import { getErrorMessage } from "@/lib/errors";
import { carpetaDe } from "@/lib/validaciones";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

/** Para lo que no es de ningún proyecto */
const CARPETA_GENERAL = "biblioteca";

const nombreDe = (archivo: Archivo) => archivo.nombreOriginal ?? archivo.publicId;

function tipoDe(file: File): TipoArchivo {
  if (esApk(file)) return "apk";
  return file.type === "application/pdf" ? "documento" : "imagen";
}

/** Los APK siempre van a apk/: si se eligió un proyecto, a su subcarpeta */
const carpetaApk = (carpeta: string) => (carpeta.startsWith("proyectos/") ? carpeta.replace("proyectos/", "apk/") : "apk");

export default function ArchivosPage() {
  const { data: archivos, isLoading, error } = useGetArchivosQuery();
  const [subir, { isLoading: subiendo }] = useSubirArchivoMutation();
  const [eliminar] = useEliminarArchivoMutation();
  const { data: proyectos } = useGetProyectosAdminQuery();
  const { data: entradas } = useGetEntradasAdminQuery();
  const [carpeta, setCarpeta] = useState(CARPETA_GENERAL);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const selector = useRef<HTMLInputElement>(null);

  async function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = ""; // permite volver a elegir el mismo archivo si algo falló
    if (!archivo) return;

    setErrorAccion(null);
    try {
      const tipo = tipoDe(archivo);
      await subir({ archivo, tipo, carpeta: tipo === "apk" ? carpetaApk(carpeta) : carpeta }).unwrap();
    } catch (err) {
      setErrorAccion(getErrorMessage(err));
    }
  }

  async function copiar(archivo: Archivo) {
    setErrorAccion(null);
    try {
      await navigator.clipboard.writeText(archivo.url);
      setCopiado(archivo.id);
      setTimeout(() => setCopiado((actual) => (actual === archivo.id ? null : actual)), 2000);
    } catch {
      setErrorAccion("No se pudo copiar el link.");
    }
  }

  async function borrar(archivo: Archivo) {
    const mensaje = `¿Borrar "${nombreDe(archivo)}"? No se puede deshacer. Si tu portafolio lo usa, va a quedar con el link roto.`;
    if (!window.confirm(mensaje)) return;

    setErrorAccion(null);
    try {
      await eliminar(archivo.id).unwrap();
    } catch (err) {
      setErrorAccion(getErrorMessage(err));
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title>Archivos</Title>
          <Subtitle className="mt-1 text-base">
            Imágenes (JPG, PNG o WebP, hasta 5 MB), PDF (hasta 10 MB) y APK (hasta 200 MB).
          </Subtitle>
        </div>
        <Button cargando={subiendo} onClick={() => selector.current?.click()}>
          {!subiendo && <Upload className="size-4" aria-hidden />}
          Subir archivo
        </Button>
        <input
          ref={selector}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,.apk,application/vnd.android.package-archive"
          hidden
          onChange={alElegir}
        />
      </div>

      <div className="max-w-xs">
        <Select aria-label="Carpeta de destino" value={carpeta} onChange={(e) => setCarpeta(e.target.value)}>
          <option value={CARPETA_GENERAL}>Subir a la carpeta general</option>
          <optgroup label="Proyectos">
            {proyectos?.map((proyecto) => (
              <option key={proyecto.id} value={carpetaDe("proyectos", proyecto.slug, proyecto.titulo)}>
                Subir a {proyecto.titulo}
              </option>
            ))}
          </optgroup>
          <optgroup label="Blog">
            {entradas?.map((entrada) => (
              <option key={entrada.id} value={carpetaDe("blogs", entrada.slug, entrada.titulo)}>
                Subir a {entrada.titulo}
              </option>
            ))}
          </optgroup>
        </Select>
      </div>

      {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <Spinner />}
      {archivos?.length === 0 && <Alert>Todavía no subiste ningún archivo.</Alert>}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {archivos?.map((archivo) => (
          <li key={archivo.id}>
            <Card className="space-y-3 p-4">
              {archivo.tipo === "imagen" ? (
                <img
                  src={archivo.url}
                  alt=""
                  loading="lazy"
                  className="h-32 w-full rounded-boton border border-borde object-cover"
                />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-boton border border-borde bg-superficie">
                  {archivo.tipo === "apk" ? (
                    <Smartphone className="size-8 text-texto-suave" aria-hidden />
                  ) : (
                    <FileText className="size-8 text-texto-suave" aria-hidden />
                  )}
                </div>
              )}
              <p className="truncate text-sm text-texto" title={nombreDe(archivo)}>
                {nombreDe(archivo)}
              </p>
              <div className="flex items-center justify-between">
                <Button estilo="texto" tamano="sm" onClick={() => copiar(archivo)}>
                  <Copy className="size-4" aria-hidden />
                  {copiado === archivo.id ? "Copiado" : "Copiar link"}
                </Button>
                <Button
                  estilo="texto"
                  tamano="sm"
                  aria-label={`Borrar ${nombreDe(archivo)}`}
                  onClick={() => borrar(archivo)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
