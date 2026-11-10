import { useContext, useRef, useState, type ChangeEvent } from "react";
import {
  CloudUpload,
  FileText,
  Image as ImageIcon,
  ImageUp,
  Paperclip,
  RefreshCw,
  Trash2,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { REGLAS_ARCHIVO, useSubirArchivoMutation, validarArchivo } from "./archivosApi";
import { SubidasPendientesContexto } from "./subidasPendientes";
import type { TipoArchivo } from "./types";

const ACEPTA: Record<TipoArchivo, string> = {
  imagen: "image/jpeg,image/png,image/webp",
  documento: "application/pdf",
};

/** El ícono de la caja, según qué se sube */
const ICONO: Record<TipoArchivo, LucideIcon> = { imagen: ImageIcon, documento: FileText };

/** Los botones que van encima de la foto: se leen sobre cualquier imagen */
const SOBRE_FOTO = "border border-borde bg-fondo/75 text-texto backdrop-blur-md hover:bg-fondo";

interface CampoArchivoProps {
  id: string;
  tipo: TipoArchivo;
  /** Subcarpeta, ej. "proyectos/facturacion-fct" */
  carpeta?: string;
  valor: string;
  onCambio: (url: string) => void;
  invalid?: boolean;
  /**
   * "campo" (por defecto): la URL con el botón Subir. "recuadro" (solo imágenes): un recuadro grande
   * con la foto, o vacío con un botón para elegirla. Sin la URL: el id va en el botón de elegir
   */
  vista?: "campo" | "recuadro";
  /** Lo que dice el recuadro vacío (ej. "Subí la portada") */
  textoVacio?: string;
  ayudaVacio?: string;
  /** Lo que hace «Quitar» del recuadro. Por defecto, vacía el campo */
  onQuitar?: () => void;
  /** «Quitar» está trabajando (por ejemplo, eliminando el archivo en el backend): spinner y deshabilitado */
  quitando?: boolean;
}

/**
 * Campo de URL con botón para subir el archivo. También se puede pegar una URL a mano (en el recuadro, no:
 * ahí solo se elige el archivo).
 * Con React Hook Form va dentro de un <Controller />.
 * Dentro de SubidasPendientesContexto (el formulario de proyectos), elegir un archivo no lo sube: queda
 * a la vista, con su nombre, y se sube al guardar el formulario
 */
export function CampoArchivo({
  id,
  tipo,
  carpeta,
  valor,
  onCambio,
  invalid,
  vista = "campo",
  textoVacio = "Subí una imagen",
  ayudaVacio = "JPG, PNG o WebP, hasta 5 MB",
  onQuitar,
  quitando,
}: CampoArchivoProps) {
  const [subir, { isLoading }] = useSubirArchivoMutation();
  const subidas = useContext(SubidasPendientesContexto);
  const [error, setError] = useState<string | null>(null);
  const selector = useRef<HTMLInputElement>(null);
  const recuadro = vista === "recuadro";
  // Elegido y todavía sin subir: el valor es una URL local (blob:) que sirve para verlo
  const sinSubir = subidas?.pendiente(valor);
  const conFoto = tipo === "imagen" && (valor.startsWith("https://") || !!sinSubir);
  const elegir = () => selector.current?.click();

  async function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = ""; // permite volver a elegir el mismo archivo si algo falló
    if (!archivo) return;

    setError(null);
    if (subidas) {
      // Se sube al guardar: ahora solo se revisa, para avisar antes
      const problema = validarArchivo(archivo, REGLAS_ARCHIVO[tipo]);
      if (problema) setError(problema);
      else onCambio(subidas.agregar(archivo, tipo));
      return;
    }
    try {
      const registrado = await subir({ archivo, tipo, carpeta }).unwrap();
      onCambio(registrado.url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-2">
      {recuadro &&
        (conFoto ? (
          <div className="relative aspect-16/10 overflow-hidden rounded-card border border-borde bg-fondo">
            <img src={valor} alt="" className="size-full object-cover object-top" />
            <div className="absolute right-2.5 bottom-2.5 flex gap-1.5">
              <Button
                id={id}
                estilo="texto"
                tamano="sm"
                className={SOBRE_FOTO}
                aria-invalid={invalid || undefined}
                cargando={isLoading}
                onClick={elegir}
              >
                {!isLoading && <RefreshCw className="size-4" aria-hidden />}
                Cambiar
              </Button>
              <Button
                estilo="texto"
                tamano="sm"
                className={SOBRE_FOTO}
                aria-label="Quitar la imagen"
                title="Quitar la imagen"
                cargando={quitando}
                onClick={onQuitar ?? (() => onCambio(""))}
              >
                {!quitando && <Trash2 className="size-4" aria-hidden />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid aspect-16/10 place-items-center rounded-card border border-dashed border-primario/45 bg-fondo bg-[radial-gradient(ellipse_at_50%_120%,color-mix(in_srgb,var(--primario)_14%,transparent),transparent_70%)] p-4 text-center">
            <div className="grid justify-items-center gap-2">
              <span className="grid size-12 place-items-center rounded-full bg-secundario/14 text-secundario ring-1 ring-secundario/30">
                <ImageUp className="size-5" aria-hidden />
              </span>
              <p className="text-sm font-semibold text-texto">{textoVacio}</p>
              <p className="text-xs text-texto-suave">{ayudaVacio}</p>
              <Button
                id={id}
                estilo="contorno"
                tamano="sm"
                className="mt-1"
                aria-invalid={invalid || undefined}
                cargando={isLoading}
                onClick={elegir}
              >
                {!isLoading && <Upload className="size-4" aria-hidden />}
                Elegir imagen
              </Button>
            </div>
          </div>
        ))}

      {/* El selector de archivos: escondido, lo abren los botones */}
      <input ref={selector} id={`${id}-archivo`} type="file" accept={ACEPTA[tipo]} hidden onChange={alElegir} />
      {/* En el campo, «Subir» (o «Elegir», si se sube al guardar) va adentro de la caja, a la derecha.
          Un archivo sin subir muestra su nombre: no hay link que editar todavía */}
      {!recuadro && (
        <Input
          id={id}
          type={sinSubir ? "text" : "url"}
          icono={ICONO[tipo]}
          placeholder="https://..."
          invalid={invalid}
          value={sinSubir ? sinSubir.name : valor}
          readOnly={!!sinSubir}
          onChange={(e) => onCambio(e.target.value)}
          alFinal={
            <Button estilo="contorno" tamano="sm" className="mr-2.5 shrink-0" cargando={isLoading} onClick={elegir}>
              {!isLoading &&
                (subidas ? <Paperclip className="size-4" aria-hidden /> : <Upload className="size-4" aria-hidden />)}
              {subidas ? "Elegir" : "Subir"}
            </Button>
          }
        />
      )}
      {error && (
        <p role="alert" className="text-sm text-peligro">
          {error}
        </p>
      )}
      {sinSubir && (
        <p className="flex items-center gap-1.5 text-xs text-texto-suave">
          <CloudUpload className="size-3.5 shrink-0" aria-hidden />
          {recuadro ? `${sinSubir.name} · se sube al guardar` : "Se sube al guardar"}
        </p>
      )}
      {!recuadro && conFoto && (
        <img src={valor} alt="" className="h-24 rounded-boton border border-borde object-cover" />
      )}
    </div>
  );
}
