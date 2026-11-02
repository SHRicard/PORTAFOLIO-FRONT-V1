/** Tipos del servicio de archivos. Fuente: docs/api/ARCHIVOS.md */

export type TipoArchivo = "imagen" | "documento" | "apk";

/** Lo que devuelve POST /archivos/firma */
export interface FirmaSubida {
  urlSubida: string;
  /** Se mandan tal cual a Cloudinary o a S3, junto con el archivo */
  campos: Record<string, string | number>;
  formatos: string[];
  maxBytes: number;
  /** Solo en los APK, que van a S3: dónde va a quedar. S3 no responde nada al subir */
  destino?: { publicId: string; url: string };
}

export interface Archivo {
  id: string;
  publicId: string;
  url: string;
  tipo: TipoArchivo;
  formato: string;
  bytes: number;
  ancho: number | null;
  alto: number | null;
  nombreOriginal: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrarArchivoInput {
  publicId: string;
  url: string;
  tipo: TipoArchivo;
  formato: string;
  bytes: number;
  ancho?: number | null;
  alto?: number | null;
  nombreOriginal?: string | null;
}

/** Los campos de la respuesta de Cloudinary que se usan */
export interface RespuestaCloudinary {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  original_filename?: string;
}

export interface SubirArchivoInput {
  archivo: File;
  tipo: TipoArchivo;
  /** Subcarpeta, ej. "proyectos/facturacion-fct" o "apk/facturacion-fct" */
  carpeta?: string;
}
