/** Estilo de la navegación del panel. No es una variable CSS: decide qué barra se dibuja. */
export type EstiloNavegacion = "dock" | "capsula" | "tabs";

/**
 * Variables del tema que se pueden elegir. Cada clave camelCase se convierte en la
 * variable CSS correspondiente: fuenteTitulo -> --fuente-titulo, radioCard -> --radio-card.
 * Las variables CSS están definidas en src/index.css.
 */
export interface ThemeVars {
  // colores (hex #RRGGBB): vienen todos de la paleta elegida, ver paletas.ts
  /** Acento de relleno: botones y elementos activos */
  primario: string;
  /** Segundo tono del acento, para resplandores como la aurora */
  primarioOscuro: string;
  /** Acento que se lee bien sobre el fondo: enlaces, foco y hover de los botones */
  secundario: string;
  fondo: string;
  /** Cards y paneles: un paso sobre el fondo */
  superficie: string;
  borde: string;
  /** Texto principal */
  texto: string;
  /** Texto secundario */
  textoSuave: string;
  peligro: string;
  /** Estados positivos, como el aviso de disponible */
  exito: string;
  /** Tonos de los iconos decorativos, como los de las estadísticas */
  info: string;
  aviso: string;
  rosa: string;
  /** Color de las sombras flotantes */
  sombra: string;
  /** Esquema de los controles nativos del navegador (selects, scroll, fechas) */
  esquema: "dark" | "light";
  // tipografía (valor de font-family)
  fuenteTitulo: string;
  fuenteSubtitulo: string;
  fuenteTexto: string;
  // formas (valores CSS: rem, px, sombras)
  radioCard: string;
  radioBoton: string;
  sombraCard: string;
}
