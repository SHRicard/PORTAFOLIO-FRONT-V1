import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { cajaVariants, EtiquetaFlotante, useEtiquetaFlotante } from "./CajaCampo";

interface CampoFichasProps {
  /** id del cuadro donde se escribe: lo usa la etiqueta del Field */
  id: string;
  valores: string[];
  onCambio: (valores: string[]) => void;
  placeholder?: string;
  invalid?: boolean;
  /** Para el botón de quitar de cada ficha (ej. "Quitar React") */
  etiquetaQuitar?: (valor: string) => string;
}

/**
 * Una lista de textos cortos como fichas: se escribe uno y Enter (o una coma) lo agrega, y la
 * cruz lo quita. Al salir del cuadro, lo que quedó escrito también se agrega. No repite valores
 * (sin importar mayúsculas). Dentro de un <Field> lleva su etiqueta adentro, arriba.
 * Con React Hook Form va dentro de un <Controller />
 */
export function CampoFichas({
  id,
  valores,
  onCambio,
  placeholder,
  invalid,
  etiquetaQuitar = (valor) => `Quitar ${valor}`,
}: CampoFichasProps) {
  const [escrito, setEscrito] = useState("");
  const etiqueta = useEtiquetaFlotante(id);
  const conError = !!invalid;

  function agregar() {
    const nuevo = escrito.trim();
    setEscrito("");
    if (!nuevo || valores.some((v) => v.toLowerCase() === nuevo.toLowerCase())) return;
    onCambio([...valores, nuevo]);
  }

  function alPresionar(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === "Enter" || evento.key === ",") {
      evento.preventDefault();
      agregar();
    }
  }

  return (
    <div className={cn(cajaVariants({ tamano: "libre", conError }), "flex-wrap gap-1.5 p-2", etiqueta && "pt-7")}>
      {valores.map((valor) => (
        <span
          key={valor}
          className="inline-flex items-center gap-1 rounded-full border border-exito/30 bg-exito/10 py-1 pr-1 pl-2.5 text-[0.8125rem] font-medium text-texto"
        >
          {valor}
          <button
            type="button"
            aria-label={etiquetaQuitar(valor)}
            title={etiquetaQuitar(valor)}
            onClick={() => onCambio(valores.filter((v) => v !== valor))}
            className="grid size-5 place-items-center rounded-full text-texto-suave transition-colors hover:bg-texto/12 hover:text-texto"
          >
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={escrito}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        onChange={(e) => setEscrito(e.target.value)}
        onKeyDown={alPresionar}
        onBlur={agregar}
        className="peer min-w-44 flex-1 bg-transparent px-1.5 py-1 text-sm text-texto outline-none placeholder:text-texto-suave"
      />
      {etiqueta && (
        <EtiquetaFlotante htmlFor={id} reposa="nunca" conIcono={false} conError={conError}>
          {etiqueta}
        </EtiquetaFlotante>
      )}
    </div>
  );
}
