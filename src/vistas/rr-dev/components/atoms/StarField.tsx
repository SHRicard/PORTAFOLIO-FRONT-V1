import type { CSSProperties } from "react";

const CANTIDAD = 130;
/** Otra semilla dibuja otro cielo: la misma dibuja siempre el mismo */
const SEMILLA = 7;

export interface Estrella {
  /** Posición en % del contenedor */
  x: number;
  y: number;
  /** Diámetro en píxeles */
  tamano: number;
  /** Opacidad en reposo: desde acá se apaga */
  opacidad: number;
  /** Segundos que dura brillar y apagarse */
  duracion: number;
  /** Segundos de desfase, para que no titilen todas juntas */
  demora: number;
  tono: "blanca" | "acento" | "azul";
  /** Estrella fuerte con un destello en cruz */
  destello: boolean;
}

function azarConSemilla(semilla: number): () => number {
  let estado = semilla;

  return () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Una estrella por celda de una grilla, en un lugar al azar dentro de ella: un cielo parejo,
 * sin montones ni huecos. Casi todas blancas y chicas, unas pocas más grandes y teñidas.
 */
export function armarEstrellas(cantidad: number, semilla: number): Estrella[] {
  const azar = azarConSemilla(semilla);
  // Más ancha que alta, como las pantallas que llena
  const columnas = Math.ceil(Math.sqrt(cantidad * 1.8));
  const filas = Math.ceil(cantidad / columnas);

  return Array.from({ length: cantidad }, (_, indice) => {
    const x = ((indice % columnas) + azar()) / columnas;
    const y = (Math.floor(indice / columnas) + azar()) / filas;
    const tirada = azar();
    const tinte = azar();
    const destello = tirada > 0.95;

    return {
      x: x * 100,
      y: y * 100,
      tamano: destello ? 3 : tirada > 0.75 ? 2.4 : 1.3 + azar() * 0.9,
      opacidad: 0.5 + azar() * 0.5,
      duracion: destello ? 7 + azar() * 5 : 2.5 + azar() * 4.5,
      demora: azar() * 8,
      tono: tinte > 0.84 ? "acento" : tinte > 0.74 ? "azul" : "blanca",
      destello,
    };
  });
}

const ESTRELLAS = armarEstrellas(CANTIDAD, SEMILLA);

/** Cielo de estrellas que llena su contenedor. Cada una brilla a su ritmo y algunas tiran un destello. Es decorativo. */
export function StarField() {
  return (
    <div aria-hidden className="estrellas">
      {ESTRELLAS.map(({ x, y, tamano, opacidad, duracion, demora, tono, destello }) => (
        <span
          key={`${x.toFixed(3)}-${y.toFixed(3)}`}
          data-tono={tono}
          data-brillo={tamano >= 2.4 || undefined}
          data-destello={destello || undefined}
          style={
            {
              left: `${x.toFixed(2)}%`,
              top: `${y.toFixed(2)}%`,
              width: tamano,
              height: tamano,
              "--o": opacidad.toFixed(2),
              "--t": `${duracion.toFixed(2)}s`,
              "--d": `${(-demora).toFixed(2)}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
