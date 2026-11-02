import { useEffect, useRef } from "react";
import { prefiereMenosMovimiento } from "@/vistas/rr-dev/movimiento";

/** Velocidad en píxeles por milisegundo: el tiempo del cruce sale del ancho del cielo */
const VELOCIDAD = 0.7;
/** Cruce más corto y más largo, en milisegundos */
const DURACION = { min: 1500, max: 2600 } as const;

interface ShootingStarProps {
  /** Segundos entre pasadas */
  cada?: number;
  /** Segundos hasta la primera pasada, para que el visitante alcance a ver una */
  primeraVez?: number;
}

const entre = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Una pasada por un cielo de `ancho` × `alto`: sus keyframes y el largo del viaje en píxeles.
 * Entra por un costado bajando apenas y se apaga al pasar el otro. Cada pasada elige su altura,
 * su ángulo y su sentido.
 */
function trayectoria(ancho: number, alto: number, cola: number): { keyframes: Keyframe[]; largo: number } {
  // Poco ángulo: se queda en la parte alta del cielo y apenas roza el texto
  const angulo = entre(8, 14) * (Math.PI / 180);
  const haciaLaDerecha = Math.random() < 0.5;
  const recorrido = ancho + cola * 2;
  const inicioX = haciaLaDerecha ? -cola : ancho + cola;
  const inicioY = alto * entre(0.04, 0.2);
  const finX = haciaLaDerecha ? inicioX + recorrido : inicioX - recorrido;
  const finY = inicioY + recorrido * Math.tan(angulo);
  const giro = haciaLaDerecha ? angulo * (180 / Math.PI) : 180 - angulo * (180 / Math.PI);

  // La punta es el extremo derecho y el origen del transform: translate la ubica y
  // rotate y scaleX mueven y estiran la cola detrás de ella
  const en = (progreso: number, estiramiento: number) => {
    const x = inicioX + (finX - inicioX) * progreso - cola;
    const y = inicioY + (finY - inicioY) * progreso - 1;
    return `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${giro.toFixed(2)}deg) scaleX(${estiramiento})`;
  };

  return {
    keyframes: [
      { transform: en(0, 0.2), opacity: 0 },
      { transform: en(0.16, 1), opacity: 1, offset: 0.16 },
      { transform: en(0.68, 1), opacity: 1, offset: 0.68 },
      { transform: en(1, 0.35), opacity: 0 },
    ],
    largo: recorrido / Math.cos(angulo),
  };
}

/**
 * Estrella fugaz que cruza su contenedor de un lado al otro: una cola fina que se afina y una
 * punta que brilla y se apaga. No aparece si el sistema pide menos movimiento. Es decorativa.
 */
export function ShootingStar({ cada = 20, primeraVez = 6 }: ShootingStarProps) {
  const estela = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const estrella = estela.current;
    const cielo = estrella?.parentElement;
    if (!estrella || !cielo || prefiereMenosMovimiento()) return;

    let temporizador = 0;
    let vuelo: Animation | undefined;

    const volar = () => {
      // Con la pestaña oculta solo quedaría en cola: espera a la próxima
      if (!document.hidden) {
        const { width, height } = cielo.getBoundingClientRect();
        const { keyframes, largo } = trayectoria(width, height, estrella.offsetWidth);
        const duration = Math.min(DURACION.max, Math.max(DURACION.min, largo / VELOCIDAD));
        vuelo = estrella.animate(keyframes, { duration, easing: "cubic-bezier(.3, .05, .55, 1)" });
      }
      temporizador = window.setTimeout(volar, cada * 1000);
    };

    temporizador = window.setTimeout(volar, primeraVez * 1000);

    return () => {
      window.clearTimeout(temporizador);
      vuelo?.cancel();
    };
  }, [cada, primeraVez]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span ref={estela} className="estrella-fugaz" />
    </div>
  );
}
