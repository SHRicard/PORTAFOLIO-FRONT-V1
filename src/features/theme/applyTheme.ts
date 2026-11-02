import { getContrastColor } from "@/lib/color";
import type { ThemeVars } from "./themeTypes";

/** primarioTexto -> --primario-texto */
export function toCssVarName(key: string): string {
  return "--" + key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

/**
 * Escribe el tema como variables CSS en <html>. Tailwind y los componentes las leen,
 * así que toda la app cambia al instante, sin recargar.
 * El color del texto sobre el primario y sobre el de peligro se calcula solo para que siempre se lea bien.
 */
export function applyTheme(theme: ThemeVars, root: HTMLElement = document.documentElement): void {
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(toCssVarName(key), value);
  }
  root.style.setProperty("--primario-texto", getContrastColor(theme.primario));
  root.style.setProperty("--peligro-texto", getContrastColor(theme.peligro));
}
