import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/Button";
import { Subtitle, Title } from "@/components/ui/Typography";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Title tamano="xl">404</Title>
      <Subtitle>Esta página no existe.</Subtitle>
      <Link to="/" className={buttonVariants({ estilo: "contorno" })}>
        Volver al inicio
      </Link>
    </div>
  );
}
