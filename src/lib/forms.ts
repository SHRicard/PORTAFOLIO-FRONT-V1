import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { getFieldErrors } from "@/lib/errors";

/**
 * Marca en el formulario los campos que el backend rechazó (error 400 con `details`).
 * `fields` son los campos que el formulario puede marcar. Si en la API se llaman distinto, es una función
 * que recibe el nombre de la API y devuelve el del formulario, o null si no tiene dónde mostrarse.
 * Devuelve true solo si marcó todos: si no, hay que mostrar el error general para no perder ninguno.
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[] | ((campo: string) => string | null),
): boolean {
  const nombreDe = typeof fields === "function" ? fields : (campo: string) => (fields.includes(campo) ? campo : null);
  const errores = Object.entries(getFieldErrors(error));
  let marcados = 0;
  for (const [campo, message] of errores) {
    const nombre = nombreDe(campo);
    if (nombre) {
      setError(nombre as Path<T>, { type: "server", message });
      marcados++;
    }
  }
  return errores.length > 0 && marcados === errores.length;
}
