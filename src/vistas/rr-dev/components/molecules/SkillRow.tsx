import { useId } from "react";
import { cn } from "@/lib/cn";
import { tonoArea } from "@/vistas/rr-dev/components/atoms/SkillBubble";
import { BubbleTrail } from "@/vistas/rr-dev/components/molecules/BubbleTrail";
import type { AreaHabilidades } from "@/vistas/rr-dev/habilidades";

/** Al entrar al apartado: cuánto después del nombre del área aparecen las burbujas, la línea y los nombres */
const DEMORA = { burbujas: 300, linea: 700, nombres: 900 };

interface SkillRowProps {
  area: AreaHabilidades;
  /** Los ms en que se enciende al entrar al apartado (ver `useEncendido`) */
  encender?: number;
}

/**
 * Las habilidades de un área en un renglón, para el celular: el nombre del área, sus burbujas unidas
 * por una línea en zigzag y, debajo, los nombres en una tarjeta del color del área. Las burbujas
 * miden `--burbuja`
 */
export function SkillRow({ area, encender }: SkillRowProps) {
  const id = useId();
  const cantidad = area.habilidades.length;
  const despues = (ms: number) => (encender === undefined ? undefined : encender + ms);

  return (
    <section
      aria-labelledby={id}
      className={cn(tonoArea({ tono: area.tono }), "grid justify-items-center gap-[clamp(0.25rem,1.1cqh,0.625rem)]")}
    >
      <p
        id={id}
        data-encender={encender}
        data-respaldo
        className="flex items-start gap-2 text-[0.6875rem] font-medium tracking-[.2em] whitespace-nowrap text-texto-suave uppercase"
      >
        <span aria-hidden className="punto-area mt-1 size-1.5 shrink-0 rounded-full" />
        {area.nombre} <span className="font-semibold tracking-normal text-(--tono)">{cantidad}</span>
      </p>
      {/* Los nombres van debajo, en texto: las burbujas son el dibujo */}
      <BubbleTrail
        nombres={area.habilidades}
        icono={area.icono}
        encender={despues(DEMORA.burbujas)}
        trazar={despues(DEMORA.linea)}
      />
      <p
        data-encender={despues(DEMORA.nombres)}
        className="tarjeta-habilidad rounded-lg px-2.5 py-0.5 text-xs leading-[1.45] text-balance text-texto"
      >
        {area.habilidades.join(" · ")}
      </p>
    </section>
  );
}
