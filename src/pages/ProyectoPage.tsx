import { useParams } from "react-router";
import { ProyectoDetalle } from "@/features/portafolio/ProyectoDetalle";

export default function ProyectoPage() {
  const { slug = "" } = useParams();
  return <ProyectoDetalle slug={slug} />;
}
