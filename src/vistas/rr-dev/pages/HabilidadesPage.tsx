import { Title } from "@/components/ui/Typography";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";

/** Por ahora el nombre del apartado, sobre el espacio visto desde la Tierra, de día, con sus satélites: un paso más lejos del sol que Sobre mí. El espacio lo pone `SpaceScene`, detrás de todas las páginas */
export default function HabilidadesPage() {
  return (
    <SectionReveal>
      <Title data-encender={0}>Habilidades</Title>
    </SectionReveal>
  );
}
