import { Link } from "react-router";
import { APELLIDO, NOMBRE } from "@/lib/identidad";
import { BrandMark } from "@/vistas/rr-dev/components/atoms/BrandMark";

/** Icono de la marca y mi nombre, con el apellido resaltado */
export function Logo() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 font-titulo text-lg font-semibold whitespace-nowrap text-texto sm:text-xl"
    >
      <BrandMark />
      <span>
        {NOMBRE} <span className="text-secundario">{APELLIDO}</span>
      </span>
    </Link>
  );
}
