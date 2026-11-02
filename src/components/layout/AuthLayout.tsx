import { Link, Outlet } from "react-router";
import { Card } from "@/components/ui/Card";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-10">
      <Card tipo="sombra" className="w-full max-w-md">
        <Outlet />
      </Card>
      <Link to="/" className="text-sm text-texto-suave hover:text-texto">
        ← Volver al inicio
      </Link>
    </div>
  );
}
