import type { CSSProperties } from "react";
import { TechBubble } from "@/vistas/rr-dev/components/atoms/TechBubble";
import type { Tecnologia } from "@/vistas/rr-dev/contenido";

/** Tamaño de la caja donde se dibuja la forma, en píxeles */
const ANCHO = 150;
const ALTO = 312;

/** Centros de las burbujas del lado izquierdo: un arco "(" que abre hacia el centro. El derecho lo espeja. */
const PUNTOS = [
  { x: 108, y: 28, tamano: "md" },
  { x: 36, y: 156, tamano: "lg" },
  { x: 108, y: 284, tamano: "md" },
] as const;

/** Segundos entre los anillos de luz. `.pulso-luz` dura esto por la cantidad de puntos. */
const PASO_PULSO = 1.2;

interface TechConstellationProps {
  /** Hasta tres tecnologías, de arriba a abajo */
  items: Tecnologia[];
  /** Lado de la página en el que va: el arco abre hacia el centro */
  lado: "izquierda" | "derecha";
  /** Nombra la lista para los lectores de pantalla */
  etiqueta: string;
}

/** Logos unidos por líneas finas como una constelación, con un anillo de luz que los recorre */
export function TechConstellation({ items, lado, etiqueta }: TechConstellationProps) {
  const visibles = items.slice(0, PUNTOS.length);
  const puntos = PUNTOS.slice(0, visibles.length).map((punto) => ({
    ...punto,
    x: lado === "izquierda" ? punto.x : ANCHO - punto.x,
  }));

  return (
    <div className="relative shrink-0" style={{ width: ANCHO, height: ALTO }}>
      <svg
        aria-hidden
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="absolute inset-0 size-full overflow-visible text-secundario"
      >
        <polyline
          points={puntos.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.35}
          strokeWidth={1}
        />
      </svg>
      <ul aria-label={etiqueta}>
        {visibles.map((tecnologia, indice) => {
          const { x, y, tamano } = puntos[indice]!;

          return (
            <li
              key={tecnologia.id}
              className="pulso-luz absolute flex -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y, "--demora": `${indice * PASO_PULSO}s` } as CSSProperties}
            >
              <TechBubble tecnologia={tecnologia} tamano={tamano} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
