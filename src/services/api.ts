import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { sessionEnded } from "@/features/auth/authActions";
import type { RootState } from "@/app/rootReducer";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  // El token se agrega solo a TODAS las peticiones. Nadie más tiene que tocar los headers.
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

/**
 * Si el backend responde 401 y había una sesión, el token venció o dejó de ser válido:
 * se cierra la sesión local y las rutas protegidas mandan al login.
 */
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  const hadSession = (api.getState() as RootState).auth.token !== null;
  if (result.error?.status === 401 && hadSession) api.dispatch(sessionEnded());
  return result;
};

/**
 * API base. Los endpoints NO se escriben acá: cada feature agrega los suyos con
 * `api.injectEndpoints(...)` en su propio archivo (ver src/features/auth/authApi.ts).
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: ["User", "Perfil", "Proyecto", "Experiencia", "Estudio", "Archivo", "Blog"], // agregar acá los tags de cada feature nueva
  endpoints: () => ({}),
});
