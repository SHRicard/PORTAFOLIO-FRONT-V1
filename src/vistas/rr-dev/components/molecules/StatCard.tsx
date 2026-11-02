import { IconBadge } from "@/vistas/rr-dev/components/atoms/IconBadge";
import type { Estadistica } from "@/vistas/rr-dev/contenido";

/** Icono teñido, un valor grande y su nombre. Arriba del texto en pantallas chicas: cuatro al lado no entran. */
export function StatCard({ valor, etiqueta, icono, tono }: Estadistica) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-2.5 pt-3.5 pb-3 text-center lg:flex-row lg:gap-3 lg:py-3 lg:pr-4.5 lg:pl-3 lg:text-left">
      <IconBadge icono={icono} tono={tono} />
      <div className="flex min-w-0 flex-col">
        <span className="font-titulo text-[1.375rem] leading-tight font-bold text-texto">{valor}</span>
        <span className="text-[0.8rem] text-texto">{etiqueta}</span>
      </div>
    </div>
  );
}
