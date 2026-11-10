import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { defaultNavegacion, defaultPaleta, defaultTheme } from "./defaultTheme";
import { PALETAS } from "./paletas";
import type { EstiloNavegacion, ThemeVars } from "./themeTypes";

/**
 * El tema del PANEL y del login: lo elijo en Apariencia y no toca la web pública. Cada portafolio
 * tiene el suyo en su carpeta (`src/vistas/<id>/tema.ts`), y qué portafolio se ve lo guarda el
 * backend (`perfil.vista`). Ningún componente de `src/vistas/` importa este slice
 */
interface ThemeState {
  vars: ThemeVars;
  paleta: string;
  navegacion: EstiloNavegacion;
}

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    vars: defaultTheme,
    paleta: defaultPaleta.id,
    navegacion: defaultNavegacion,
  } as ThemeState,
  reducers: {
    /** Cambia solo las variables indicadas: setTheme({ radioCard: "1.5rem" }) */
    setTheme(state, action: PayloadAction<Partial<ThemeVars>>) {
      state.vars = { ...state.vars, ...action.payload };
    },
    /** Aplica el pack de colores completo. Las fuentes y las formas no cambian. */
    setPaleta(state, action: PayloadAction<string>) {
      const paleta = PALETAS.find(({ id }) => id === action.payload);
      if (!paleta) return;
      state.paleta = paleta.id;
      state.vars = { ...state.vars, ...paleta.colores };
    },
    setNavegacion(state, action: PayloadAction<EstiloNavegacion>) {
      state.navegacion = action.payload;
    },
    /** Vuelve al tema del panel por defecto. No toca la vista guardada ni el tema de los portafolios */
    resetTheme(state) {
      state.vars = defaultTheme;
      state.paleta = defaultPaleta.id;
      state.navegacion = defaultNavegacion;
    },
  },
});

export const { setTheme, setPaleta, setNavegacion, resetTheme } = themeSlice.actions;
export default themeSlice.reducer;
