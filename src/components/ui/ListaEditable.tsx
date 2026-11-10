import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/** El botón para sumar una fila: chico y con borde, o un recuadro punteado a todo el ancho */
const agregarVariants = cva("", {
  variants: {
    estilo: {
      boton: "",
      recuadro:
        "h-11 w-full rounded-card border border-dashed border-primario/45 text-secundario hover:bg-primario/8",
    },
  },
  defaultVariants: { estilo: "boton" },
});

interface ListaEditableProps extends VariantProps<typeof agregarVariants> {
  titulo: string;
  ayuda?: string;
  /** Error de la lista entera (ej. superar el máximo de filas) */
  error?: string;
  textoAgregar: string;
  onAgregar: () => void;
  children: ReactNode;
}

/** Bloque de un formulario con filas que se agregan y se quitan (con useFieldArray) */
export function ListaEditable({ titulo, ayuda, error, textoAgregar, onAgregar, estilo, children }: ListaEditableProps) {
  return (
    <fieldset className="min-w-0 space-y-3">
      <legend className="text-sm font-medium text-texto">{titulo}</legend>
      {ayuda && <p className="text-sm text-texto-suave">{ayuda}</p>}
      {children}
      {error && (
        <p role="alert" className="text-sm text-peligro">
          {error}
        </p>
      )}
      <Button
        estilo={estilo === "recuadro" ? "texto" : "contorno"}
        tamano="sm"
        className={agregarVariants({ estilo })}
        onClick={onAgregar}
      >
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
  /** Quitar está trabajando (por ejemplo, eliminando en el backend): spinner y deshabilitado */
  quitando?: boolean;
  className?: string;
  children: ReactNode;
}

export function FilaEditable({ etiquetaQuitar, onQuitar, quitando, className, children }: FilaEditableProps) {
  return (
    <div className={cn("flex items-start gap-2 rounded-boton border border-borde p-3", className)}>
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
      <Button
        estilo="texto"
        tamano="sm"
        aria-label={etiquetaQuitar}
        title={etiquetaQuitar}
        cargando={quitando}
        onClick={onQuitar}
      >
        {!quitando && <X className="size-4" aria-hidden />}
      </Button>
    </div>
  );
}
