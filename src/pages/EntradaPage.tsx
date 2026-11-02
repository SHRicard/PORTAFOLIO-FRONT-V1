import { useParams } from "react-router";
import { EntradaDetalle } from "@/features/blog/EntradaDetalle";

export default function EntradaPage() {
  const { slug = "" } = useParams();
  return <EntradaDetalle slug={slug} />;
}
