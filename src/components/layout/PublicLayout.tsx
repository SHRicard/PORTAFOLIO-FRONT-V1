import { Outlet } from "react-router";
import { useGetPerfilQuery } from "@/features/portafolio/portafolioApi";
import { useAplicarTema } from "@/features/theme/useAplicarTema";
import { useTemaVista } from "@/vistas/useTemaVista";
import { useVista } from "@/vistas/useVista";

/**
 * La web pública: dibuja el portafolio que eligió el administrador (`perfil.vista`) con SU tema y
 * el modo que eligió el visitante en él. Hasta que llega el perfil no dibuja ninguno: así quien
 * eligió otro no ve primero el de por defecto y después el salto
 */
export function PublicLayout() {
  const { isLoading } = useGetPerfilQuery();
  const { Encabezado, Fondo } = useVista();
  const { vars } = useTemaVista();
  useAplicarTema(vars);

  // Todavía no se sabe qué diseño mostrar: fondo liso, sin dibujar ninguna vista
  if (isLoading) return <div className="min-h-screen bg-fondo" />;

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
