import { portafolioApi } from "@/features/portafolio/portafolioApi";
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

    /**
     * Elige el diseño de la web pública para todos los visitantes. null = la vista por defecto.
     * Con la respuesta, el perfil público ya muestra la nueva: no espera a que se vuelva a pedir
     */
    elegirVista: build.mutation<Perfil, string | null>({
      query: (vista) => ({ url: "/perfil", method: "PATCH", body: { vista } }),
      transformResponse: (res: ApiSuccess<{ perfil: Perfil }>) => res.data.perfil,
      invalidatesTags: ["Perfil"], // refresca /perfil/admin y /perfil: la web cambia sola
      async onQueryStarted(vista, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            portafolioApi.util.updateQueryData("getPerfil", undefined, (perfil) => {
              perfil.vista = data.vista ?? vista;
            }),
          );
        } catch {
          // El error lo muestra quien eligió
        }
      },
    }),
  }),
});

export const { useGetPerfilAdminQuery, useGuardarPerfilMutation, useElegirVistaMutation } = perfilApi;
