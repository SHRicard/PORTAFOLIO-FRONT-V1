import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { api } from "@/services/api";
import { sessionEnded, sessionStarted } from "@/features/auth/authActions";
import { tokenStorage } from "@/lib/tokenStorage";
import { rootReducer } from "./rootReducer";

/** Crea un store nuevo. La app usa `store`; los tests crean uno limpio con makeStore(). */
export function makeStore() {
  // Efectos secundarios de la sesión (persistir el token y limpiar al salir)
  const listener = createListenerMiddleware();

  listener.startListening({
    actionCreator: sessionStarted,
    effect: (action) => {
      tokenStorage.set(action.payload);
    },
  });

  listener.startListening({
    actionCreator: sessionEnded,
    effect: (_action, { dispatch }) => {
      tokenStorage.remove();
      dispatch(api.util.resetApiState()); // borra del caché los datos del usuario anterior
    },
  });

  return configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault().prepend(listener.middleware).concat(api.middleware),
  });
}

export const store = makeStore();

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
