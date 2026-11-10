import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  Check,
  Cloud,
  CloudUpload,
  Copy,
  ExternalLink,
  FileText,
  Folder,
  Paperclip,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  REGLAS_ARCHIVO,
  useEliminarArchivoMutation,
  useGetArchivosQuery,
  useSubirArchivoMutation,
  validarArchivo,
} from "@/features/archivos/archivosApi";
import { FilaArchivo, megas, nombreDe, TIPO_ARCHIVO } from "@/features/archivos/FilaArchivo";
import type { Archivo, TipoArchivo } from "@/features/archivos/types";
import { useGetEntradasAdminQuery } from "@/features/blog/blogApi";
import { useGetProyectosAdminQuery } from "@/features/proyectos/proyectosApi";
import { getErrorMessage } from "@/lib/errors";
import { carpetaDe } from "@/lib/validaciones";
import { Alert } from "@/components/ui/Alert";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useConfirmar } from "@/components/ui/Confirmar";
import { VistaFicha, VistaFoto } from "@/components/ui/DialogoConfirmar";
import { Field } from "@/components/ui/Field";
import { CabeceraLista } from "@/components/ui/FilaLista";
import { Seccion } from "@/components/ui/FormularioPanel";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

/** Para lo que no es de ningún proyecto */
const CARPETA_GENERAL = "biblioteca";

const tipoDe = (file: File): TipoArchivo => (file.type === "application/pdf" ? "documento" : "imagen");

/** La miniatura de un archivo elegido que todavía no se subió: la foto, o el ícono si es un PDF */
function MiniaturaLocal({ archivo }: { archivo: File }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!archivo.type.startsWith("image/")) return;
    const local = URL.createObjectURL(archivo);
    setUrl(local);
    return () => URL.revokeObjectURL(local);
  }, [archivo]);

  return (
    <div className="grid aspect-16/10 w-24 shrink-0 place-items-center overflow-hidden rounded-boton border border-borde bg-fondo text-texto-suave">
      {url ? <img src={url} alt="" className="size-full object-cover" /> : <FileText className="size-5" aria-hidden />}
    </div>
  );
}

/**
 * La biblioteca de archivos, con el formato de las otras listas del panel («Lista ordenada»): una fila por
 * archivo con la miniatura, el nombre, el formato y el tamaño, la carpeta y las acciones. «Elegir archivos»
 * no sube nada: lo elegido espera en «Por subir», con la carpeta de destino, hasta tocar «Subir»
 */
