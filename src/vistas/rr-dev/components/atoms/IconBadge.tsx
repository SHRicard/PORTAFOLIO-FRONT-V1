import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { TonoEstadistica } from "@/vistas/rr-dev/contenido";

const insignia = cva("inline-flex size-11 shrink-0 items-center justify-center rounded-full", {
  variants: {
    tono: {
      info: "bg-info/14 text-info",
      exito: "bg-exito/14 text-exito",
      aviso: "bg-aviso/14 text-aviso",
      rosa: "bg-rosa/14 text-rosa",
    },
  },
});

interface IconBadgeProps {
  icono: LucideIcon;
  tono: TonoEstadistica;
}

/** Icono dentro de un círculo teñido con su propio color. Es decorativo. */
export function IconBadge({ icono: Icono, tono }: IconBadgeProps) {
  return (
    <span aria-hidden className={insignia({ tono })}>
      <Icono className="size-5.5" />
    </span>
  );
}
