import { api } from "@/services/api";
import type { ApiSuccess } from "@/types/api";
import type { GuardarPerfilInput, Perfil } from "./types";

/**
 * Endpoints del panel (solo el administrador). Contrato: docs/api/PERFIL.md
 * Comparten el tag "Perfil" con la lectura pública: al guardar acá, la web se actualiza sola.
 */
export const perfilApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPerfilAdmin: build.query<Perfil, void>({
      query: () => "/perfil/admin",
      transformResponse: (res: ApiSuccess<{ perfil: Perfil }>) => res.data.perfil,
      providesTags: ["Perfil"],
    }),

    /** Crea el perfil o lo reemplaza entero: el formulario siempre manda todos los campos */
    guardarPerfil: build.mutation<Perfil, GuardarPerfilInput>({
      query: (body) => ({ url: "/perfil", method: "PUT", body }),
      transformResponse: (res: ApiSuccess<{ perfil: Perfil }>) => res.data.perfil,
      invalidatesTags: ["Perfil"],
    }),
  }),
});

export const { useGetPerfilAdminQuery, useGuardarPerfilMutation } = perfilApi;
