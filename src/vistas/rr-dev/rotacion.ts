import { prefiereMenosMovimiento } from "@/vistas/rr-dev/movimiento";

/** Un astro que gira sobre su eje vertical, con una vuelta completa repartida en sus fotogramas */
export interface Astro {
  /** Las urls de los fotogramas, en orden. El último empalma con el primero */
  fotogramas: string[];
  /** Radio del disco sobre la mitad del lado del fotograma */
  radio: number;
  /** Segundos que tarda en dar una vuelta. Con 0 no gira: queda el primer fotograma */
  vuelta: number;
  /**
   * Grados que gira la superficie de un fotograma al siguiente, para girar cada píxel sobre la
   * esfera antes de mezclarlos. Si no se dice, una vuelta repartida en los fotogramas. Con 0 solo
   * se funden: sirve cuando entre uno y otro casi no cambia nada
   */
  giroPorFotograma?: number;
  /** Las medidas de cada fotograma, si no es un cuadrado de 800 */
  fotograma?: { ancho: number; alto: number };
  /** Pasa los fotogramas de a uno, sin fundirlos ni girarlos (ver `pasarCuadros`) */
  deAUno?: boolean;
}

const CUADROS_POR_SEGUNDO = 30;
/**
 * El de los fotogramas: más resolución no agregaría nada. Va siempre, aunque el astro se vea chico,
 * porque al acercarse la cámara crece
 */
const LADO = 800;

const VERTICES = `
attribute vec2 posicion;
varying vec2 punto;

void main() {
  punto = posicion;
  gl_Position = vec4(posicion, 0.0, 1.0);
}
`;

/*
 * Entre un fotograma y el otro hay varios grados: mezclarlos sin más dejaría cada mancha repetida.
 * Por eso cada píxel se lleva a la esfera y se gira hasta donde estaría en ese instante, en los dos,
 * y recién ahí se mezclan. Lo de afuera del disco no gira: se funde de un fotograma al otro.
 */
const PIXELES = `
precision highp float;
uniform sampler2D anterior;
uniform sampler2D siguiente;
uniform float avance;
uniform float radio;
uniform float paso;
varying vec2 punto;

vec2 girar(vec2 enDisco, float angulo) {
  float distancia = length(enDisco);
  if (distancia >= 1.0) return enDisco;
  float z = sqrt(1.0 - distancia * distancia);
  vec2 girado = vec2(enDisco.x * cos(angulo) - z * sin(angulo), enDisco.y);
  return mix(enDisco, girado, 1.0 - smoothstep(0.9, 0.995, distancia));
}

vec2 enFoto(vec2 enDisco) {
  return enDisco * radio * 0.5 + 0.5;
}

void main() {
  vec2 enDisco = punto / radio;
  gl_FragColor = mix(
    texture2D(anterior, enFoto(girar(enDisco, avance * paso))),
    texture2D(siguiente, enFoto(girar(enDisco, (avance - 1.0) * paso))),
    avance
  );
}
`;

/** Qué par de fotogramas toca a los `segundos`, y cuánto se avanzó del primero al segundo */
export function posicionEn(segundos: number, { fotogramas, vuelta }: Astro) {
  const recorrido = ((segundos / vuelta) % 1) * fotogramas.length;
  const indice = Math.floor(recorrido);
  return { indice, avance: recorrido - indice };
}

function crearPrograma(gl: WebGLRenderingContext) {
  const programa = gl.createProgram();
  const partes: [number, string][] = [
    [gl.VERTEX_SHADER, VERTICES],
    [gl.FRAGMENT_SHADER, PIXELES],
  ];

  for (const [tipo, codigo] of partes) {
    const parte = gl.createShader(tipo);
    if (!parte) return null;
    gl.shaderSource(parte, codigo);
    gl.compileShader(parte);
    gl.attachShader(programa, parte);
  }
  gl.linkProgram(programa);
  return gl.getProgramParameter(programa, gl.LINK_STATUS) ? programa : null;
}

