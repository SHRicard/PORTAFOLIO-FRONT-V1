import { Navigate, Outlet, useLocation } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { safeRedirectPath } from "@/lib/redirect";

/**
 * Rutas solo para quien NO tiene sesión (login y registro).
 * Cuando el login termina bien, el token aparece en Redux y esto redirige solo:
 * a la ruta que el usuario intentaba abrir, o a /admin.
 */
export function GuestRoute() {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (token) {
    const from = (location.state as { from?: unknown } | null)?.from;
    return <Navigate to={safeRedirectPath(from)} replace />;
  }
  return <Outlet />;
}
