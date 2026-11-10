import { mensajeErrorProyecto } from "./formato";
import { FichaProyecto } from "./Portafolio";
import { useGetProyectoQuery } from "./portafolioApi";

export function ProyectoDetalle({ slug }: { slug: string }) {
  // currentData y no data: al cambiar de slug no se muestra el proyecto anterior mientras carga
  const { currentData: proyecto, error } = useGetProyectoQuery(slug);

  if (error) return <p>{mensajeErrorProyecto(error)}</p>;
  if (!proyecto) return <p>Cargando…</p>;
  return <FichaProyecto proyecto={proyecto} />;
}
