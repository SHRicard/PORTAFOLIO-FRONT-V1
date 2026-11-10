import type { SelectHTMLAttributes } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { cajaVariants, EtiquetaFlotante, IconoCaja, useEtiquetaFlotante } from "./CajaCampo";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  /** Un ícono a la izquierda */
  icono?: LucideIcon;
  /** La flecha propia. false: la del navegador (ej. una lista con su propio diseño) */
  flecha?: boolean;
}

/**
 * Lista desplegable. Dentro de un <Field> lleva su etiqueta adentro, siempre arriba (una lista
 * siempre muestra algo). La flecha gira con el foco. className y style van al <select>
 */
export function Select({ className, invalid, icono, flecha = true, id, children, ...props }: SelectProps) {
  const etiqueta = useEtiquetaFlotante(id);
  const conError = !!invalid;

  return (
    <div className={cajaVariants({ tamano: etiqueta ? "alto" : "normal", conError })}>
      {icono && <IconoCaja icono={icono} conError={conError} />}
      <select
        id={id}
        aria-invalid={invalid || undefined}
        className={cn(
          "peer h-full w-full min-w-0 flex-1 cursor-pointer bg-transparent text-sm text-texto outline-none",
          "disabled:cursor-not-allowed [&_option]:bg-superficie [&_option]:text-texto",
          flecha ? "appearance-none pr-10" : "pr-3",
          icono ? "" : "pl-3.75",
          etiqueta && "pt-5 pb-1",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {etiqueta && (
        <EtiquetaFlotante htmlFor={id} reposa="nunca" conIcono={!!icono} conError={conError}>
          {etiqueta}
        </EtiquetaFlotante>
      )}
      {flecha && (
        <ChevronDown
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-3.5 size-4 transition-[rotate,color] duration-300 group-focus-within/caja:rotate-180",
            conError ? "text-peligro" : "text-texto-suave group-focus-within/caja:text-secundario",
          )}
        />
      )}
    </div>
  );
}
