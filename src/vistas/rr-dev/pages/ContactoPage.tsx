import { Title } from "@/components/ui/Typography";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";

/** Por ahora el nombre del apartado, sobre el espacio visto desde Júpiter: un paso más lejos del sol que Proyectos. El espacio lo pone `SpaceScene`, detrás de todas las páginas */
export default function ContactoPage() {
  return (
    <SectionReveal>
      <Title data-encender={0}>Contacto</Title>
    </SectionReveal>
  );
}
