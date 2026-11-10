import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { ContactRow } from "@/vistas/rr-dev/components/molecules/ContactRow";
import type { FormaDeContacto } from "@/vistas/rr-dev/contacto";

interface ContactListProps {
  /** El rótulo de arriba, que nombra la lista: «Escribime» o «Seguime» */
  rotulo: string;
  formas: FormaDeContacto[];
  /** Los ms en que se enciende el rótulo y cada ficha, por su lugar (ver `useEncendido`) */
  encenderRotulo?: number;
  encenderDe?: (lugar: number) => number;
  className?: string;
}

/**
 * Las fichas de un costado de Contacto, como las de Proyectos, con una sola abierta: entra abierta la
 * primera, y al tocar otra se abre esa y se cierra la anterior. Arriba, el rótulo, como los de Sobre
 * mí. Las medidas salen del alto del apartado (`cqh`)
 */
export function ContactList({ rotulo, formas, encenderRotulo, encenderDe, className }: ContactListProps) {
  const id = useId();
  const [abierta, setAbierta] = useState(0);

  return (
    <div
      className={cn(
        "grid min-w-0 content-start gap-2 xl:gap-[clamp(0.375rem,1cqh,0.625rem)]",
        "[--emblema:2.25rem] xl:[--emblema:clamp(2rem,4.6cqh,2.75rem)]",
        className,
      )}
    >
      {/* La lista lee este rótulo: se oculta acá para que no se anuncie dos veces */}
      <p
        id={id}
        aria-hidden
        data-encender={encenderRotulo}
        data-respaldo
        className="px-1 text-[0.6875rem] font-medium tracking-[.24em] text-texto-suave uppercase xl:text-[length:clamp(0.6875rem,1.3cqh,0.8rem)]"
      >
        {rotulo}
      </p>
      <ul aria-labelledby={id} className="grid min-w-0 gap-2 xl:gap-[clamp(0.375rem,1cqh,0.625rem)]">
        {formas.map((forma, lugar) => (
          <li key={forma.id} className="min-w-0">
            <ContactRow
              forma={forma}
              abierta={lugar === Math.min(abierta, formas.length - 1)}
              onAbrir={() => setAbierta(lugar)}
              encender={encenderDe?.(lugar)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
