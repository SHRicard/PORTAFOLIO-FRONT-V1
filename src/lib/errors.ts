import type { ApiFailure, FieldErrorDetail } from "@/types/api";

function isApiFailure(data: unknown): data is ApiFailure {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as ApiFailure).ok === false &&
    typeof (data as ApiFailure).message === "string"
  );
}

function getStatus(error: unknown): unknown {
  return typeof error === "object" && error !== null && "status" in error
    ? (error as { status: unknown }).status
    : undefined;
}

/** Texto listo para mostrarle al usuario a partir de cualquier error de RTK Query */
export function getErrorMessage(error: unknown, fallback = "Ocurrió un error inesperado"): string {
  const status = getStatus(error);
  if (status === "FETCH_ERROR") return "No se pudo conectar con el servidor";
  if (status === "TIMEOUT_ERROR") return "El servidor tardó demasiado en responder";
  if (status === "PARSING_ERROR") return "Respuesta inválida del servidor";

  const data = typeof error === "object" && error !== null ? (error as { data?: unknown }).data : undefined;
  if (isApiFailure(data)) return data.message;
  return fallback;
}

/** Errores de validación del backend (400) como { campo: mensaje } para marcar inputs */
export function getFieldErrors(error: unknown): Record<string, string> {
  const data = typeof error === "object" && error !== null ? (error as { data?: unknown }).data : undefined;
  if (!isApiFailure(data) || !Array.isArray(data.details)) return {};
  return Object.fromEntries((data.details as FieldErrorDetail[]).map((d) => [d.campo, d.mensaje]));
}

/** Mensaje general más el detalle de cada campo, para formularios con listas (campos como "galeria.0.alt") */
export function getErrorDetail(error: unknown): string {
  const mensaje = getErrorMessage(error);
  const campos = Object.entries(getFieldErrors(error)).map(([campo, detalle]) => `${campo}: ${detalle}`);
  return campos.length > 0 ? `${mensaje}. ${campos.join(" · ")}` : mensaje;
}