export default function ArchivosPage() {
  const { data: archivos, isLoading, error } = useGetArchivosQuery();
  const [subir] = useSubirArchivoMutation();
  const [eliminar] = useEliminarArchivoMutation();
  const { data: proyectos } = useGetProyectosAdminQuery();
  const { data: entradas } = useGetEntradasAdminQuery();
  const [carpeta, setCarpeta] = useState(CARPETA_GENERAL);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  // Lo elegido no se sube solo: espera en «Por subir» hasta tocar el botón
  const [porSubir, setPorSubir] = useState<File[]>([]);
  const [subiendo, setSubiendo] = useState(false);
  const confirmar = useConfirmar();
  const selector = useRef<HTMLInputElement>(null);

  /** Suma lo elegido a «Por subir». Lo que no sirve no se agrega: se avisa por qué */
  function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const elegidos = [...(evento.target.files ?? [])];
    evento.target.value = ""; // permite volver a elegir el mismo archivo
    const problemas: string[] = [];
    const validos = elegidos.filter((archivo) => {
      const problema = validarArchivo(archivo, REGLAS_ARCHIVO[tipoDe(archivo)]);
      if (problema) problemas.push(`${archivo.name}: ${problema}`);
      return !problema;
    });
    setErrorAccion(problemas.length > 0 ? problemas.join(" · ") : null);
    setPorSubir((actuales) => [...actuales, ...validos]);
  }

  /** El botón de subir: sube uno por uno a la carpeta elegida. Los que fallan quedan en la lista, con su error */
  async function subirTodo() {
    setErrorAccion(null);
    setSubiendo(true);
    const fallidos: File[] = [];
    const errores: string[] = [];
    for (const archivo of porSubir) {
      try {
        await subir({ archivo, tipo: tipoDe(archivo), carpeta }).unwrap();
      } catch (err) {
        fallidos.push(archivo);
        errores.push(`${archivo.name}: ${getErrorMessage(err)}`);
      }
    }
    setSubiendo(false);
    setPorSubir(fallidos);
    if (errores.length > 0) setErrorAccion(errores.join(" · "));
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
    const nombre = nombreDe(archivo);
    const confirmado = await confirmar({
      tipo: TIPO_ARCHIVO[archivo.tipo].etiqueta,
      titulo: "¿Borrar este archivo?",
      vista:
        archivo.tipo === "imagen" ? (
          <VistaFoto url={archivo.url} nombre={nombre} />
        ) : (
          <VistaFicha
            titulo={nombre}
            icono={FileText}
            detalle={`${archivo.formato.toUpperCase()} · ${megas(archivo.bytes)}`}
          />
        ),
      consecuencias: [
        { icono: Cloud, texto: "Se borra de Cloudinary y de la biblioteca" },
        { icono: RotateCcw, texto: "No se puede deshacer", tono: "suave" },
      ],
      aviso: "Si tu portafolio lo usa, va a quedar con el link roto.",
      textoConfirmar: "Borrar archivo",
    });
    if (!confirmado) return;

    setErrorAccion(null);
    try {
      await eliminar(archivo.id).unwrap();
    } catch (err) {
      setErrorAccion(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title>Archivos</Title>
          <Subtitle className="mt-1 text-base">
            Imágenes (JPG, PNG o WebP, hasta 5 MB) y PDF (hasta 10 MB). Los APK y los PDF más grandes van en GitHub:
            pegá su link en el proyecto.
          </Subtitle>
        </div>
        <Button disabled={subiendo} onClick={() => selector.current?.click()}>
          <Paperclip className="size-4" aria-hidden />
          Elegir archivos
        </Button>
        <input
          ref={selector}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          multiple
          hidden
          onChange={alElegir}
        />
      </div>

      {/* Lo elegido espera acá, con la carpeta a la que va, hasta tocar «Subir» */}
      {porSubir.length > 0 && (
        <Seccion
          icono={CloudUpload}
          tono="secundario"
          titulo="Por subir"
          descripcion={`${porSubir.length === 1 ? "1 archivo elegido" : `${porSubir.length} archivos elegidos`}: se suben recién al tocar «Subir»`}
        >
          <div className="@lg:max-w-md">
            <Field label="Carpeta de destino" htmlFor="carpeta-destino">
              <Select
                id="carpeta-destino"
                icono={Folder}
                aria-label="Carpeta de destino"
                value={carpeta}
                disabled={subiendo}
                onChange={(e) => setCarpeta(e.target.value)}
              >
                <option value={CARPETA_GENERAL}>La carpeta general</option>
                <optgroup label="Proyectos">
                  {proyectos?.map((proyecto) => (
                    <option key={proyecto.id} value={carpetaDe("proyectos", proyecto.slug, proyecto.titulo)}>
                      {proyecto.titulo}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Blog">
                  {entradas?.map((entrada) => (
                    <option key={entrada.id} value={carpetaDe("blogs", entrada.slug, entrada.titulo)}>
                      {entrada.titulo}
                    </option>
                  ))}
                </optgroup>
              </Select>
            </Field>
          </div>

          <ul className="divide-y divide-borde overflow-hidden rounded-card border border-borde bg-fondo">
            {porSubir.map((archivo, i) => (
              <li key={`${archivo.name}-${archivo.lastModified}-${i}`} className="flex items-center gap-3 p-3">
                <MiniaturaLocal archivo={archivo} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-texto" title={archivo.name}>
                    {archivo.name}
                  </p>
                  <p className="text-[0.8125rem] text-texto-suave">
                    {TIPO_ARCHIVO[tipoDe(archivo)].etiqueta} · {megas(archivo.size)}
                  </p>
                </div>
                <Button
                  estilo="texto"
                  tamano="sm"
                  aria-label={`Quitar ${archivo.name}`}
                  title={`Quitar ${archivo.name}`}
                  disabled={subiendo}
                  onClick={() => setPorSubir((actuales) => actuales.filter((_, j) => j !== i))}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap justify-end gap-2">
            <Button estilo="texto" disabled={subiendo} onClick={() => setPorSubir([])}>
              Descartar
            </Button>
            <Button cargando={subiendo} onClick={subirTodo}>
              {!subiendo && <Upload className="size-4" aria-hidden />}
              {porSubir.length === 1 ? "Subir 1 archivo" : `Subir ${porSubir.length} archivos`}
            </Button>
          </div>
        </Seccion>
      )}

      {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <Spinner />}
      {archivos?.length === 0 && <Alert>Todavía no subiste ningún archivo.</Alert>}

      {/* Una fila por archivo, del más nuevo al más viejo. Se acomodan al ancho de la lista (@container) */}
      {archivos && archivos.length > 0 && (
        <div className="@container overflow-hidden rounded-card border border-borde bg-superficie">
          <CabeceraLista conOrden={false} nombre="Archivo" dato="Formato y tamaño" columna="Carpeta" />
          <ul className="divide-y divide-borde">
            {archivos.map((archivo) => {
              const nombre = nombreDe(archivo);
              const yaCopiado = copiado === archivo.id;
              return (
                <li key={archivo.id}>
                  <FilaArchivo
                    archivo={archivo}
                    acciones={
                      <>
                        <a
                          href={archivo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonVariants({ estilo: "texto", tamano: "sm" })}
                          aria-label={`Abrir ${nombre}`}
                          title="Abrir"
                        >
                          <ExternalLink className="size-4" aria-hidden />
                        </a>
                        <Button
                          estilo="texto"
                          tamano="sm"
                          aria-label={yaCopiado ? `Link de ${nombre} copiado` : `Copiar el link de ${nombre}`}
                          title={yaCopiado ? "Copiado" : "Copiar link"}
                          onClick={() => copiar(archivo)}
                        >
                          {yaCopiado ? (
                            <Check className="size-4 text-exito" aria-hidden />
                          ) : (
                            <Copy className="size-4" aria-hidden />
                          )}
                        </Button>
                        <Button
                          estilo="texto"
                          tamano="sm"
                          aria-label={`Borrar ${nombre}`}
                          title="Borrar"
                          onClick={() => borrar(archivo)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </>
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
