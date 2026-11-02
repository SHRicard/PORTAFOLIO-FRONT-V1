import { useRef, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSubirArchivoMutation } from "./archivosApi";
import type { TipoArchivo } from "./types";

const ACEPTA: Record<TipoArchivo, string> = {
  imagen: "image/jpeg,image/png,image/webp",
  documento: "application/pdf",
  apk: ".apk,application/vnd.android.package-archive",
};

interface CampoArchivoProps {
  id: string;
  tipo: TipoArchivo;
  /** Subcarpeta, ej. "proyectos/facturacion-fct" o "apk/facturacion-fct" */
  carpeta?: string;
  valor: string;
  onCambio: (url: string) => void;
  invalid?: boolean;
}

/**
 * Campo de URL con botón para subir el archivo. También se puede pegar una URL a mano.
 * Con React Hook Form va dentro de un <Controller />.
 */
export function CampoArchivo({ id, tipo, carpeta, valor, onCambio, invalid }: CampoArchivoProps) {
  const [subir, { isLoading }] = useSubirArchivoMutation();
  const [error, setError] = useState<string | null>(null);
  const selector = useRef<HTMLInputElement>(null);

  async function alElegir(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    evento.target.value = ""; // permite volver a elegir el mismo archivo si algo falló
    if (!archivo) return;

    setError(null);
    try {
      const registrado = await subir({ archivo, tipo, carpeta }).unwrap();
      onCambio(registrado.url);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          type="url"
          placeholder="https://..."
          invalid={invalid}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
        />
        <Button estilo="contorno" cargando={isLoading} onClick={() => selector.current?.click()}>
          {!isLoading && <Upload className="size-4" aria-hidden />}
          Subir
        </Button>
        <input ref={selector} type="file" accept={ACEPTA[tipo]} hidden onChange={alElegir} />
      </div>
      {error && (
        <p role="alert" className="text-sm text-peligro">
          {error}
        </p>
      )}
      {tipo === "imagen" && valor.startsWith("https://") && (
        <img src={valor} alt="" className="h-24 rounded-boton border border-borde object-cover" />
      )}
    </div>
  );
}
