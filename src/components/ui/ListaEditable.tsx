import type { ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ListaEditableProps {
  titulo: string;
  ayuda?: string;
  /** Error de la lista entera (ej. superar el máximo de filas) */
  error?: string;
  textoAgregar: string;
  onAgregar: () => void;
  children: ReactNode;
}

/** Bloque de un formulario con filas que se agregan y se quitan (con useFieldArray) */
export function ListaEditable({ titulo, ayuda, error, textoAgregar, onAgregar, children }: ListaEditableProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-texto">{titulo}</legend>
      {ayuda && <p className="text-sm text-texto-suave">{ayuda}</p>}
      {children}
      {error && (
        <p role="alert" className="text-sm text-peligro">
          {error}
        </p>
      )}
      <Button estilo="contorno" tamano="sm" onClick={onAgregar}>
        <Plus className="size-4" aria-hidden />
        {textoAgregar}
      </Button>
    </fieldset>
  );
}

interface FilaEditableProps {
  /** Texto del botón para lectores de pantalla (ej. "Quitar repositorio 2") */
  etiquetaQuitar: string;
  onQuitar: () => void;
  children: ReactNode;
}

export function FilaEditable({ etiquetaQuitar, onQuitar, children }: FilaEditableProps) {
  return (
    <div className="flex items-start gap-2 rounded-boton border border-borde p-3">
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
      <Button estilo="texto" tamano="sm" aria-label={etiquetaQuitar} title={etiquetaQuitar} onClick={onQuitar}>
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
