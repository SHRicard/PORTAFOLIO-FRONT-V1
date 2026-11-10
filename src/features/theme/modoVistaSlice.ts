import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * El modo (claro, oscuro...) que eligió el visitante EN CADA portafolio: { "rr-dev": "uva-neon" }.
 * Es estado del cliente: lo elige el visitante con el botón del portafolio, no viene del backend.
 * Cada portafolio tiene su entrada: cambiar el modo de uno no toca el de los demás
 */
type ModoVistaState = Record<string, string>;

const modoVistaSlice = createSlice({
  name: "modoVista",
  initialState: {} as ModoVistaState,
  reducers: {
    setModoVista(state, action: PayloadAction<{ vista: string; modo: string }>) {
      state[action.payload.vista] = action.payload.modo;
    },
  },
});

export const { setModoVista } = modoVistaSlice.actions;
export default modoVistaSlice.reducer;
