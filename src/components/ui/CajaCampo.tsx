import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * LA CAJA DE LOS CAMPOS DEL PANEL («Etiqueta flotante»)
 * Input, Textarea, Select y CampoFichas se dibujan igual: una caja redondeada con borde claro
 * y, si están dentro de un <Field>, su nombre va adentro: descansa en el medio mientras el campo
 * está vacío y sin foco, y sube y se achica al escribir. Con foco, borde y anillo violetas;
 * con error, rojos. Todo sale de los tokens del tema
 */
export const cajaVariants = cva(
  "group/caja relative flex w-full min-w-0 rounded-card border bg-fondo text-texto transition-[border-color,box-shadow] duration-300 " +
    "focus-within:ring-4 has-disabled:cursor-not-allowed has-disabled:opacity-50",
  {
    variants: {
      /** alto: con la etiqueta adentro · normal: sin etiqueta (ej. un filtro) · libre: crece con lo de adentro */
      tamano: { alto: "h-14.5 items-center", normal: "h-11.5 items-center", libre: "items-start" },
      conError: {
        false: "border-texto/15 hover:border-texto/26 focus-within:border-primario focus-within:ring-primario/16",
        true: "border-peligro ring-4 ring-peligro/12 focus-within:ring-peligro/16",
      },
    },
    defaultVariants: { tamano: "normal", conError: false },
  },
);

/** Lo que el <Field> le pasa al campo que tiene su id: su nombre, para dibujarlo adentro */
interface Campo {
  id: string;
  etiqueta: string;
  /** El campo avisa que dibuja la etiqueta: el Field no la repite afuera. Devuelve cómo deshacerlo */
  registrar: () => () => void;
}

export const CampoContexto = createContext<Campo | null>(null);

/**
 * El nombre que el campo tiene que dibujar adentro, si está dentro de un <Field> con su mismo
 * id. Sin Field (ej. un filtro con aria-label) devuelve undefined y el campo va sin etiqueta
 */
export function useEtiquetaFlotante(id: string | undefined): string | undefined {
  const campo = useContext(CampoContexto);
  const propio = campo !== null && id !== undefined && campo.id === id ? campo : null;
  const registrar = propio?.registrar;
  // Antes de pintar: el Field esconde su etiqueta de afuera sin que se llegue a ver dos veces
  useLayoutEffect(() => registrar?.(), [registrar]);
  return propio?.etiqueta;
}

const etiquetaVariants = cva(
  "pointer-events-none absolute top-2.5 right-3 truncate text-[0.71875rem] transition-[top,translate,font-size,color] " +
    "duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
  {
    variants: {
      /**
       * Dónde descansa mientras el campo está vacío y sin foco: en el medio (una línea), arriba
       * (un texto largo) o nunca (siempre muestra algo: una lista, una fecha, un prefijo, fichas)
       */
      reposa: {
        centro: "campo-vacio:top-1/2 campo-vacio:-translate-y-1/2 campo-vacio:text-sm",
        arriba: "campo-vacio:top-4.5 campo-vacio:text-sm",
        nunca: "",
      },
      conIcono: { true: "left-11", false: "left-3.75" },
      conError: {
        false: "text-texto-suave group-focus-within/caja:text-secundario",
        true: "text-peligro",
      },
    },
  },
);

interface EtiquetaFlotanteProps {
  htmlFor: string | undefined;
  reposa: "centro" | "arriba" | "nunca";
  conIcono: boolean;
  conError: boolean;
  children: ReactNode;
}

/** El nombre del campo, adentro de la caja. Va DESPUÉS del control (su «peer») */
export function EtiquetaFlotante({ htmlFor, reposa, conIcono, conError, children }: EtiquetaFlotanteProps) {
  return (
    <label htmlFor={htmlFor} className={etiquetaVariants({ reposa, conIcono, conError })}>
      {children}
    </label>
  );
}

/** El ícono de la izquierda: gris, violeta con foco y rojo con error */
export function IconoCaja({ icono: Icono, conError }: { icono: LucideIcon; conError: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid w-11 shrink-0 place-items-center self-stretch transition-colors duration-300",
        conError ? "text-peligro" : "text-texto-suave group-focus-within/caja:text-secundario",
      )}
    >
      <Icono className="size-4" />
    </span>
  );
}

/** Lo que va en el control cuando la etiqueta está adentro: deja lugar arriba y esconde el ejemplo hasta escribir */
export const CONTROL_CON_ETIQUETA = "pt-5 pb-1 placeholder:opacity-0 placeholder:transition-opacity focus:placeholder:opacity-70";
