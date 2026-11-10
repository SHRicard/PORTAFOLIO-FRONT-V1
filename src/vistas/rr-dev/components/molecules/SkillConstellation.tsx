import { cva } from "class-variance-authority";
import { type CSSProperties, useId } from "react";
import { cn } from "@/lib/cn";
import { SkillBubble, tonoArea } from "@/vistas/rr-dev/components/atoms/SkillBubble";
import { apartado } from "@/vistas/rr-dev/components/molecules/FactConstellation";
import { type AreaHabilidades, type Lado, medidasPara, ROTULO } from "@/vistas/rr-dev/habilidades";

/** Al entrar al apartado: ms entre una habilidad y la siguiente, y cuánto después del nombre del área empieza la línea */
const PASO_ENCENDIDO = 450;
const DEMORA_LINEA = 730;

const rotulo = cva("flex items-start gap-2 font-medium whitespace-nowrap text-texto-suave uppercase", {
  variants: {
    tamano: { grande: "text-xs tracking-[.22em]", chica: "text-[0.625rem] tracking-[.18em]" },
  },
});

const nombre = cva("tarjeta-habilidad rounded-lg font-semibold whitespace-nowrap text-texto", {
  variants: {
    tamano: { grande: "px-2.25 py-0.75 text-sm", chica: "px-1.75 py-0.5 text-[0.71875rem]" },
  },
});

interface SkillConstellationProps {
  area: AreaHabilidades;
  /** Lado de la página en el que va: el arco abre hacia el texto */
  lado: Lado;
  /** La distancia entre dos burbujas, en px: de ella salen las demás medidas */
  paso: number;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/**
 * Las habilidades de un área como la constelación de Sobre mí: arriba, el nombre del área y cuántas
 * tiene; debajo, una burbuja por habilidad en un arco que abre hacia el texto, unidas por una línea
 * fina del color del área, y el nombre de cada una en una tarjeta de ese color, hacia afuera
 */
export function SkillConstellation({ area, lado, paso, encender }: SkillConstellationProps) {
  const izquierda = lado === "izquierda";
  const { tamano, burbuja, curva, hueco } = medidasPara(paso);
  const id = useId();
  const cantidad = area.habilidades.length;
  // La línea se dibuja en píxeles, desde el borde que da al texto
  const ancho = curva + burbuja;
  const puntos = area.habilidades.map((_, indice) => {
    const desdeElBorde = apartado(indice, cantidad, curva) + burbuja / 2;
    return `${izquierda ? ancho - desdeElBorde : desdeElBorde},${((indice + 0.5) * paso).toFixed(1)}`;
  });

  return (
    <section
      aria-labelledby={id}
      className={cn(tonoArea({ tono: area.tono }), "grid", izquierda ? "justify-items-end" : "justify-items-start")}
      style={{ gridTemplateRows: `${ROTULO[tamano]}px auto`, "--burbuja": `${burbuja}px` } as CSSProperties}
    >
      {/* Encima de la Tierra se apoya en un vidrio oscuro (ver useSobrePlaneta) */}
      <p id={id} data-encender={encender} data-respaldo className={rotulo({ tamano })}>
        <span aria-hidden className="punto-area mt-1 size-1.5 shrink-0 rounded-full" />
        {area.nombre} <span className="font-semibold tracking-normal text-(--tono)">{cantidad}</span>
      </p>
      <div className="relative">
        <svg
          aria-hidden
          viewBox={`0 0 ${ancho} ${cantidad * paso}`}
          className={cn("absolute top-0 overflow-visible text-(--tono)", izquierda ? "right-0" : "left-0")}
          style={{ width: ancho, height: cantidad * paso }}
        >
          {/* Con otra distancia la línea es otra: así el encendido la vuelve a recorrer con su largo nuevo */}
          <polyline
            key={paso}
            points={puntos.join(" ")}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.45}
            strokeWidth={1}
            data-trazar={encender === undefined ? undefined : encender + DEMORA_LINEA}
            data-durante={PASO_ENCENDIDO * Math.max(1, cantidad - 1)}
          />
        </svg>
        <ul aria-labelledby={id} className={cn("relative flex flex-col", izquierda ? "items-end" : "items-start")}>
          {area.habilidades.map((habilidad, indice) => (
            <li
              key={`${habilidad}-${indice}`}
              className={cn("flex items-center", izquierda && "flex-row-reverse")}
              style={{
                height: paso,
                gap: hueco,
                [izquierda ? "marginRight" : "marginLeft"]: apartado(indice, cantidad, curva),
              }}
              data-encender={encender === undefined ? undefined : encender + 400 + indice * PASO_ENCENDIDO}
            >
              <SkillBubble nombre={habilidad} icono={area.icono} pulso={indice * 1.2} />
              <span className={nombre({ tamano })}>{habilidad}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
