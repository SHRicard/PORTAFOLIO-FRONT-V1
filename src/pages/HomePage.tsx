import { useVista } from "@/vistas/useVista";

/** Web pública: el portafolio, con el diseño elegido en Apariencia */
export default function HomePage() {
  const { Pagina } = useVista();

  return <Pagina />;
}
