import { todasLasPaginas } from "@/lib/paginacion";
import { api } from "@/services/api";
import type { ApiSuccess } from "@/types/api";
import type {
  ActualizarEntradaInput,
  CrearEntradaInput,
  Entrada,
  EntradaResumen,
  EstadoEntrada,
} from "./types";

/**
 * Lectura pública y endpoints del panel (solo el administrador). Contrato: docs/api/BLOG.md
 * Comparten el tag "Blog": al guardar en el panel, la web se actualiza sola.
 */
export const blogApi = api.injectEndpoints({
  endpoints: (build) => ({
    getEntradas: build.query<EntradaResumen[], void>({
      queryFn: (_arg, _api, _extra, baseQuery) => todasLasPaginas<EntradaResumen>(baseQuery, "/blog", "entradas"),
      providesTags: ["Blog"],
    }),

    getEntrada: build.query<Entrada, string>({
      query: (slug) => `/blog/${encodeURIComponent(slug)}`,
      transformResponse: (res: ApiSuccess<{ entrada: Entrada }>) => res.data.entrada,
      providesTags: ["Blog"],
    }),

    getEntradasAdmin: build.query<EntradaResumen[], { estado?: EstadoEntrada } | void>({
      queryFn: (filtros, _api, _extra, baseQuery) =>
        todasLasPaginas<EntradaResumen>(baseQuery, "/blog/admin", "entradas", { estado: filtros?.estado }),
      providesTags: ["Blog"],
    }),

    getEntradaAdmin: build.query<Entrada, string>({
      query: (id) => `/blog/admin/${id}`,
      transformResponse: (res: ApiSuccess<{ entrada: Entrada }>) => res.data.entrada,
      providesTags: ["Blog"],
    }),

    crearEntrada: build.mutation<Entrada, CrearEntradaInput>({
      query: (body) => ({ url: "/blog", method: "POST", body }),
      transformResponse: (res: ApiSuccess<{ entrada: Entrada }>) => res.data.entrada,
      invalidatesTags: ["Blog"],
    }),

    actualizarEntrada: build.mutation<Entrada, { id: string; cambios: ActualizarEntradaInput }>({
      query: ({ id, cambios }) => ({ url: `/blog/${id}`, method: "PATCH", body: cambios }),
      transformResponse: (res: ApiSuccess<{ entrada: Entrada }>) => res.data.entrada,
      invalidatesTags: ["Blog"],
    }),

    eliminarEntrada: build.mutation<string, string>({
      query: (id) => ({ url: `/blog/${id}`, method: "DELETE" }),
      transformResponse: (res: ApiSuccess<{ id: string }>) => res.data.id,
      invalidatesTags: ["Blog"],
    }),
  }),
});

export const {
  useGetEntradasQuery,
  useGetEntradaQuery,
  useGetEntradasAdminQuery,
  useGetEntradaAdminQuery,
  useCrearEntradaMutation,
  useActualizarEntradaMutation,
  useEliminarEntradaMutation,
} = blogApi;
