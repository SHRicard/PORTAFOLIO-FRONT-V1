import { combineReducers } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import authReducer from "@/features/auth/authSlice";
import modoVistaReducer from "@/features/theme/modoVistaSlice";
import themeReducer from "@/features/theme/themeSlice";

/**
 * Para sumar el estado de una feature nueva: importar su reducer y agregarlo acá.
 * (Los endpoints de RTK Query no necesitan reducer propio: ya van en `api`.)
 */
export const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authReducer,
  /** El tema del panel y del login */
  theme: themeReducer,
  /** El modo que eligió el visitante en cada portafolio */
  modoVista: modoVistaReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
