import { useSyncExternalStore } from "react";
import { LUGARES_PROYECTOS, type LugaresProyectos } from "@/vistas/rr-dev/proyectos";

/** Las consultas de `LUGARES_PROYECTOS`, en su orden. Sin `matchMedia` (los tests), ninguna */
function consultas(): (MediaQueryList | null)[] {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return [];
  return LUGARES_PROYECTOS.map(({ consulta }) => (consulta ? window.matchMedia(consulta) : null));
}

function suscribir(avisar: () => void) {
  const listas = consultas().filter((lista): lista is MediaQueryList => lista !== null);
  listas.forEach((lista) => lista.addEventListener("change", avisar));
  return () => listas.forEach((lista) => lista.removeEventListener("change", avisar));
}

/** El lugar de la primera que se cumple: la última, sin consulta, se cumple siempre */
function cualSeCumple() {
  const listas = consultas();
  return LUGARES_PROYECTOS.findIndex(({ consulta }, indice) => consulta === null || listas[indice]?.matches);
}

/**
 * Cuántas fichas de Proyectos entran a cada lado en esta pantalla (`LUGARES_PROYECTOS`). Cambia
 * solo si la pantalla cruza uno de los cortes, al girar el celular o al achicar la ventana
 */
export function useLugaresProyectos(): LugaresProyectos {
  const indice = useSyncExternalStore(suscribir, cualSeCumple, () => LUGARES_PROYECTOS.length - 1);
  return LUGARES_PROYECTOS[indice]!;
}
