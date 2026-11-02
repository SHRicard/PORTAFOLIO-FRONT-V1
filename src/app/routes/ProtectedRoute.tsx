import { Navigate, Outlet, useLocation } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { useGetMeQuery } from "@/features/auth/authApi";
import { Button } from "@/components/ui/Button";
import { FullScreenSpinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";

/**
 * Protege todo lo que cuelga de /admin:
 *  - sin token                -> al login (recordando a dónde quería ir)
 *  - con token                -> verifica la sesión pidiendo el perfil (GET /users/me)
 *  - token vencido (401)      -> la capa de API cierra la sesión y esto redirige al login
 *  - error de red / servidor  -> pantalla con botón para reintentar (no se pierde la sesión)
 */
export function ProtectedRoute() {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();
  const { data, isError, refetch } = useGetMeQuery(undefined, { skip: !token });

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (isError) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
        <Alert tipo="error">No pudimos verificar tu sesión. Revisá tu conexión e intentá de nuevo.</Alert>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  if (!data) return <FullScreenSpinner />;

  return <Outlet />;
}
