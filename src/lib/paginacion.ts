import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { ApiSuccess, Paginacion } from "@/types/api";

/** Máximo que acepta el backend por página */
const LIMITE = 100;

type Respuesta = { data?: unknown; error?: FetchBaseQueryError };

/**
 * Trae un listado completo para usar en el `queryFn` de un endpoint: pide las páginas que hagan falta.
 * Si una falla devuelve ese error: una lista a medias se mostraría como si estuviera completa.
 */
export async function todasLasPaginas<T>(
  baseQuery: (args: FetchArgs) => Respuesta | PromiseLike<Respuesta>,
  url: string,
  clave: string,
  params: FetchArgs["params"] = {},
): Promise<{ data: T[] } | { error: FetchBaseQueryError }> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await baseQuery({ url, params: { limit: LIMITE, ...params, ...(page > 1 && { page }) } });
    if (error) return { error };

    const cuerpo = (data as ApiSuccess<Record<string, unknown>>).data;
    items.push(...(cuerpo[clave] as T[]));
    if (page >= (cuerpo.paginacion as Paginacion).paginas) return { data: items };
  }
}
