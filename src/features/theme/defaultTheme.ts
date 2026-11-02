import { PALETAS } from "./paletas";
import type { EstiloNavegacion, ThemeVars } from "./themeTypes";

const SYSTEM_FONT = "ui-sans-serif, system-ui, sans-serif";

export const defaultNavegacion: EstiloNavegacion = "capsula";
export const defaultPaleta = PALETAS[0];
/** Tiene que ser la id de una de las carpetas de src/vistas/ */
export const defaultVistaWeb = "rr-dev";

/**
 * Tema por defecto. Debe coincidir con los valores de :root en src/index.css
 * (el CSS evita un parpadeo antes de que cargue JavaScript).
 */
export const defaultTheme: ThemeVars = {
  ...defaultPaleta.colores,
  fuenteTitulo: SYSTEM_FONT,
  fuenteSubtitulo: SYSTEM_FONT,
  fuenteTexto: SYSTEM_FONT,
  radioCard: "0.75rem",
  radioBoton: "0.5rem",
  sombraCard: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
};
