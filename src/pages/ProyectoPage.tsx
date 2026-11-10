import { useParams } from "react-router";
import { ProyectoDetalle } from "@/features/portafolio/ProyectoDetalle";
import { useVista } from "@/vistas/useVista";

/** Web pública: un proyecto. Un diseño puede traer la suya, en `paginas` con la ruta "proyectos/:slug" */
export default function ProyectoPage() {
  const { slug = "" } = useParams();
  const { paginas } = useVista();
  const propia = paginas?.find(({ ruta }) => ruta === "proyectos/:slug");

  return propia ? <propia.Pagina /> : <ProyectoDetalle slug={slug} />;
}
