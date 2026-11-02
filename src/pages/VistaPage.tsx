import { useParams } from "react-router";
import NotFoundPage from "@/pages/NotFoundPage";
import { useVista } from "@/vistas/useVista";

/** Web pública: una página propia del diseño elegido, como /sobre-mi. Si el diseño no la tiene, no existe. */
export default function VistaPage() {
  const { pagina } = useParams();
  const { paginas } = useVista();
  const elegida = paginas?.find(({ ruta }) => ruta === pagina);

  return elegida ? <elegida.Pagina /> : <NotFoundPage />;
}
