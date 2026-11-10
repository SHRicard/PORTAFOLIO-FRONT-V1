import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import type { TonoEstadistica } from "@/vistas/rr-dev/contenido";

const burbuja = cva(
  "pulso-luz relative inline-flex shrink-0 items-center justify-center rounded-full border border-borde bg-superficie/75 shadow-(--sombra-isla) backdrop-blur-[10px]",
  {
    variants: {
      tono: { info: "text-info", exito: "text-exito", aviso: "text-aviso", rosa: "text-rosa" },
      // Más lejos, más chica: como las estrellas de una constelación que está más atrás
      lejania: { cerca: "size-13", lejos: "size-10", muyLejos: "size-8" },
    },
    defaultVariants: { lejania: "cerca" },
  },
);

const icono = cva("", {
  variants: { lejania: { cerca: "size-5.5", lejos: "size-4.5", muyLejos: "size-3.5" } },
  defaultVariants: { lejania: "cerca" },
});

export type Lejania = "cerca" | "lejos" | "muyLejos";

interface FactBubbleProps {
  icono: LucideIcon;
  tono: TonoEstadistica;
  /** Los segundos de espera del anillo de luz que late alrededor, como en la constelación de Inicio */
  pulso: number;
  lejania?: Lejania;
}

/** Burbuja de vidrio con el ícono de un dato curioso, teñido como los de StatsBar. Es decorativa */
export function FactBubble({ icono: Icono, tono, pulso, lejania }: FactBubbleProps) {
  return (
    <span aria-hidden className={burbuja({ tono, lejania })} style={{ "--demora": `${pulso}s` } as CSSProperties}>
      <Icono className={icono({ lejania })} />
    </span>
  );
}
