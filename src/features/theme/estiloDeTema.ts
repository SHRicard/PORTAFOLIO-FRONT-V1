import type { CSSProperties } from "react";
import { getContrastColor } from "@/lib/color";
import { toCssVarName } from "./applyTheme";
import type { ThemeVars } from "./themeTypes";

/**
 * Las variables de un tema como `style`: lo que va adentro se pinta con ESE tema, sin tocar el
 * resto de la página. Va junto con la clase `tema`, que vuelve a calcular las variables derivadas
 * (ver `src/index.css`). Lo usan las muestras del panel para dibujar cada portafolio con sus colores
 */
export function estiloDeTema(vars: ThemeVars): CSSProperties {
  return {
    ...Object.fromEntries(Object.entries(vars).map(([clave, valor]) => [toCssVarName(clave), valor])),
    "--primario-texto": getContrastColor(vars.primario),
    "--peligro-texto": getContrastColor(vars.peligro),
  } as CSSProperties;
}
