import type { Ref } from "react";
import { cn } from "@/lib/cn";

interface NavIndicatorProps {
  /** Se oculta cuando ningún enlace está activo */
  visible: boolean;
  ref?: Ref<HTMLSpanElement>;
  /** El haz de luz que deja al pasar de un enlace a otro */
  estela?: Ref<HTMLSpanElement>;
}

/** El cometa que vuela entre los enlaces: la cabeza bajo el activo y su estela. Los mueve useIndicadorDeslizante. */
export function NavIndicator({ visible, ref, estela }: NavIndicatorProps) {
  return (
    <>
      <span ref={estela} aria-hidden className="cometa-estela" />
      <span ref={ref} aria-hidden className={cn("indicador-cometa", !visible && "opacity-0")} />
    </>
  );
}
