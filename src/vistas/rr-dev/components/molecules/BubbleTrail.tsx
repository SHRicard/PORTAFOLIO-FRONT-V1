import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { SkillBubble } from "@/vistas/rr-dev/components/atoms/SkillBubble";

/**
 * La línea se dibuja en unidades de la burbuja: mide 12, el hueco entre dos es un tercio (4) y la de
 * los lugares pares baja un cuarto (3). Así la línea acompaña a las burbujas en cualquier tamaño
 */
const BURBUJA = 12;
const HUECO = 4;
const BAJA = 3;

interface BubbleTrailProps {
  /** Una burbuja por nombre: de él sale su logo */
  nombres: string[];
  /** El ícono de una burbuja sin logo */
  icono: LucideIcon;
  /** Los ms en que se encienden las burbujas y en que se empieza a trazar la línea (ver `useEncendido`) */
  encender?: number;
  trazar?: number;
}

/**
 * Burbujas en fila, en zigzag, unidas por una línea fina del color de `--tono`, como una constelación
 * acostada. Miden `--burbuja`. Son el dibujo: los nombres los dice el que la usa
 */
export function BubbleTrail({ nombres, icono, encender, trazar }: BubbleTrailProps) {
  const cantidad = nombres.length;
  const ancho = cantidad * BURBUJA + (cantidad - 1) * HUECO;
  const puntos = nombres.map(
    (_, indice) => `${BURBUJA / 2 + indice * (BURBUJA + HUECO)},${BURBUJA / 2 + (indice % 2) * BAJA}`,
  );

  return (
    <div className="relative" data-encender={encender}>
      <svg
        aria-hidden
        viewBox={`0 0 ${ancho} ${BURBUJA + BAJA}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible text-(--tono)"
      >
        <polyline
          points={puntos.join(" ")}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.45}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          data-trazar={trazar}
          data-durante={300 * Math.max(1, cantidad - 1)}
        />
      </svg>
      <ul aria-hidden className="relative flex gap-[calc(var(--burbuja)/3)] pb-[calc(var(--burbuja)/4)]">
        {nombres.map((nombre, indice) => (
          <li key={`${nombre}-${indice}`} className={cn(indice % 2 === 1 && "translate-y-[calc(var(--burbuja)/4)]")}>
            <SkillBubble nombre={nombre} icono={icono} pulso={indice * 1.2} />
          </li>
        ))}
      </ul>
    </div>
  );
}
