import { cva } from "class-variance-authority";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { FactBubble, type Lejania } from "@/vistas/rr-dev/components/atoms/FactBubble";
import { DATOS_CERCA, DATOS_LEJOS, type DatoCurioso, iconoDato, TONOS_DATOS } from "@/vistas/rr-dev/sobreMi";

/**
 * Las medidas de cada distancia, en píxeles: el radio de la burbuja, lo que se aparta del centro
 * de la página el dato del medio, lo que separa cada burbuja de su texto, la parte de `--etiqueta`
 * que ocupa el texto y cuántos datos entran. Más lejos, todo más chico, y menos datos
 */
const MEDIDAS: Record<Lejania, { radio: number; curva: number; hueco: number; etiqueta: number; cuantos: number }> = {
  cerca: { radio: 26, curva: 64, hueco: 14, etiqueta: 1, cuantos: DATOS_CERCA },
  lejos: { radio: 20, curva: 40, hueco: 11, etiqueta: 0.8, cuantos: DATOS_LEJOS },
  muyLejos: { radio: 16, curva: 28, hueco: 9, etiqueta: 0.7, cuantos: DATOS_LEJOS },
};
/** Segundos entre los anillos de luz que laten en las burbujas */
const PASO_PULSO = 1.2;
/** Al entrar al apartado: ms entre un dato y el siguiente, y cuánto después del primero empieza la línea */
const PASO_ENCENDIDO = 600;
const DEMORA_LINEA = 730;

/** Lo lejano se ve más tenue, como una estrella más chica */
const constelacion = cva("flex h-full min-h-0 flex-col gap-3.5", {
  variants: { lejania: { cerca: "", lejos: "opacity-80", muyLejos: "opacity-65" } },
});
const titulo = cva("text-texto-suave", {
  variants: { lejania: { cerca: "text-xs", lejos: "text-[0.6875rem]", muyLejos: "text-[0.625rem]" } },
});
const valor = cva("leading-snug font-semibold text-texto", {
  variants: {
    lejania: {
      cerca: "text-sm min-[106.25rem]:text-[0.9375rem]",
      lejos: "text-[0.8125rem]",
      muyLejos: "text-xs",
    },
  },
});

/**
 * Lo que se aparta del centro de la página cada dato, para que el arco "(" abra hacia el centro
 * como la constelación de Inicio: nada los de las puntas y `curva` el del medio
 */
export function apartado(indice: number, cantidad: number, curva = MEDIDAS.cerca.curva): number {
  if (cantidad < 3) return 0;
  const medio = (cantidad - 1) / 2;
  return Math.round(curva * (1 - ((indice - medio) / medio) ** 2));
}

interface FactConstellationProps {
  /** Los datos, de arriba a abajo. Se ven los que entran a esa distancia */
  datos: DatoCurioso[];
  /** Lado de la página en el que va: el arco abre hacia el centro */
  lado: "izquierda" | "derecha";
  /** Nombra la lista. De cerca también se ve arriba, como título */
  etiqueta: string;
  /** Qué tan lejos se ve: más chica y más tenue cuanto más lejos */
  lejania?: Lejania;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/**
 * Los datos curiosos de un costado como la constelación de logos de Inicio: burbujas con su ícono,
 * unidas por una línea fina, con el título y el valor al lado. Se reparten en el alto que le da la
 * página; el ancho de los textos sale de `--etiqueta`. Una constelación lejana es más chica, más
 * tenue y sin título: es la que sigue, más atrás
 */
export function FactConstellation({ datos, lado, etiqueta, lejania = "cerca", encender }: FactConstellationProps) {
  const izquierda = lado === "izquierda";
  const medidas = MEDIDAS[lejania];
  const ancho = medidas.radio * 2 + medidas.curva + 4;
  const conTitulo = lejania === "cerca";
  const etiquetaId = useId();
  const arco = useRef<HTMLDivElement>(null);
  const [alto, setAlto] = useState(0);
  const visibles = datos.slice(0, medidas.cuantos);
  const alturaDe = (indice: number) => ((indice + 0.5) / visibles.length) * 100;

  // La línea se dibuja en píxeles: así queda de 1 px y el encendido la recorre entera
  useLayoutEffect(() => {
    const caja = arco.current;
    if (!caja) return;
    setAlto(caja.clientHeight);
    if (typeof ResizeObserver === "undefined") return;
    const observador = new ResizeObserver(() => setAlto(caja.clientHeight));
    observador.observe(caja);
    return () => observador.disconnect();
  }, []);

  const puntos = visibles.map((_, indice) => {
    const desplazo = apartado(indice, visibles.length, medidas.curva) + medidas.radio;
    return `${izquierda ? ancho - desplazo : desplazo},${((alturaDe(indice) * alto) / 100).toFixed(1)}`;
  });

  return (
    <div className={constelacion({ lejania })}>
      {conTitulo && (
        <p
          id={etiquetaId}
          aria-hidden
          data-encender={encender}
          className={cn(
            "text-[0.8rem] font-medium tracking-[.24em] text-texto-suave uppercase",
            izquierda ? "text-right" : "text-left",
          )}
        >
          {etiqueta}
        </p>
      )}
      <div
        ref={arco}
        className="relative min-h-0 flex-1"
        style={{ width: `calc(var(--etiqueta) * ${medidas.etiqueta} + ${medidas.hueco + ancho}px)` }}
      >
        <svg
          aria-hidden
          viewBox={`0 0 ${ancho} ${alto}`}
          className={cn("absolute top-0 h-full overflow-visible text-secundario", izquierda ? "right-0" : "left-0")}
          style={{ width: ancho }}
        >
          {/* Con otro alto la línea es otra: así el encendido la vuelve a recorrer con su largo nuevo */}
          <polyline
            key={alto}
            points={puntos.join(" ")}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeWidth={1}
            data-trazar={encender === undefined ? undefined : encender + DEMORA_LINEA}
            data-durante={PASO_ENCENDIDO * (visibles.length - 1)}
          />
        </svg>
        <ul {...(conTitulo ? { "aria-labelledby": etiquetaId } : { "aria-label": etiqueta })}>
          {visibles.map((dato, indice) => {
            // Se mide desde el borde que da al centro de la página
            const borde = izquierda ? "right" : "left";
            return (
              <li
                key={`${dato.titulo}-${indice}`}
                className="absolute -translate-y-1/2"
                style={{ [borde]: apartado(indice, visibles.length, medidas.curva), top: `${alturaDe(indice)}%` }}
                data-encender={encender === undefined ? undefined : encender + 400 + indice * PASO_ENCENDIDO}
              >
                <div
                  className={cn("flex items-center", izquierda && "flex-row-reverse text-right")}
                  style={{ gap: medidas.hueco }}
                >
                  <FactBubble
                    icono={iconoDato(dato)}
                    tono={TONOS_DATOS[indice] ?? "info"}
                    pulso={indice * PASO_PULSO}
                    lejania={lejania}
                  />
                  {/* Encima de Venus se apoya en un vidrio oscuro (ver useSobrePlaneta) */}
                  <span
                    data-respaldo
                    className="sombra-texto grid gap-0.5"
                    style={{ width: `calc(var(--etiqueta) * ${medidas.etiqueta})` }}
                  >
                    <span className={titulo({ lejania })}>{dato.titulo}</span>
                    <span className={valor({ lejania })}>{dato.valor}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
