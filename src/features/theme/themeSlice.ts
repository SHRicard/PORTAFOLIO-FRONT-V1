import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { defaultTheme } from "./defaultTheme";
import type { ThemeVars } from "./themeTypes";

interface ThemeState {
  vars: ThemeVars;
}

const themeSlice = createSlice({
  name: "theme",
  initialState: { vars: defaultTheme } as ThemeState,
  reducers: {
    /** Cambia solo las variables indicadas: setTheme({ primario: "#ff0000" }) */
    setTheme(state, action: PayloadAction<Partial<ThemeVars>>) {
      state.vars = { ...state.vars, ...action.payload };
    },
    resetTheme(state) {
      state.vars = defaultTheme;
    },
  },
});

export const { setTheme, resetTheme } = themeSlice.actions;
export default themeSlice.reducer;
