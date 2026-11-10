import { useEffect } from "react";
import { applyTheme } from "./applyTheme";
import { cargarFuente } from "./fuentes";
import type { ThemeVars } from "./themeTypes";

/**
 * Escribe un tema en <html> y carga sus fuentes. Lo usa cada layout con SU tema: la web pública,
 * el del portafolio en pantalla; el panel y el login, el del panel. Como hay un solo layout a la
 * vez, el que se monta escribe todas las variables y así llegan también a body, al scroll y a los
 * controles nativos
 */
export function useAplicarTema(vars: ThemeVars): void {
  useEffect(() => {
    applyTheme(vars);
    [vars.fuenteTitulo, vars.fuenteSubtitulo, vars.fuenteTexto].forEach((fuente) => cargarFuente(fuente));
  }, [vars]);
}
