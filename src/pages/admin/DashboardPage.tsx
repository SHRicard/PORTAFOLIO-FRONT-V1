import { Vidriera } from "@/features/theme/Vidriera";
import { Title } from "@/components/ui/Typography";

/** El Inicio del panel: la vidriera con todos los portafolios. Sin saludo: el dueño no lo quiso */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Title>Tus portafolios</Title>
      <Vidriera />
    </div>
  );
}
