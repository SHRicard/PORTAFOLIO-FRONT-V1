import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { cajaVariants, CONTROL_CON_ETIQUETA, EtiquetaFlotante, useEtiquetaFlotante } from "./CajaCampo";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/**
 * Texto largo. Dentro de un <Field> lleva su etiqueta adentro, arriba a la izquierda.
 * Con React Hook Form: <Textarea {...register("campo")} />. className va al <textarea>
 */
export function Textarea({ className, invalid, rows = 4, id, placeholder, ...props }: TextareaProps) {
  const etiqueta = useEtiquetaFlotante(id);
  const conError = !!invalid;

  return (
    <div className={cajaVariants({ tamano: "libre", conError })}>
      <textarea
        id={id}
        rows={rows}
        placeholder={etiqueta ? placeholder || " " : placeholder}
        aria-invalid={invalid || undefined}
        className={cn(
          "peer w-full resize-y bg-transparent px-3.75 text-sm leading-relaxed text-texto outline-none placeholder:text-texto-suave",
          etiqueta ? cn(CONTROL_CON_ETIQUETA, "pt-7 pb-2.5") : "py-2.5",
          "disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
      {etiqueta && (
        <EtiquetaFlotante htmlFor={id} reposa="arriba" conIcono={false} conError={conError}>
          {etiqueta}
        </EtiquetaFlotante>
      )}
    </div>
  );
}
