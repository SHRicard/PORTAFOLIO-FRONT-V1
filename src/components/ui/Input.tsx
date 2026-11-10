import type { InputHTMLAttributes, ReactNode } from "react";
import { CalendarDays, CircleAlert, Link2, LockKeyhole, Mail, Phone, Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { cajaVariants, CONTROL_CON_ETIQUETA, EtiquetaFlotante, IconoCaja, useEtiquetaFlotante } from "./CajaCampo";

/** El ícono que va solo según el tipo de campo. Los de texto no llevan, salvo que se pida */
const ICONO_DEL_TIPO: Partial<Record<string, LucideIcon>> = {
  url: Link2,
  email: Mail,
  tel: Phone,
  month: CalendarDays,
  date: CalendarDays,
  password: LockKeyhole,
  search: Search,
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** El ícono de la izquierda. Si no se dice, sale del tipo (url, email, fecha...); null lo saca */
  icono?: LucideIcon | null;
  /** Un texto fijo antes de lo que se escribe (ej. "/proyectos/") */
  prefijo?: string;
  /** Lo que va adentro de la caja, a la derecha (ej. el botón Subir) */
  alFinal?: ReactNode;
}

/**
 * Campo de una línea. Dentro de un <Field> lleva su etiqueta adentro, que sube al escribir.
 * Con React Hook Form: <Input {...register("campo")} /> (en React 19 el ref viaja como prop).
 * className va al <input>
 */
export function Input({ className, invalid, icono, prefijo, alFinal, id, type, placeholder, ...props }: InputProps) {
  const etiqueta = useEtiquetaFlotante(id);
  const Icono = icono === undefined ? ICONO_DEL_TIPO[type ?? "text"] : icono;
  const conError = !!invalid;

  return (
    <div className={cajaVariants({ tamano: etiqueta ? "alto" : "normal", conError })}>
      {Icono && <IconoCaja icono={Icono} conError={conError} />}
      {prefijo && (
        <span
          className={cn(
            "flex shrink-0 items-center self-stretch text-[0.8125rem] text-texto-suave",
            !Icono && "pl-3.75",
            etiqueta && "pt-5 pb-1",
          )}
        >
          {prefijo}
        </span>
      )}
      <input
        id={id}
        type={type}
        // La etiqueta adentro necesita un ejemplo (aunque sea un espacio) para saber si está vacío
        placeholder={etiqueta ? placeholder || " " : placeholder}
        aria-invalid={invalid || undefined}
        className={cn(
          "peer h-full w-full min-w-0 flex-1 bg-transparent text-sm text-texto outline-none placeholder:text-texto-suave",
          prefijo ? "pr-3.75 pl-1" : Icono ? "pr-3.75" : "px-3.75",
          etiqueta && CONTROL_CON_ETIQUETA,
          "disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
      {etiqueta && (
        <EtiquetaFlotante htmlFor={id} reposa={prefijo ? "nunca" : "centro"} conIcono={!!Icono} conError={conError}>
          {etiqueta}
        </EtiquetaFlotante>
      )}
      {conError && <CircleAlert className="mr-3 size-4 shrink-0 text-peligro" aria-hidden />}
      {alFinal}
    </div>
  );
}
