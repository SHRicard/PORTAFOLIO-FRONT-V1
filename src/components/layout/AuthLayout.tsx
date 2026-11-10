import { Outlet } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { useAplicarTema } from "@/features/theme/useAplicarTema";
import { SunriseScene } from "@/vistas/rr-dev/components/organisms/SunriseScene";

/**
 * La pantalla del login: el amanecer de la vista RR-DEV, con el formulario al centro. Es una sola
 * para toda la app: se ve así aunque la web pública use otra vista. Lleva el tema del panel
 */
export function AuthLayout() {
  useAplicarTema(useAppSelector((state) => state.theme.vars));

  return (
    <SunriseScene>
      <Outlet />
    </SunriseScene>
  );
}
