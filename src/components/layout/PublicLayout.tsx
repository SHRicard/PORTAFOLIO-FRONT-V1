import { Outlet } from "react-router";
import { useVista } from "@/vistas/useVista";

export function PublicLayout() {
  const { Encabezado, Fondo } = useVista();

  return (
    <div className="flex min-h-screen flex-col overflow-clip">
      {Fondo && <Fondo />}
      <Encabezado />

      <main className="contenedor flex-1 py-12">
        <Outlet />
      </main>
    </div>
  );
}