/**
 * Hace girar `astro` en `lienzo` y esconde `foto`, el primer fotograma, porque el lienzo pasa a
 * ocupar su lugar. Sin WebGL, sin vuelta, o si el sistema pide menos movimiento, queda la foto
 * quieta. Baja los fotogramas de a uno, a medida que hacen falta. Devuelve la función que lo detiene.
 */
export function girarAstro(lienzo: HTMLCanvasElement, foto: HTMLImageElement, astro: Astro): () => void {
  if (prefiereMenosMovimiento() || !astro.vuelta) return () => undefined;
  const gl = lienzo.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  const programa = gl && crearPrograma(gl);
  if (!gl || !programa) return () => undefined;
  const { fotogramas } = astro;
  const { ancho, alto } = astro.fotograma ?? { ancho: LADO, alto: LADO };

  lienzo.width = ancho;
  lienzo.height = alto;
  gl.viewport(0, 0, ancho, alto);
  gl.useProgram(programa);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const posicion = gl.getAttribLocation(programa, "posicion");
  gl.enableVertexAttribArray(posicion);
  gl.vertexAttribPointer(posicion, 2, gl.FLOAT, false, 0, 0);

  const usoAnterior = gl.getUniformLocation(programa, "anterior");
  const usoSiguiente = gl.getUniformLocation(programa, "siguiente");
  const avance = gl.getUniformLocation(programa, "avance");
  gl.uniform1f(gl.getUniformLocation(programa, "radio"), astro.radio);
  const giro = astro.giroPorFotograma ?? 360 / fotogramas.length;
  gl.uniform1f(gl.getUniformLocation(programa, "paso"), (giro * Math.PI) / 180);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  for (const unidad of [0, 1]) {
    gl.activeTexture(gl.TEXTURE0 + unidad);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  const imagenes = new Map<number, HTMLImageElement>([[0, foto]]);
  const pedir = (indice: number) => {
    const numero = indice % fotogramas.length;
    if (imagenes.has(numero)) return;
    const imagen = new Image();
    imagen.src = fotogramas[numero]!;
    imagenes.set(numero, imagen);
  };
  const lista = (indice: number) => {
    const imagen = imagenes.get(indice % fotogramas.length);
    return imagen?.complete && imagen.naturalWidth ? imagen : null;
  };

  // Las dos texturas se turnan: la que deja de usarse recibe el fotograma que viene
  let unidadAnterior = 0;
  const subir = (unidad: number, imagen: HTMLImageElement) => {
    gl.activeTexture(gl.TEXTURE0 + unidad);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagen);
  };
  const turnar = () => {
    gl.uniform1i(usoAnterior, unidadAnterior);
    gl.uniform1i(usoSiguiente, 1 - unidadAnterior);
  };

  let segundos = 0;
  let indice = -1;
  let cuadro = 0;
  let ultimo = 0;

  const animar = (ahora: number) => {
    cuadro = requestAnimationFrame(animar);
    const pasado = ahora - ultimo;
    if (pasado < 1000 / CUADROS_POR_SEGUNDO) return;
    ultimo = ahora;

    // Con la pestaña oculta no corre: al volver sigue desde donde estaba
    const momento = indice < 0 ? 0 : segundos + Math.min(pasado, 200) / 1000;
    const { indice: actual, avance: entreFotogramas } = posicionEn(momento, astro);
    pedir(actual + 1);
    pedir(actual + 2);

    if (actual !== indice) {
      // Si el que viene todavía no bajó, espera quieto
      const proxima = lista(actual + 1);
      if (!proxima) return;

      if (indice < 0) {
        const primera = lista(actual);
        if (!primera) return;
        subir(unidadAnterior, primera);
        foto.style.visibility = "hidden";
      } else {
        imagenes.delete(indice);
        unidadAnterior = 1 - unidadAnterior;
      }
      subir(1 - unidadAnterior, proxima);
      turnar();
      indice = actual;
    }

    segundos = momento;
    gl.uniform1f(avance, entreFotogramas);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  cuadro = requestAnimationFrame(animar);

  return () => {
    cancelAnimationFrame(cuadro);
    foto.style.visibility = "";
  };
}
