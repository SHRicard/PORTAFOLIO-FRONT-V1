/** Formato de respuesta de TODOS los servicios del backend */

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

/** Viene en todos los listados */
export interface Paginacion {
  page: number;
  limit: number;
  total: number;
  paginas: number;
}

export interface FieldErrorDetail {
  campo: string;
  mensaje: string;
}

export interface ApiFailure {
  ok: false;
  message: string;
  details?: FieldErrorDetail[] | string;
}
