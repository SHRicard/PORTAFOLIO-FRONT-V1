import type { ThemeVars } from "./themeTypes";

const SYSTEM_FONT = "ui-sans-serif, system-ui, sans-serif";

/**
 * Tema por defecto. Debe coincidir con los valores de :root en src/index.css
 * (el CSS evita un parpadeo antes de que cargue JavaScript).
 */
export const defaultTheme: ThemeVars = {
  primario: "#4f46e5",
  secundario: "#0ea5e9",
  fondo: "#ffffff",
  texto: "#0f172a",
  peligro: "#dc2626",
  fuenteTitulo: SYSTEM_FONT,
  fuenteSubtitulo: SYSTEM_FONT,
  fuenteTexto: SYSTEM_FONT,
  radioCard: "0.75rem",
  radioBoton: "0.5rem",
  sombraCard: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
};
