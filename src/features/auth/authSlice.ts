import { createSlice } from "@reduxjs/toolkit";
import { tokenStorage } from "@/lib/tokenStorage";
import { sessionEnded, sessionStarted } from "./authActions";

interface AuthState {
  /** Token de sesión. Redux es la fuente de verdad en ejecución; el almacenamiento solo persiste. */
  token: string | null;
}

const authSlice = createSlice({
  name: "auth",
  // función: se lee el almacenamiento cada vez que se crea un store
  initialState: (): AuthState => ({ token: tokenStorage.get() }),
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionStarted, (state, action) => {
        state.token = action.payload;
      })
      .addCase(sessionEnded, (state) => {
        state.token = null;
      });
  },
});

export default authSlice.reducer;
