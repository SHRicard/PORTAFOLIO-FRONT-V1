import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { defaultNavegacion, defaultPaleta, defaultTheme, defaultVistaWeb } from "./defaultTheme";
import { PALETAS } from "./paletas";
import type { EstiloNavegacion, ThemeVars } from "./themeTypes";

interface ThemeState {
  vars: ThemeVars;
  paleta: string;
  navegacion: EstiloNavegacion;
  vistaWeb: string;
}

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    vars: defaultTheme,
    paleta: defaultPaleta.id,
    navegacion: defaultNavegacion,
    vistaWeb: defaultVistaWeb,
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
    setVistaWeb(state, action: PayloadAction<string>) {
      state.vistaWeb = action.payload;
    },
    resetTheme(state) {
      state.vars = defaultTheme;
      state.paleta = defaultPaleta.id;
      state.navegacion = defaultNavegacion;
      state.vistaWeb = defaultVistaWeb;
    },
  },
});

export const { setTheme, setPaleta, setNavegacion, setVistaWeb, resetTheme } = themeSlice.actions;
export default themeSlice.reducer;
