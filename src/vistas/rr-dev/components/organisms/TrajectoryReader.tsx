import { type LucideIcon, Route } from "lucide-react";
import { type CSSProperties, useId, useLayoutEffect, useRef, useState } from "react";
import { NIVEL, rango } from "@/features/portafolio/formato";
import { HeroBadge } from "@/vistas/rr-dev/components/atoms/HeroBadge";
import { ReaderPanel } from "@/vistas/rr-dev/components/organisms/ReaderPanel";
import { TEXTOS_SOBRE_MI, type TonoEstadistica } from "@/vistas/rr-dev/contenido";
import { type CategoriaTrayectoria, categoriasCon, type PasoTrayectoria, type Trayectoria } from "@/vistas/rr-dev/sobreMi";

const TITULO = "font-titulo text-[length:clamp(1.75rem,3.4vw,2.125rem)] leading-tight font-bold tracking-[-0.02em]";
/** Las fechas de cada paso, del color de su lista */
const FECHAS = "text-[0.8125rem] font-semibold tracking-[.06em] text-(--tono) tabular-nums";

interface TrajectoryReaderProps {
  trayectoria: Trayectoria;
  /** La lista con la que abre: la que se tocó en la barra */
  inicial: CategoriaTrayectoria;
  onCerrar: () => void;
}

/**
 * Los trabajos, los estudios o los idiomas en el panel de lectura, en una línea de tiempo: de cada
 * paso, las fechas, el puesto o el título, dónde, las píldoras, la descripción, los logros y las
 * tecnologías. Arriba, las pestañas para pasar a otra lista, con la cabeza del cometa del menú
 * debajo de la elegida. Al cambiar de lista, los pasos entran de a uno
 */
export function TrajectoryReader({ trayectoria, inicial, onCerrar }: TrajectoryReaderProps) {
  const titulo = useId();
  const [categoria, setCategoria] = useState(inicial);
  const categorias = categoriasCon(trayectoria);
  const tono = categorias.find(({ id }) => id === categoria)?.tono ?? "info";

  return (
    <ReaderPanel etiqueta={TEXTOS_SOBRE_MI.panelTrayectoria} icono={Route} tituloId={titulo} onCerrar={onCerrar}>
      <h2 id={titulo} className={TITULO}>
        {TEXTOS_SOBRE_MI.categorias[categoria]}
      </h2>
      <Pestanas
        categorias={categorias.map((lista) => ({ ...lista, cantidad: trayectoria[lista.id].length }))}
        elegida={categoria}
        onElegir={setCategoria}
      />

      {/* Con otra lista, otra clave: los pasos se montan de nuevo y entran de a uno */}
      <ol key={categoria} className="linea-tiempo mt-2" style={{ "--tono": `var(--${tono})` } as CSSProperties}>
        {categoria === "idiomas"
          ? trayectoria.idiomas.map(({ idioma, nivel }, orden) => (
              <li key={idioma} className="hito" style={{ "--orden": orden } as CSSProperties}>
                <span className={FECHAS}>{NIVEL[nivel]}</span>
                <h3 className="font-titulo text-[1.375rem] leading-tight font-bold">{idioma}</h3>
              </li>
            ))
          : trayectoria[categoria].map((paso, orden) => <Hito key={paso.id} paso={paso} orden={orden} />)}
      </ol>
    </ReaderPanel>
  );
}

/** Un trabajo o un estudio de la línea de tiempo, con todo lo que tiene */
function Hito({ paso, orden }: { paso: PasoTrayectoria; orden: number }) {
  return (
    <li className="hito" style={{ "--tono": `var(--${paso.tono})`, "--orden": orden } as CSSProperties}>
      <span className={FECHAS}>{rango(paso.desde, paso.hasta)}</span>
      <h3 className="font-titulo text-[1.375rem] leading-tight font-bold text-balance">{paso.titulo}</h3>
      <span className="text-[0.97rem] text-texto-suave">{paso.lugar}</span>
      {paso.pildoras.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {paso.pildoras.map((pildora) => (
            <HeroBadge key={pildora} etiqueta={pildora} />
          ))}
        </div>
      )}
      {paso.parrafos.map((parrafo, indice) => (
        <p key={indice} className="text-[0.97rem] leading-[1.7]">
          {parrafo}
        </p>
      ))}
      {paso.logros.length > 0 && (
        <ul
          aria-label={TEXTOS_SOBRE_MI.logros}
          className="grid list-disc gap-1.5 pl-4.5 text-[0.93rem] leading-relaxed marker:text-(--tono)"
        >
          {paso.logros.map((logro) => (
            <li key={logro}>{logro}</li>
          ))}
        </ul>
      )}
      {paso.tecnologias.length > 0 && (
        <ul aria-label={TEXTOS_SOBRE_MI.tecnologias} className="flex flex-wrap gap-1.5 pt-1">
          {paso.tecnologias.map((tecnologia) => (
            <li
              key={tecnologia}
              className="rounded-full border border-secundario/25 bg-secundario/12 px-2.5 py-0.5 text-[0.8rem]"
            >
              {tecnologia}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

interface PestanasProps {
  categorias: { id: CategoriaTrayectoria; icono: LucideIcon; tono: TonoEstadistica; cantidad: number }[];
  elegida: CategoriaTrayectoria;
  onElegir: (categoria: CategoriaTrayectoria) => void;
}

/**
 * Las listas que tienen algo, con cuántos hay. La elegida se tiñe de su color y lleva debajo la
 * cabeza del cometa del menú, que viaja a la que se toca
 */
function Pestanas({ categorias, elegida, onElegir }: PestanasProps) {
  const grupo = useRef<HTMLDivElement>(null);
  const [cometa, setCometa] = useState<{ x: number; y: number } | null>(null);

  // Antes de pintar: la primera vez aparece en su lugar, y después viaja con la transición
  useLayoutEffect(() => {
    const boton = grupo.current?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (boton) setCometa({ x: boton.offsetLeft + boton.offsetWidth / 2, y: boton.offsetTop + boton.offsetHeight });
  }, [elegida]);

  return (
    // En el celular, una columna por lista y sin la cantidad: así entran las tres en un renglón
    <div
      ref={grupo}
      role="group"
      aria-label={TEXTOS_SOBRE_MI.listas}
      className="relative grid grid-flow-col gap-1 pb-1.5 sm:flex sm:flex-wrap"
    >
      {categorias.map(({ id, icono: Icono, tono, cantidad }) => (
        <button
          key={id}
          type="button"
          aria-pressed={id === elegida}
          onClick={() => onElegir(id)}
          style={{ "--tono": `var(--${tono})` } as CSSProperties}
          className="group inline-flex h-11 items-center justify-center gap-1.5 rounded-xl px-1.5 text-[0.9rem] font-semibold text-texto-suave transition-colors duration-500 hover:text-texto aria-pressed:bg-(--tono)/14 aria-pressed:text-texto sm:gap-2 sm:px-3.5 sm:text-[0.9375rem]"
        >
          <Icono className="size-4.5 shrink-0 group-aria-pressed:text-(--tono)" aria-hidden />
          {TEXTOS_SOBRE_MI.categorias[id]}
          <span className="hidden rounded-full bg-texto/8 px-1.5 py-0.5 text-[0.75rem] tabular-nums group-aria-pressed:bg-(--tono)/22 group-aria-pressed:text-texto sm:inline">
            {cantidad}
          </span>
        </button>
      ))}
      {cometa && <span aria-hidden className="cometa-pestana" style={{ left: cometa.x, top: cometa.y }} />}
    </div>
  );
}
