import { BrandLogo } from "@/vistas/rr-dev/components/atoms/BrandLogo";
import type { FormaDeContacto } from "@/vistas/rr-dev/contacto";

interface ContactEmblemProps {
  forma: Pick<FormaDeContacto, "logo" | "icono">;
}

/**
 * El emblema de una forma de contacto: el anillo de su color con la luz que gira, como el de un
 * proyecto, y adentro el logo de la marca o el ícono. Mide `--emblema`. Es decorativo: el nombre va
 * al lado
 */
export function ContactEmblem({ forma: { logo, icono: Icono } }: ContactEmblemProps) {
  return (
    <span aria-hidden className="anillo-ficha grid size-(--emblema) shrink-0 place-items-center rounded-full p-0.5">
      <span className="grid size-full place-items-center rounded-full bg-superficie text-(--tono)">
        {logo ? <BrandLogo logo={logo} className="size-[44%]" /> : Icono && <Icono className="size-[44%]" />}
      </span>
    </span>
  );
}
