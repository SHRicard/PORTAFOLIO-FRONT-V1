import type { Ref } from "react";
import { cn } from "@/lib/cn";

interface NavIndicatorProps {
  /** Se oculta cuando ningún enlace está activo */
  visible: boolean;
  ref?: Ref<HTMLSpanElement>;
}

/** La pastilla que se desliza entre los enlaces. La mueve useIndicadorDeslizante. */
export function NavIndicator({ visible, ref }: NavIndicatorProps) {
  return <span ref={ref} aria-hidden className={cn("indicador-pastilla", !visible && "opacity-0")} />;
}
