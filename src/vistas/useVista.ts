import { useAppSelector } from "@/app/hooks";
import { VISTAS } from "@/vistas";

/** El diseño elegido en Apariencia, o el primero si el elegido ya no existe */
export function useVista() {
  const vistaWeb = useAppSelector((state) => state.theme.vistaWeb);

  return VISTAS.find(({ id }) => id === vistaWeb) ?? VISTAS[0];
}
