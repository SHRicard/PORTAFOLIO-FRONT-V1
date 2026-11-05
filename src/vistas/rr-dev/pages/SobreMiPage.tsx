import { Title } from "@/components/ui/Typography";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";

/** Por ahora el nombre del apartado, sobre el espacio visto desde Venus: un paso más lejos del sol que Inicio. El espacio lo pone `SpaceScene`, detrás de todas las páginas */
export default function SobreMiPage() {
  return (
    <SectionReveal>
      <Title data-encender={0}>Sobre mí</Title>
    </SectionReveal>
  );
}
