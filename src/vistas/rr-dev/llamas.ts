import { prefiereMenosMovimiento } from "@/vistas/rr-dev/movimiento";

/** Lado del lienzo. Las llamas son difusas: con más resolución no se verían mejor */
const LADO = 480;
/** El lienzo mide 1.8 veces la caja del sol, y en esa caja el disco tiene un radio de 190 sobre 512 */
const RADIO_DISCO = (LADO / 1.8) * (190 / 512);
const CUADROS_POR_SEGUNDO = 30;
const PUNTOS = 240;

/**
 * De afuera hacia adentro: lenguas largas y difusas, otras más cortas, y el borde caliente pegado al
 * disco. El alcance es cuánto puede salir una lengua, en radios del disco.
 */
const CAPAS = [
  { alcance: 1.0, base: 0.08, opacidad: 0.6, desenfoque: 6, semilla: 1 },
  { alcance: 0.55, base: 0.06, opacidad: 0.75, desenfoque: 4, semilla: 2 },
  { alcance: 0.22, base: 0.04, opacidad: 0.9, desenfoque: 2, semilla: 3 },
];
const LENGUAS_POR_CAPA = 22;

/** Un número entre 0 y 1 que siempre es el mismo para el mismo `n`: así cada lengua tiene su carácter */
const azar = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/** Dónde nace cada lengua, qué tan ancha es y a qué ritmo crece y se achica */
const LENGUAS = CAPAS.map(({ semilla }) =>
  Array.from({ length: LENGUAS_POR_CAPA }, (_, i) => ({
    angulo: ((i + azar(semilla * 100 + i) * 0.8) / LENGUAS_POR_CAPA) * Math.PI * 2,
    ancho: 0.07 + azar(semilla * 200 + i) * 0.1,
    ritmo: 0.5 + azar(semilla * 300 + i) * 1.1,
    fase: azar(semilla * 400 + i) * Math.PI * 2,
  })),
);

/** Distancia entre dos ángulos, dando la vuelta por el lado más corto */
const separacion = (a: number, b: number) => {
  const d = Math.abs(a - b) % (Math.PI * 2);
  return d > Math.PI ? Math.PI * 2 - d : d;
};

/**
 * Altura de la llama, de 0 a 1, en el `angulo` (en radianes) a los `segundos`, para la capa
 * `capa`. Cada lengua es un pico angosto que crece y se achica a su ritmo y se mece un poco de
 * costado. Donde dos se tocan, manda la más alta: así no se funden en una onda.
 */
export function alturaLlama(angulo: number, segundos: number, capa = 0) {
  let altura = 0;
  for (const lengua of LENGUAS[capa] ?? []) {
    const largo = (0.5 + 0.5 * Math.sin(segundos * lengua.ritmo + lengua.fase)) ** 1.5;
    const vaiven = 0.04 * Math.sin(segundos * lengua.ritmo * 0.7 + lengua.fase * 2);
    const distancia = separacion(angulo, lengua.angulo + vaiven) / lengua.ancho;
    altura = Math.max(altura, largo * Math.exp(-distancia * distancia));
  }
  return altura;
}

/** Cada capa se apaga hacia la punta de sus lenguas, como el fuego */
function dibujar(contexto: CanvasRenderingContext2D, segundos: number, color: string) {
  contexto.clearRect(0, 0, LADO, LADO);
  contexto.globalCompositeOperation = "lighter";

  CAPAS.forEach((capa, numero) => {
    const punta = RADIO_DISCO * (1 + capa.base + capa.alcance);
    const degradado = contexto.createRadialGradient(LADO / 2, LADO / 2, RADIO_DISCO * 0.95, LADO / 2, LADO / 2, punta);
    degradado.addColorStop(0, color);
    degradado.addColorStop(1, "transparent");
    contexto.fillStyle = degradado;
    contexto.filter = `blur(${capa.desenfoque}px)`;
    contexto.globalAlpha = capa.opacidad;
    contexto.beginPath();
    for (let punto = 0; punto < PUNTOS; punto++) {
      const angulo = (punto / PUNTOS) * Math.PI * 2;
      const radio = RADIO_DISCO * (1 + capa.base + capa.alcance * alturaLlama(angulo, segundos, numero));
      contexto.lineTo(LADO / 2 + radio * Math.cos(angulo), LADO / 2 + radio * Math.sin(angulo));
    }
    contexto.closePath();
    contexto.fill();
  });
}

/**
 * Dibuja en `lienzo` el anillo de llamas del sol, con el color `aviso` del tema. Si el sistema pide
 * menos movimiento, quedan quietas. Devuelve la función que las apaga.
 */
export function encenderLlamas(lienzo: HTMLCanvasElement): () => void {
  const contexto = lienzo.getContext("2d");
  if (!contexto) return () => undefined;
  lienzo.width = lienzo.height = LADO;
  // Se lee en cada cuadro: si cambia la paleta, cambian las llamas
  const estilo = getComputedStyle(lienzo);
  const color = () => estilo.getPropertyValue("--aviso").trim();

  if (prefiereMenosMovimiento()) {
    dibujar(contexto, 0, color());
    return () => undefined;
  }

  let cuadro = 0;
  let ultimo = 0;
  const animar = (ahora: number) => {
    cuadro = requestAnimationFrame(animar);
    if (ahora - ultimo < 1000 / CUADROS_POR_SEGUNDO) return;
    ultimo = ahora;
    dibujar(contexto, ahora / 1000, color());
  };
  cuadro = requestAnimationFrame(animar);

  return () => cancelAnimationFrame(cuadro);
}
