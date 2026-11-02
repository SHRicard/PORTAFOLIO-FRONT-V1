import { Outlet } from "react-router";
import { useVista } from "@/vistas/useVista";

export function PublicLayout() {
  const { Encabezado } = useVista();

  return (
    <div className="flex min-h-screen flex-col overflow-clip">
      <Encabezado />

      <main className="contenedor flex-1 py-12">
        <Outlet />
      </main>
    </div>
  );
}
