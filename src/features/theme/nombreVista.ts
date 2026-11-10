/**
 * Parte el nombre de un portafolio para pintar de acento lo que sigue al primer punto:
 * "mi.universo" → ["mi", ".universo"]. Sin punto, va entero: "Básica" → ["Básica", ""].
 */
export function partirNombre(nombre: string): [string, string] {
  const punto = nombre.indexOf(".");
  if (punto <= 0) return [nombre, ""];
  return [nombre.slice(0, punto), nombre.slice(punto)];
}
