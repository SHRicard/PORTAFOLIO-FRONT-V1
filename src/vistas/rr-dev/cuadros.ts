import { prefiereMenosMovimiento } from "@/vistas/rr-dev/movimiento";
import { type Astro, bajar } from "@/vistas/rr-dev/rotacion";

/** De a cuántos fotogramas se bajan: así no se piden todos a la vez */
const LOTE = 15;
/**
 * Cuántos se tienen decodificados por adelantado: 280 ms, de sobra para decodificar el que sigue.
 * Todos decodificados ocupan mucho (cada fotograma de Saturno, 5.7 MB; con 180, cerca de 1 GB): el
 * navegador los descartaba y los volvía a decodificar al dibujarlos, y eso trababa la página
 */
const ADELANTE = 4;
/** El ancho máximo del lienzo, en píxeles reales: el de los fotogramas */
const ANCHO_MAXIMO = 1600;

/** El fotograma que toca a los `ms` de arrancar: sale del tiempo, no de contar cuadros */
export const cuadroEn = (ms: number, cantidad: number, msPorCuadro: number) =>
  Math.floor(Math.max(0, ms) / msPorCuadro) % cantidad;

/** Con datos ahorrados o una conexión lenta no se bajan los fotogramas */
export function conexionLenta() {
  const { connection } = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  return Boolean(connection?.saveData) || ["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "");
}

/**
 * Pasa los fotogramas de `astro` de a uno en `lienzo`, sin fundirlos, cada `vuelta / fotogramas` ms.
 * Sirve cuando son muchos y cambian poco de uno al otro, como en Saturno: cuando tenía una luna,
 * fundida se veía en dos lugares. Cuál toca sale del tiempo real, así que si el navegador se traba no se
 * acelera ni se frena, y se dibuja solo cuando cambia. Mientras tanto queda `foto`, el primero, quieto.
 * Baja todos los fotogramas apenas arranca, de a lotes, y anima recién con todos bajados: el planeta
 * se monta cuando la cámara sale hacia él (`seDibuja`), antes de verse. Decodifica los que vienen
 * por adelantado (`ADELANTE`) y suelta los que ya pasaron. Se pausa cuando no se ve y con la pestaña
 * oculta, y si se desmonta antes de terminar, deja de bajar. Sin movimiento, sin vuelta o con una
 * conexión lenta queda la foto. Devuelve la función que lo detiene.
 */
export function pasarCuadros(lienzo: HTMLCanvasElement, foto: HTMLImageElement, astro: Astro): () => void {
  if (prefiereMenosMovimiento() || !astro.vuelta || conexionLenta()) return () => undefined;
  const contexto = lienzo.getContext("2d");
  if (!contexto || typeof IntersectionObserver !== "function") return () => undefined;
  const { fotogramas } = astro;
  const msPorCuadro = (astro.vuelta * 1000) / fotogramas.length;
  const proporcion = astro.fotograma ? astro.fotograma.alto / astro.fotograma.ancho : 1;

  let vivo = true;
  const controlador = new AbortController();
  let archivos: Blob[] = [];
  const decodificados = new Map<number, ImageBitmap>();
  const pedidos = new Set<number>();
  let inicio = 0;
  let mostrado = -1;
  let seVe = false;
  let cuadro = 0;

  // Nítido en pantallas de más densidad, sin pasarse del ancho de los fotogramas. El tamaño cambia
  // mientras la cámara viaja: se mide al cambiar de fotograma y se rehace cuando se va más de un 20%
  const medir = () => {
    const ancho = Math.min(ANCHO_MAXIMO, Math.round(lienzo.clientWidth * devicePixelRatio));
    if (ancho > 0 && Math.abs(ancho - lienzo.width) > lienzo.width * 0.2) {
      lienzo.width = ancho;
      lienzo.height = Math.round(ancho * proporcion);
    }
  };

  /** Pide decodificar el de `indice` y los que le siguen, y suelta los que ya quedaron atrás */
  const preparar = (indice: number) => {
    for (const [numero, imagen] of decodificados) {
      if ((numero - indice + fotogramas.length) % fotogramas.length >= ADELANTE) {
        imagen.close();
        decodificados.delete(numero);
      }
    }
    for (let salto = 0; salto < ADELANTE; salto++) {
      const numero = (indice + salto) % fotogramas.length;
      if (decodificados.has(numero) || pedidos.has(numero)) continue;
      pedidos.add(numero);
      createImageBitmap(archivos[numero]!)
        .then((imagen) => (vivo ? decodificados.set(numero, imagen) : imagen.close()))
        .catch(() => undefined)
        .finally(() => pedidos.delete(numero));
    }
  };

  let preparado = -1;
  const dibujar = (ahora: number) => {
    cuadro = requestAnimationFrame(dibujar);
    const indice = cuadroEn(ahora - inicio, fotogramas.length, msPorCuadro);
    if (indice !== preparado) {
      preparar(indice);
      preparado = indice;
    }
    // Si todavía no se decodificó, queda el que estaba: el lienzo se rehace recién con uno listo
    const imagen = decodificados.get(indice);
    if (!imagen || indice === mostrado) return;
    medir();
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);
    contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    if (mostrado < 0) foto.style.visibility = "hidden";
    mostrado = indice;
  };

  const seguir = () => {
    cancelAnimationFrame(cuadro);
    if (vivo && seVe && !document.hidden && archivos.length === fotogramas.length) {
      cuadro = requestAnimationFrame(dibujar);
    }
  };

  const cargar = async () => {
    const bajados: Blob[] = [];
    for (let desde = 0; desde < fotogramas.length && vivo; desde += LOTE) {
      const lote = fotogramas.slice(desde, desde + LOTE).map((url) => bajar(url, controlador.signal));
      bajados.push(...(await Promise.all(lote)));
    }
    if (!vivo) return;
    archivos = bajados;
    preparar(0);
    inicio = performance.now();
    seguir();
  };

  // Si alguno no baja, queda la foto quieta
  cargar().catch(() => undefined);
  const visible = new IntersectionObserver(([entrada]) => {
    seVe = Boolean(entrada?.isIntersecting);
    seguir();
  });
  visible.observe(lienzo);
  document.addEventListener("visibilitychange", seguir);

  return () => {
    vivo = false;
    controlador.abort();
    cancelAnimationFrame(cuadro);
    visible.disconnect();
    document.removeEventListener("visibilitychange", seguir);
    decodificados.forEach((imagen) => imagen.close());
    decodificados.clear();
    foto.style.visibility = "";
  };
}
