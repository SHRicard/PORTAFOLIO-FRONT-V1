import { useParams } from "react-router";
import { EntradaDetalle } from "@/features/blog/EntradaDetalle";
import { useVista } from "@/vistas/useVista";

/** Web pública: una publicación. Un diseño puede traer la suya, en `paginas` con la ruta "blog/:slug" */
export default function EntradaPage() {
  const { slug = "" } = useParams();
  const { paginas } = useVista();
  const propia = paginas?.find(({ ruta }) => ruta === "blog/:slug");

  return propia ? <propia.Pagina /> : <EntradaDetalle slug={slug} />;
}
