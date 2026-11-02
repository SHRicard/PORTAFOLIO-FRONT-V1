import { useEffect, useState } from "react";

/** Dice si la página ya bajó más de `umbral` píxeles */
export function useScrollPasado(umbral: number) {
  const [pasado, setPasado] = useState(false);

  useEffect(() => {
    const medir = () => setPasado(window.scrollY > umbral);

    medir();
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, [umbral]);

  return pasado;
}
