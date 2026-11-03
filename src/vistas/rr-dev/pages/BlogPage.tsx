import { Title } from "@/components/ui/Typography";
import { SectionReveal } from "@/vistas/rr-dev/components/organisms/SectionReveal";

/**
 * Por ahora el nombre del apartado, sobre el espacio visto desde Saturno: el último paso del viaje.
 * Las publicaciones no se muestran, porque tapaban la vista. El espacio lo pone `SpaceScene`
 */
export default function BlogPage() {
  return (
    <SectionReveal>
      <Title data-encender={0}>Blog</Title>
    </SectionReveal>
  );
}
