import { BlogLista } from "@/features/blog/BlogLista";
import { useVista } from "@/vistas/useVista";

/** Web pública: las publicaciones del blog. Un diseño puede traer la suya, en `paginas` con la ruta "blog" */
export default function BlogPage() {
  const { paginas } = useVista();
  const propia = paginas?.find(({ ruta }) => ruta === "blog");

  return propia ? <propia.Pagina /> : <BlogLista />;
}
