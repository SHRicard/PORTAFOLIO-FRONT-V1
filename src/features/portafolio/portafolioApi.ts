import { todasLasPaginas } from "@/lib/paginacion";
import { api } from "@/services/api";
import type { ApiSuccess } from "@/types/api";
import type { Estudio, Experiencia, Perfil, Proyecto } from "./types";

/** Lectura pública del portafolio. Contrato: docs/api/IMPLEMENTACION_ME.md */
export const portafolioApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPerfil: build.query<Perfil, void>({
      query: () => "/perfil",
      transformResponse: (res: ApiSuccess<{ perfil: Perfil }>) => res.data.perfil,
      providesTags: ["Perfil"],
    }),

    // Sin filtro: todos. Con destacado: true, solo los destacados. Ya vienen en el orden del panel
    getProyectos: build.query<Proyecto[], { destacado?: boolean } | void>({
      queryFn: (filtros, _api, _extra, baseQuery) =>
        todasLasPaginas<Proyecto>(baseQuery, "/proyectos", "proyectos", { destacado: filtros?.destacado }),
      providesTags: ["Proyecto"],
    }),

    getProyecto: build.query<Proyecto, string>({
      query: (slug) => `/proyectos/${encodeURIComponent(slug)}`,
      transformResponse: (res: ApiSuccess<{ proyecto: Proyecto }>) => res.data.proyecto,
      providesTags: ["Proyecto"],
    }),

    getExperiencia: build.query<Experiencia[], void>({
      queryFn: (_arg, _api, _extra, baseQuery) => todasLasPaginas<Experiencia>(baseQuery, "/experiencia", "experiencia"),
      providesTags: ["Experiencia"],
    }),

    getEstudios: build.query<Estudio[], void>({
      queryFn: (_arg, _api, _extra, baseQuery) => todasLasPaginas<Estudio>(baseQuery, "/estudios", "estudios"),
      providesTags: ["Estudio"],
    }),
  }),
});

export const {
  useGetPerfilQuery,
  useGetProyectosQuery,
  useGetProyectoQuery,
  useGetExperienciaQuery,
  useGetEstudiosQuery,
} = portafolioApi;
