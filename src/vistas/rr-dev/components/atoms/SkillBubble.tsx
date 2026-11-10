import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { BrandLogo } from "@/vistas/rr-dev/components/atoms/BrandLogo";
import { logoTecnologia } from "@/vistas/rr-dev/logos";

/**
 * El color de un área en `--tono`: lo toman su línea, el punto de su nombre, el borde y el anillo de
 * sus burbujas y la tarjeta de cada habilidad (estilos.css). Va en la constelación entera
 */
export const tonoArea = cva("", {
  variants: {
    tono: {
      info: "[--tono:var(--info)]",
      exito: "[--tono:var(--exito)]",
      aviso: "[--tono:var(--aviso)]",
      rosa: "[--tono:var(--rosa)]",
      neutro: "[--tono:var(--texto-suave)]",
    },
  },
});

interface SkillBubbleProps {
  /** El nombre de la habilidad: de él sale su logo */
  nombre: string;
  /** El ícono de su área, para una habilidad sin logo */
  icono: LucideIcon;
  /** Los segundos de espera del anillo de luz que late alrededor, como en la constelación de Inicio */
  pulso: number;
}

/**
 * Burbuja de vidrio con el logo de una habilidad, como las de Inicio, con el borde y el anillo del
 * color de su área. Mide `--burbuja`. Es decorativa: el nombre va al lado
 */
export function SkillBubble({ nombre, icono: Icono, pulso }: SkillBubbleProps) {
  const logo = logoTecnologia(nombre);
  return (
    <span
      aria-hidden
      className="burbuja-habilidad pulso-luz relative inline-flex size-(--burbuja) shrink-0 items-center justify-center rounded-full border bg-superficie/75 text-texto-suave shadow-(--sombra-isla) backdrop-blur-[10px] transition-[color,border-color,scale] duration-300 ease-(--rebote) hover:scale-108"
      style={{ "--demora": `${pulso}s` } as CSSProperties}
    >
      {logo ? <BrandLogo logo={logo} className="size-[46%]" /> : <Icono className="size-[46%]" />}
    </span>
  );
}
