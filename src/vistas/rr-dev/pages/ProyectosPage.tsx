import { Title } from "@/components/ui/Typography";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";

/** Por ahora el nombre del apartado, sobre el espacio visto desde Marte: un paso más lejos del sol que Habilidades, con la Tierra y su Luna atrás. El espacio lo pone `SpaceScene`, detrás de todas las páginas */
export default function ProyectosPage() {
  return (
    <SectionReveal>
      <Title data-encender={0}>Proyectos</Title>
    </SectionReveal>
  );
}
