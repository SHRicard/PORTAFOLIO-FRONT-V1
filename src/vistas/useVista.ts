import { useGetPerfilQuery } from "@/features/portafolio/portafolioApi";
import { defaultVistaWeb } from "@/features/theme/defaultTheme";
import { VISTAS } from "@/vistas";

/**
 * El diseño que eligió el administrador (`perfil.vista`, guardado en el backend: lo ven todos los
 * visitantes). Sin elegir, sin perfil o si ya no existe: el de por defecto, o el primero.
 * Comparte la caché de `GET /perfil` con los datos de la web: no suma ningún pedido
 */
export function useVista() {
  const { data: perfil } = useGetPerfilQuery();
  const id = perfil?.vista ?? defaultVistaWeb;
  return VISTAS.find((vista) => vista.id === id) ?? VISTAS[0];
}
