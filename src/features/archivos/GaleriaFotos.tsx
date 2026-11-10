import { useContext, useRef, useState, type ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { CloudUpload, ImageUp, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { ListaEditable } from "@/components/ui/ListaEditable";
import { REGLAS_ARCHIVO, validarArchivo } from "./archivosApi";
import { SubidasPendientesContexto } from "./subidasPendientes";

const ACEPTA_FOTOS = "image/jpeg,image/png,image/webp";

/** Lo que va encima de la miniatura: se lee sobre cualquier foto */
const SOBRE_FOTO = "border border-borde bg-fondo/75 text-texto backdrop-blur-md hover:bg-fondo";

/** Una foto de la galería, como la arma el formulario con su `useFieldArray` */
export interface FotoGaleria {
  /** El id de la fila de `useFieldArray` */
  id: string;
  /** El link, la URL local de una elegida sin subir (blob:), o vacío si todavía no tiene archivo */
  url: string;
  errorUrl?: string;
  errorDescripcion?: string;
}

interface GaleriaFotosProps {
  fotos: FotoGaleria[];
  /** `register("galeria.<i>.alt")`: la descripción de cada foto */
  descripcion: (indice: number) => UseFormRegisterReturn;
  /** Suma al final las fotos elegidas (sus URL locales), con la descripción vacía */
  onAgregar: (urls: string[]) => void;
  /** Pone el archivo elegido en una foto que todavía no tenía */
  onElegir: (indice: number, url: string) => void;
  onQuitar: (indice: number) => void;
  /** La URL que se está eliminando (si quitar llama al backend): su botón queda cargando */
  quitando?: string | null;
  /** El error de la lista entera (ej. el máximo de fotos) */
  error?: string;
}

/**
 * La galería de un formulario: arriba, las miniaturas (4 por fila si el formulario es ancho), cada una con su
 * descripción debajo; abajo, «Agregar fotos», que deja elegir varias a la vez. No muestra links. Va dentro de
 * SubidasPendientesContexto: lo elegido queda a la vista y se sube al guardar el formulario
 */
export function GaleriaFotos({
  fotos,
  descripcion,
  onAgregar,
  onElegir,
  onQuitar,
  quitando,
  error,
}: GaleriaFotosProps) {
  const subidas = useContext(SubidasPendientesContexto);
  const selector = useRef<HTMLInputElement>(null);
  /** La foto que se está eligiendo para una fila sin imagen; null: «Agregar fotos» */
  const destino = useRef<number | null>(null);
  const [problemas, setProblemas] = useState<string | null>(null);

  function abrir(fila: number | null) {
    destino.current = fila;
    if (!selector.current) return;
    selector.current.multiple = fila === null;
    selector.current.click();
  }

  /** Suma lo elegido a la galería. Lo que no sirve no se agrega: se avisa por qué */
  function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const elegidos = [...(evento.target.files ?? [])];
    evento.target.value = ""; // permite volver a elegir el mismo archivo
    const errores: string[] = [];
    const validos = elegidos.filter((archivo) => {
      const problema = validarArchivo(archivo, REGLAS_ARCHIVO.imagen);
      if (problema) errores.push(`${archivo.name}: ${problema}`);
      return !problema;
    });
    setProblemas(errores.length > 0 ? errores.join(" · ") : null);
    if (!subidas || validos.length === 0) return;

    const urls = validos.map((archivo) => subidas.agregar(archivo, "imagen"));
    const fila = destino.current;
    if (fila !== null) onElegir(fila, urls[0] ?? "");
    else onAgregar(urls);
  }

  return (
    <ListaEditable
      titulo="Galería"
      ayuda="Podés elegir varias fotos a la vez: JPG, PNG o WebP, hasta 5 MB cada una."
      error={error}
      textoAgregar="Agregar fotos"
      onAgregar={() => abrir(null)}
    >
      {fotos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 @xl:grid-cols-3 @3xl:grid-cols-4">
          {fotos.map(({ id, url, errorUrl, errorDescripcion }, i) => {
            const sinSubir = subidas?.pendiente(url);
            const eliminando = !!url && quitando === url;
            return (
              <li key={id} className="min-w-0 space-y-2 rounded-card border border-borde bg-fondo p-2">
                <div className="relative h-32 overflow-hidden rounded-boton border border-borde bg-superficie">
                  {url ? (
                    <img src={url} alt="" className="size-full object-contain" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => abrir(i)}
                      className="grid size-full place-content-center justify-items-center gap-1.5 text-sm font-medium text-secundario transition-colors hover:bg-primario/8 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secundario"
                    >
                      <ImageUp className="size-5" aria-hidden />
                      Elegir foto
                    </button>
                  )}
                  <Button
                    estilo="texto"
                    tamano="sm"
                    className={cn(SOBRE_FOTO, "absolute top-1.5 right-1.5 w-8 px-0")}
                    aria-label={`Quitar imagen ${i + 1}`}
                    title={`Quitar imagen ${i + 1}`}
                    cargando={eliminando}
                    onClick={() => onQuitar(i)}
                  >
                    {!eliminando && <X className="size-4" aria-hidden />}
                  </Button>
                  {sinSubir && (
                    <span
                      className={cn(
                        SOBRE_FOTO,
                        "absolute bottom-1.5 left-1.5 flex max-w-[calc(100%-0.75rem)] items-center gap-1.5 rounded-full px-2 py-0.5 text-xs",
                      )}
                      title={sinSubir.name}
                    >
                      <CloudUpload className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">Se sube al guardar</span>
                    </span>
                  )}
                </div>
                {errorUrl && (
                  <p role="alert" className="text-sm text-peligro">
                    {errorUrl}
                  </p>
                )}
                <Field label="Descripción" htmlFor={`galeria-alt-${i}`} error={errorDescripcion}>
                  <Input id={`galeria-alt-${i}`} invalid={!!errorDescripcion} {...descripcion(i)} />
                </Field>
              </li>
            );
          })}
        </ul>
      )}
      <input
        ref={selector}
        id="galeria-archivos"
        type="file"
        accept={ACEPTA_FOTOS}
        multiple
        hidden
        onChange={alElegir}
      />
      {problemas && (
        <p role="alert" className="text-sm text-peligro">
          {problemas}
        </p>
      )}
    </ListaEditable>
  );
}
