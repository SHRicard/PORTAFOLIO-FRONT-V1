import { todasLasPaginas } from "@/lib/paginacion";
import { api } from "@/services/api";
import type { ApiFailure, ApiSuccess } from "@/types/api";
import type {
  Archivo,
  FirmaSubida,
  RegistrarArchivoInput,
  RespuestaCloudinary,
  SubirArchivoInput,
  TipoArchivo,
} from "./types";

/** Formato de cada tipo de archivo que acepta el backend */
const FORMATO_POR_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

type DatosArchivo = Pick<File, "type" | "size">;

/**
 * Las reglas de cada tipo, las mismas que manda el backend en la firma (docs/api/ARCHIVOS.md). Sirven
 * para avisar apenas se elige un archivo que se sube recién al guardar; al subir manda la firma
 */
export const REGLAS_ARCHIVO: Record<TipoArchivo, Pick<FirmaSubida, "formatos" | "maxBytes">> = {
  imagen: { formatos: ["jpg", "png", "webp"], maxBytes: 5 * 1024 * 1024 },
  documento: { formatos: ["pdf"], maxBytes: 10 * 1024 * 1024 },
};

/** Mismo formato que un error del backend, así getErrorMessage lo muestra sin casos especiales */
const errorLocal = (message: string) => ({ status: 400, data: { ok: false, message } satisfies ApiFailure });

/** Devuelve el problema del archivo, o null si se puede subir */
export function validarArchivo(archivo: DatosArchivo, firma: Pick<FirmaSubida, "formatos" | "maxBytes">) {
  const formato = FORMATO_POR_MIME[archivo.type];
  if (!formato || !firma.formatos.includes(formato)) return `Formato no permitido: usá ${firma.formatos.join(", ")}`;
  if (archivo.size === 0) return "El archivo está vacío";
  if (archivo.size > firma.maxBytes) {
    const maximo = firma.maxBytes / (1024 * 1024);
    // Lo que no entra en Cloudinary se aloja afuera: en el mismo campo se puede pegar el link
    return formato === "pdf"
      ? `El PDF supera el máximo de ${maximo} MB: subilo a GitHub y pegá el link`
      : `El archivo supera el máximo de ${maximo} MB`;
  }
  return null;
}

/** Los campos firmados, tal cual, y el archivo al final */
function armarFormulario(archivo: File, firma: FirmaSubida) {
  const formulario = new FormData();
  for (const [campo, valor] of Object.entries(firma.campos)) formulario.append(campo, String(valor));
  formulario.append("file", archivo);
  return formulario;
}

/** Sube a Cloudinary con un fetch propio: no puede pasar por baseQuery porque le mandaría el token del panel */
async function subirACloudinary(archivo: File, firma: FirmaSubida, tipo: TipoArchivo) {
  let respuesta: Response;
  try {
    respuesta = await fetch(firma.urlSubida, { method: "POST", body: armarFormulario(archivo, firma) });
  } catch {
    return { error: errorLocal("No se pudo conectar con Cloudinary") };
  }

  const json = (await respuesta.json().catch(() => null)) as
    | (RespuestaCloudinary & { error?: { message?: string } })
    | null;
  if (!respuesta.ok || !json) return { error: errorLocal(json?.error?.message ?? "Cloudinary rechazó el archivo") };

  const { public_id, secure_url, format, bytes, width, height, original_filename } = json;
  const datos: RegistrarArchivoInput = {
    publicId: public_id,
    url: secure_url,
    tipo,
    formato: format,
    bytes,
    ancho: width ?? null,
    alto: height ?? null,
    nombreOriginal: original_filename ?? null,
  };
  return { data: datos };
}

/** Endpoints del servicio de archivos (solo el administrador). Contrato: docs/api/ARCHIVOS.md */
export const archivosApi = api.injectEndpoints({
  endpoints: (build) => ({
    getArchivos: build.query<Archivo[], { tipo?: TipoArchivo } | void>({
      queryFn: (filtros, _api, _extra, baseQuery) =>
        todasLasPaginas<Archivo>(baseQuery, "/archivos", "archivos", { tipo: filtros?.tipo }),
      providesTags: ["Archivo"],
    }),

    /** Los 3 pasos del contrato: pedir la firma, subir a Cloudinary y registrar en la biblioteca */
    subirArchivo: build.mutation<Archivo, SubirArchivoInput>({
      async queryFn({ archivo, tipo, carpeta }, _api, _extra, baseQuery) {
        const body = { tipo, ...(carpeta && { carpeta }) }; // sin carpeta, no se manda (el backend rechaza "")
        const pedido = await baseQuery({ url: "/archivos/firma", method: "POST", body });
        if (pedido.error) return { error: pedido.error };
        const { firma } = (pedido.data as ApiSuccess<{ firma: FirmaSubida }>).data;

        const problema = validarArchivo(archivo, firma);
        if (problema) return { error: errorLocal(problema) };

        const subida = await subirACloudinary(archivo, firma, tipo);
        if (subida.error) return { error: subida.error };

        const registro = await baseQuery({ url: "/archivos", method: "POST", body: subida.data });
        if (registro.error) return { error: registro.error };
        return { data: (registro.data as ApiSuccess<{ archivo: Archivo }>).data.archivo };
      },
      invalidatesTags: ["Archivo"],
    }),

    eliminarArchivo: build.mutation<string, string>({
      query: (id) => ({ url: `/archivos/${id}`, method: "DELETE" }),
      transformResponse: (res: ApiSuccess<{ id: string }>) => res.data.id,
      invalidatesTags: ["Archivo"],
    }),
  }),
});

export const { useGetArchivosQuery, useSubirArchivoMutation, useEliminarArchivoMutation } = archivosApi;
