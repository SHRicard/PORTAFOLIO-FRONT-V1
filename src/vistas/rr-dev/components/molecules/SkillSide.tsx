import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { SkillConstellation } from "@/vistas/rr-dev/components/molecules/SkillConstellation";
import {
  type AreaHabilidades,
  ENTRE,
  type Lado,
  PASO_MAXIMO,
  pasoParejo,
  tamanoPara,
} from "@/vistas/rr-dev/habilidades";

/** Ms entre el encendido de un área y el de la siguiente */
const PASO_AREA = 900;

interface SkillSideProps {
  /** Las columnas del costado, de la que da al texto hacia afuera. Cada una, sus áreas de arriba a abajo */
  columnas: AreaHabilidades[][];
  lado: Lado;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/**
 * Un costado de Habilidades: sus columnas de constelaciones, una al lado de la otra, pegadas al texto.
 * Mide el alto que le da la página y usa en todas la misma distancia entre burbujas, la más grande
 * que entra: así las burbujas del costado quedan en filas
 */
export function SkillSide({ columnas, lado, encender }: SkillSideProps) {
  const caja = useRef<HTMLDivElement>(null);
  const [alto, setAlto] = useState(0);

  useLayoutEffect(() => {
    const contenedor = caja.current;
    if (!contenedor) return;
    setAlto(contenedor.clientHeight);
    if (typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(() => setAlto(contenedor.clientHeight));
    observador.observe(contenedor);
    return () => observador.disconnect();
  }, []);

  // Sin medir todavía (o sin pantalla, como en los tests), la distancia más grande
  const paso = alto > 0 ? pasoParejo(alto, columnas) : PASO_MAXIMO;
  // Se encienden de a una: columna por columna, de la que da al texto hacia afuera
  const orden = (columna: number, area: number) =>
    columnas.slice(0, columna).reduce((suma, anteriores) => suma + anteriores.length, 0) + area;

  return (
    <div
      ref={caja}
      data-lado={lado}
      className={cn(
        "flex h-full min-h-0 items-start gap-3 min-[106.25rem]:gap-6",
        lado === "izquierda" && "flex-row-reverse",
      )}
    >
      {columnas.map((columna, c) => (
        <div key={c} className="grid content-start" style={{ rowGap: ENTRE[tamanoPara(paso)] }}>
          {columna.map((area, a) => (
            <SkillConstellation
              key={area.categoria}
              area={area}
              lado={lado}
              paso={paso}
              encender={encender === undefined ? undefined : encender + orden(c, a) * PASO_AREA}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
