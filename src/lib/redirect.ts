/**
 * Devuelve una ruta interna segura para redirigir después del login.
 * Solo acepta rutas de esta misma app ("/admin/perfil"); rechaza URLs externas o raras
 * ("https://sitio.com", "//sitio.com", "/\sitio.com") para evitar redirecciones abiertas.
 */
export function safeRedirectPath(path: unknown, fallback = "/admin"): string {
  if (typeof path !== "string") return fallback;
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  return path;
}
