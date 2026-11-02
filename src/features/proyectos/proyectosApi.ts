import { todasLasPaginas } from "@/lib/paginacion";
import { api } from "@/services/api";
import type { ApiSuccess } from "@/types/api";
import type { ActualizarProyectoInput, CrearProyectoInput, EstadoProyecto, Proyecto } from "./types";

/**
 * Endpoints del panel (solo el administrador). Contrato: docs/api/PROYECTOS.md
 * Comparten el tag "Proyecto" con la lectura pública: al guardar acá, la web se actualiza sola.
 */
export const proyectosApi = api.injectEndpoints({
  endpoints: (build) => ({
    getProyectosAdmin: build.query<Proyecto[], { estado?: EstadoProyecto } | void>({
      queryFn: (filtros, _api, _extra, baseQuery) =>
        todasLasPaginas<Proyecto>(baseQuery, "/proyectos/admin", "proyectos", { estado: filtros?.estado }),
      providesTags: ["Proyecto"],
    }),

    getProyectoAdmin: build.query<Proyecto, string>({
      query: (id) => `/proyectos/admin/${id}`,
      transformResponse: (res: ApiSuccess<{ proyecto: Proyecto }>) => res.data.proyecto,
      providesTags: ["Proyecto"],
    }),

    crearProyecto: build.mutation<Proyecto, CrearProyectoInput>({
      query: (body) => ({ url: "/proyectos", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ proyecto: Proyecto }>) => res.data.proyecto,
      invalidatesTags: ["Proyecto"],
    }),

    actualizarProyecto: build.mutation<Proyecto, { id: string; cambios: ActualizarProyectoInput }>({
      query: ({ id, cambios }) => ({ url: `/proyectos/${id}`, method: "PATCH", body: cambios }),
      transformResponse: (res: ApiSuccess<{ proyecto: Proyecto }>) => res.data.proyecto,
      invalidatesTags: ["Proyecto"],
    }),

    /** Recibe TODOS los ids en el orden nuevo */
    reordenarProyectos: build.mutation<Proyecto[], string[]>({
      query: (ids) => ({ url: "/proyectos/orden", method: "PUT", body: { ids } }),
      transformResponse: (res: ApiSuccess<{ proyectos: Proyecto[] }>) => res.data.proyectos,
      invalidatesTags: ["Proyecto"],
    }),

    eliminarProyecto: build.mutation<string, string>({
      query: (id) => ({ url: `/proyectos/${id}`, method: "DELETE" }),
      transformResponse: (res: ApiSuccess<{ id: string }>) => res.data.id,
      invalidatesTags: ["Proyecto"],
    }),
  }),
});

export const {
  useGetProyectosAdminQuery,
  useGetProyectoAdminQuery,
  useCrearProyectoMutation,
  useActualizarProyectoMutation,
  useReordenarProyectosMutation,
  useEliminarProyectoMutation,
} = proyectosApi;
