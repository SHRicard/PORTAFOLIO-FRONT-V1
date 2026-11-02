import { getErrorMessage } from "@/lib/errors";
import {
  useGetEstudiosQuery,
  useGetExperienciaQuery,
  useGetPerfilQuery,
  useGetProyectosQuery,
} from "./portafolioApi";

/** Carga las 4 partes en paralelo. Si una falla no se muestra nada: el error es de toda la página */
export function usePortafolio() {
  const perfil = useGetPerfilQuery();
  const proyectos = useGetProyectosQuery();
  const experiencia = useGetExperienciaQuery();
  const estudios = useGetEstudiosQuery();

  const error = perfil.error ?? proyectos.error ?? experiencia.error ?? estudios.error;
  const datos =
    perfil.data && proyectos.data && experiencia.data && estudios.data
      ? {
          perfil: perfil.data,
          proyectos: proyectos.data,
          experiencia: experiencia.data,
          estudios: estudios.data,
        }
      : null;

  return { datos, error: error ? getErrorMessage(error) : null, cargando: !datos && !error };
}
