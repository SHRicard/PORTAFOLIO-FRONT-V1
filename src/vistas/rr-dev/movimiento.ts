/** Lo que anima JavaScript no lo frena el CSS: hay que preguntar */
export const prefiereMenosMovimiento = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
