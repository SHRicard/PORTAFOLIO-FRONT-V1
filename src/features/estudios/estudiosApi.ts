import { todasLasPaginas } from "@/lib/paginacion";
import { api } from "@/services/api";
import type { ApiSuccess } from "@/types/api";
import type { ActualizarEstudioInput, CrearEstudioInput, Estudio } from "./types";

/**
 * Endpoints del panel (solo el administrador). Contrato: docs/api/ESTUDIOS.md
 * Comparten el tag "Estudio" con la lectura pública: al guardar acá, la web se actualiza sola.
 */
export const estudiosApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEstudiosAdmin: build.query<Estudio[], void>({
      queryFn: (_arg, _api, _extra, baseQuery) => todasLasPaginas<Estudio>(baseQuery, "/estudios/admin", "estudios"),
      providesTags: ["Estudio"],
    }),

    crearEstudio: build.mutation<Estudio, CrearEstudioInput>({
      query: (body) => ({ url: "/estudios", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ estudio: Estudio }>) => res.data.estudio,
      invalidatesTags: ["Estudio"],
    }),

    actualizarEstudio: build.mutation<Estudio, { id: string; cambios: ActualizarEstudioInput }>({
      query: ({ id, cambios }) => ({ url: `/estudios/${id}`, method: "PATCH", body: cambios }),
      transformResponse: (res: ApiSuccess<{ estudio: Estudio }>) => res.data.estudio,
      invalidatesTags: ["Estudio"],
    }),

    eliminarEstudio: build.mutation<string, string>({
      query: (id) => ({ url: `/estudios/${id}`, method: "DELETE" }),
      transformResponse: (res: ApiSuccess<{ id: string }>) => res.data.id,
      invalidatesTags: ["Estudio"],
    }),
  }),
});

export const {
  useGetEstudiosAdminQuery,
  useCrearEstudioMutation,
  useActualizarEstudioMutation,
  useEliminarEstudioMutation,
} = estudiosApi;
