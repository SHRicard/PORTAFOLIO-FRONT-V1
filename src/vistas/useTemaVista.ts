import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setModoVista } from "@/features/theme/modoVistaSlice";
import type { ThemeVars } from "@/features/theme/themeTypes";
import type { Vista } from "@/vistas/types";
import { useVista } from "@/vistas/useVista";

/** Variables del tema de un portafolio en un modo (sin modo o si no existe: el de por defecto) */
export function varsDeVista(vista: Vista, modoId?: string): ThemeVars {
  const { base, modos } = vista.tema;
  const modo = modos.find(({ id }) => id === modoId) ?? modos[0];
  return { ...base, ...modo.colores };
}

/**
 * El tema del portafolio en pantalla, con el modo que eligió el visitante EN ESE portafolio.
 * No mira el de los demás portafolios ni el del panel
 */
export function useTemaVista() {
  const vista = useVista();
  const dispatch = useAppDispatch();
  const elegido = useAppSelector((state) => state.modoVista[vista.id]);
  const { modos } = vista.tema;
  const modo = modos.find(({ id }) => id === elegido) ?? modos[0];
  // El mismo objeto mientras no cambie el portafolio ni el modo: así no se reaplica el tema en cada render
  const vars = useMemo(() => varsDeVista(vista, modo.id), [vista, modo.id]);

  return {
    vars,
    modo,
    modos,
    cambiarModo: (id: string) => dispatch(setModoVista({ vista: vista.id, modo: id })),
  };
}
