import { prefiereMenosMovimiento } from "@/vistas/rr-dev/movimiento";

/** Un astro que gira sobre su eje vertical, con una vuelta completa repartida en sus fotogramas */
export interface Astro {
  /** Las urls de los fotogramas, en orden. El último empalma con el primero */
  fotogramas: string[];
  /** Los mismos fotogramas, en 256 px: se usan mientras el astro se ve chico */
  chicos?: string[];
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
 * porque al acercarse la cámara crece. Achicarlo haría que el lienzo reduzca los fotogramas sin
 * suavizar, y se vería más áspero
 */
const LADO = 800;
/**
 * Con el lienzo de hasta este lado en pantalla, en píxeles reales, se usan los fotogramas chicos, y
 * se vuelve a los grandes pasando el otro. El margen evita ir y venir justo en el límite
 */
const HASTA_CHICOS = 240;
const DESDE_GRANDES = 256;
/** Lo que se puede correr la superficie de un dibujo al otro sin que se note, en píxeles reales */
const CORRIMIENTO = 0.5;
/** En cuántos pasos, como mínimo, se funde un fotograma con el siguiente */
const PASOS_DEL_FUNDIDO = 16;

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

// Los fotogramas se suben sin dar vuelta: arriba de la foto es abajo de la textura
vec2 enFoto(vec2 enDisco) {
  vec2 enTextura = enDisco * radio * 0.5 + 0.5;
  return vec2(enTextura.x, 1.0 - enTextura.y);
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
 * Cada cuánto dibujar, en ms, con el lienzo de `lado` píxeles reales en pantalla. De cerca, 30 veces
 * por segundo; de lejos alcanza con menos: entre un dibujo y el otro la superficie se corre a lo sumo
 * medio píxel, y el fundido de un fotograma al siguiente avanza en al menos 16 pasos
 */
export function intervaloDeDibujo({ vuelta, radio, fotogramas }: Astro, lado: number) {
  const radioEnPantalla = (lado / 2) * radio;
  const porCorrimiento = (CORRIMIENTO / (((2 * Math.PI) / vuelta) * radioEnPantalla)) * 1000;
  const porFundido = ((vuelta / fotogramas.length) * 1000) / PASOS_DEL_FUNDIDO;
  return Math.max(1000 / CUADROS_POR_SEGUNDO, Math.min(porCorrimiento, porFundido));
}

/** Si van los fotogramas chicos con el lienzo de `lado` píxeles reales, según los que se usan ahora */
export const usarChicos = (lado: number, ahora: boolean) => lado <= (ahora ? DESDE_GRANDES : HASTA_CHICOS);

/**
 * El archivo de un fotograma. Se baja como archivo y no con un `<img>` para decodificarlo fuera del
 * hilo principal (`createImageBitmap`): desde un `<img>`, decodificarlo trababa la página. Son
 * imágenes de la vista, no datos del backend: por eso no van por RTK Query
 */
export async function bajar(url: string, senal?: AbortSignal) {
  const respuesta = await fetch(url, { signal: senal, priority: "low" });
  if (!respuesta.ok) throw new Error(`No bajó ${url}`);
  return respuesta.blob();
}

/**
 * Hace girar `astro` en `lienzo` y esconde `foto`, el primer fotograma, porque el lienzo pasa a
 * ocupar su lugar. Sin WebGL, sin vuelta, o si el sistema pide menos movimiento, queda la foto
 * quieta. Baja los fotogramas de a uno, a medida que hacen falta, y los decodifica fuera del hilo
 * principal. Mientras el astro se ve chico usa los fotogramas chicos y dibuja menos seguido
 * (`intervaloDeDibujo`); fuera de la pantalla se pausa. Devuelve la función que lo detiene.
 */
export function girarAstro(lienzo: HTMLCanvasElement, foto: HTMLImageElement, astro: Astro): () => void {
  if (prefiereMenosMovimiento() || !astro.vuelta) return () => undefined;
  const gl = lienzo.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  const programa = gl && !gl.isContextLost() && crearPrograma(gl);
  if (!gl || !programa) return () => undefined;
  const { fotogramas, chicos } = astro;
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

  for (const unidad of [0, 1]) {
    gl.activeTexture(gl.TEXTURE0 + unidad);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  let vivo = true;
  const controlador = new AbortController();
  // Los fotogramas ya decodificados, por tamaño y número: cada uno se sube una vez y se suelta
  const listos = new Map<string, ImageBitmap>();
  const pedidos = new Set<string>();
  // Los dos que están en las texturas: no se vuelven a pedir
  let subidos: string[] = [];
  const clave = (numero: number, chico: boolean) => `${chico ? "c" : "g"}${numero % fotogramas.length}`;
  const pedir = (numero: number, chico: boolean) => {
    const cual = clave(numero, chico);
    if (listos.has(cual) || pedidos.has(cual) || subidos.includes(cual)) return;
    pedidos.add(cual);
    // Premultiplicado como pide el lienzo. Si no baja, queda pedido: no se insiste
    bajar((chico ? chicos! : fotogramas)[numero % fotogramas.length]!, controlador.signal)
      .then((archivo) => createImageBitmap(archivo, { premultiplyAlpha: "premultiply" }))
      .then((imagen) => {
        if (!vivo) return imagen.close();
        listos.set(cual, imagen);
        pedidos.delete(cual);
      })
      .catch(() => undefined);
  };
  /** Suelta los que ya no van a hacer falta: solo sirven el actual y los dos que siguen */
  const soltar = (actual: number) => {
    for (const [cual, imagen] of listos) {
      const distancia = (Number(cual.slice(1)) - actual + fotogramas.length) % fotogramas.length;
      if (distancia > 2) {
        imagen.close();
        listos.delete(cual);
      }
    }
  };

  // Las dos texturas se turnan: la que deja de usarse recibe el fotograma que viene
  let unidadAnterior = 0;
  const subir = (unidad: number, cual: string) => {
    const imagen = listos.get(cual)!;
    gl.activeTexture(gl.TEXTURE0 + unidad);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagen);
    imagen.close();
    listos.delete(cual);
  };
  const turnar = () => {
    gl.uniform1i(usoAnterior, unidadAnterior);
    gl.uniform1i(usoSiguiente, 1 - unidadAnterior);
  };

  // El tamaño en pantalla cambia mientras viaja la cámara
  let lado = lienzo.clientWidth * devicePixelRatio;
  let intervalo = intervaloDeDibujo(astro, lado);
  const medir = new ResizeObserver(([entrada]) => {
    lado = (entrada?.contentRect.width ?? 0) * devicePixelRatio;
    intervalo = intervaloDeDibujo(astro, lado);
  });
  medir.observe(lienzo);

  let segundos = 0;
  let indice = -1;
  let subidosChicos = false;
  let cuadro = 0;
  let ultimo = 0;
  let seVe = typeof IntersectionObserver !== "function";

  const animar = (ahora: number) => {
    cuadro = requestAnimationFrame(animar);
    const pasado = ahora - ultimo;
    if (pasado < intervalo) return;
    ultimo = ahora;

    // Con la pestaña oculta o el astro fuera de la pantalla no corre: al volver sigue desde donde estaba
    const momento = indice < 0 ? 0 : segundos + Math.min(pasado, Math.max(200, 2 * intervalo)) / 1000;
    const { indice: actual, avance: entreFotogramas } = posicionEn(momento, astro);
    const quiero = Boolean(chicos) && usarChicos(lado, subidosChicos);
    for (const salto of [0, 1, 2]) pedir(actual + salto, quiero);
    // Si los del otro tamaño todavía no bajaron, sigue con los que tiene
    const cambia =
      indice < 0 || (quiero !== subidosChicos && listos.has(clave(actual, quiero)) && listos.has(clave(actual + 1, quiero)));
    const chico = cambia ? quiero : subidosChicos;
    if (chico !== quiero) for (const salto of [1, 2]) pedir(actual + salto, chico);

    if (actual !== indice || chico !== subidosChicos) {
      const avanzaUno = indice >= 0 && chico === subidosChicos && actual === (indice + 1) % fotogramas.length;
      // Si el que viene todavía no bajó, espera quieto
      if (!listos.has(clave(actual + 1, chico)) || (!avanzaUno && !listos.has(clave(actual, chico)))) return;

      if (avanzaUno) unidadAnterior = 1 - unidadAnterior;
      else subir(unidadAnterior, clave(actual, chico));
      subir(1 - unidadAnterior, clave(actual + 1, chico));
      turnar();
      subidos = [clave(actual, chico), clave(actual + 1, chico)];
      soltar(actual);
      if (indice < 0) foto.style.visibility = "hidden";
      indice = actual;
      subidosChicos = chico;
    }

    segundos = momento;
    gl.uniform1f(avance, entreFotogramas);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const seguir = () => {
    cancelAnimationFrame(cuadro);
    if (vivo && seVe) cuadro = requestAnimationFrame(animar);
  };
  const visible =
    typeof IntersectionObserver === "function"
      ? new IntersectionObserver(([entrada]) => {
          seVe = Boolean(entrada?.isIntersecting);
          seguir();
        })
      : null;
  visible?.observe(lienzo);
  seguir();

  // Si el navegador suelta el contexto, vuelve la foto
  const perdido = () => {
    vivo = false;
    cancelAnimationFrame(cuadro);
    foto.style.visibility = "";
  };
  lienzo.addEventListener("webglcontextlost", perdido);

  return () => {
    perdido();
    controlador.abort();
    medir.disconnect();
    visible?.disconnect();
    lienzo.removeEventListener("webglcontextlost", perdido);
    listos.forEach((imagen) => imagen.close());
    listos.clear();
    // Al desmontarse suelta el contexto y su memoria: si se acumulan, el navegador tira los más
    // viejos, que pueden ser el del sol. En desarrollo React monta dos veces sin sacar el lienzo:
    // ahí no se suelta, porque se vuelve a usar
    window.setTimeout(() => {
      if (!lienzo.isConnected) gl.getExtension("WEBGL_lose_context")?.loseContext();
    });
  };
}
