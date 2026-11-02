import { todasLasPaginas } from "@/lib/paginacion";
import { api } from "@/services/api";
import type { ApiSuccess } from "@/types/api";
import type { ActualizarExperienciaInput, CrearExperienciaInput, Experiencia } from "./types";

/**
 * Endpoints del panel (solo el administrador). Contrato: docs/api/EXPERIENCIA.md
 * Comparten el tag "Experiencia" con la lectura pública: al guardar acá, la web se actualiza sola.
 */
export const experienciaApi = api.injectEndpoints({
  endpoints: (build) => ({
    getExperienciaAdmin: build.query<Experiencia[], void>({
      queryFn: (_arg, _api, _extra, baseQuery) =>
        todasLasPaginas<Experiencia>(baseQuery, "/experiencia/admin", "experiencia"),
      providesTags: ["Experiencia"],
    }),

    crearExperiencia: build.mutation<Experiencia, CrearExperienciaInput>({
      query: (body) => ({ url: "/experiencia", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ experiencia: Experiencia }>) => res.data.experiencia,
      invalidatesTags: ["Experiencia"],
    }),

    actualizarExperiencia: build.mutation<Experiencia, { id: string; cambios: ActualizarExperienciaInput }>({
      query: ({ id, cambios }) => ({ url: `/experiencia/${id}`, method: "PATCH", body: cambios }),
      transformResponse: (res: ApiSuccess<{ experiencia: Experiencia }>) => res.data.experiencia,
      invalidatesTags: ["Experiencia"],
    }),

    eliminarExperiencia: build.mutation<string, string>({
      query: (id) => ({ url: `/experiencia/${id}`, method: "DELETE" }),
      transformResponse: (res: ApiSuccess<{ id: string }>) => res.data.id,
      invalidatesTags: ["Experiencia"],
    }),
  }),
});

export const {
  useGetExperienciaAdminQuery,
  useCrearExperienciaMutation,
  useActualizarExperienciaMutation,
  useEliminarExperienciaMutation,
} = experienciaApi;
