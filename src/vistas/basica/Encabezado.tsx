import { Link } from "react-router";
import { useAppSelector } from "@/app/hooks";
import { buttonVariants } from "@/components/ui/Button";
import { APELLIDO, NOMBRE } from "@/lib/identidad";

export function Encabezado() {
  const token = useAppSelector((state) => state.auth.token);

  return (
    <header className="border-b border-borde">
      <div className="contenedor flex h-16 items-center justify-between">
        <Link to="/" className="font-titulo text-lg font-bold text-texto">
          {NOMBRE} <span className="text-secundario">{APELLIDO}</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/blog" className="text-sm font-medium text-texto hover:text-secundario">
            Blog
          </Link>
          <Link to={token ? "/admin" : "/login"} className={buttonVariants({ estilo: "contorno", tamano: "sm" })}>
            {token ? "Ir al panel" : "Ingresar"}
          </Link>
        </div>
      </div>
    </header>
  );
}
