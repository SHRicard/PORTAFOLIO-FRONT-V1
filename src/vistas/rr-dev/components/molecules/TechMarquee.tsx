import { useId } from "react";
import { TechTag } from "@/vistas/rr-dev/components/atoms/TechTag";

interface TechMarqueeProps {
  items: string[];
  /** Título de arriba. También nombra la lista */
  etiqueta: string;
}

/** Título y palabras deslizándose de costado sin fin. Se frena al pasar el mouse. */
export function TechMarquee({ items, etiqueta }: TechMarqueeProps) {
  const etiquetaId = useId();

  return (
    <div className="w-full">
      <p
        id={etiquetaId}
        aria-hidden
        className="mb-3 text-center text-[0.8rem] font-medium tracking-[.24em] text-texto-suave uppercase"
      >
        {etiqueta}
      </p>
      <div className="marquesina">
        {/* La lista va dos veces seguidas: deslizarla la mitad da la vuelta sin que se note el salto */}
        <ul aria-labelledby={etiquetaId} className="flex w-max">
          {items.map((item) => (
            <li key={item} className="px-4.5 md:px-6">
              <TechTag etiqueta={item} />
            </li>
          ))}
          {items.map((item) => (
            <li key={`${item}-copia`} aria-hidden className="px-4.5 md:px-6">
              <TechTag etiqueta={item} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
