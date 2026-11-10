/** Ayudas de la pantalla del formulario de un proyecto */

/** Cuántos párrafos tiene un texto: los separa una línea en blanco */
export const contarParrafos = (texto: string) => texto.split(/\n\s*\n/).filter((p) => p.trim()).length;
