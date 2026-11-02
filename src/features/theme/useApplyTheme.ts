import { useEffect } from "react";
import { useAppSelector } from "@/app/hooks";
import { applyTheme } from "./applyTheme";
import { cargarFuente } from "./fuentes";

/** Mantiene las variables CSS sincronizadas con el tema guardado en Redux y carga sus fuentes. Se usa una vez, en App. */
export function useApplyTheme(): void {
  const vars = useAppSelector((state) => state.theme.vars);
  useEffect(() => {
    applyTheme(vars);
    [vars.fuenteTitulo, vars.fuenteSubtitulo, vars.fuenteTexto].forEach((fuente) => cargarFuente(fuente));
  }, [vars]);
}
