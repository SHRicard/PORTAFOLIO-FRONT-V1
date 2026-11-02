import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * PATRÓN DE COMPONENTE CON VARIANTES
 * Un solo componente, varios estilos elegibles por props (<Button estilo="contorno" />).
 * Los colores salen de los tokens del tema (bg-primario, text-texto...), nunca de colores fijos,
 * así cambian cuando el panel cambia el tema.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-boton font-medium transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      estilo: {
        solido: "bg-primario text-primario-texto hover:bg-primario-hover",
        contorno: "border border-primario text-primario hover:bg-primario/10",
        texto: "text-primario hover:bg-primario/10",
        peligro: "bg-peligro text-peligro-texto hover:opacity-90",
      },
      tamano: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { estilo: "solido", tamano: "md" },
  },
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Muestra un spinner y deshabilita el botón (útil mientras se envía un formulario) */
  cargando?: boolean;
}

export function Button({ className, estilo, tamano, cargando, disabled, children, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} disabled={disabled || cargando} className={cn(buttonVariants({ estilo, tamano }), className)} {...props}>
      {cargando && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
