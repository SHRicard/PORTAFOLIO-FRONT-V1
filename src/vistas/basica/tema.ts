import type { TemaVista } from "@/vistas/types";

const SISTEMA = "ui-sans-serif, system-ui, sans-serif";

/** El tema de Básica: un solo modo, oscuro, así que no tiene botón para cambiarlo. Es solo suyo */
export const tema: TemaVista = {
  base: {
    fuenteTitulo: SISTEMA,
    fuenteSubtitulo: SISTEMA,
    fuenteTexto: SISTEMA,
    radioCard: "0.75rem",
    radioBoton: "0.5rem",
    sombraCard: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  },
  modos: [
    {
      id: "oscuro",
      nombre: "Oscuro",
      descripcion: "Texto blanco sobre negro, con el violeta de acento.",
      colores: {
        primario: "#6c5ce7",
        primarioOscuro: "#4b3fd8",
        secundario: "#8b7bff",
        fondo: "#000000",
        superficie: "#0a0a0c",
        borde: "#1f1f24",
        texto: "#ffffff",
        textoSuave: "#a1a1aa",
        peligro: "#ef4444",
        exito: "#22c55e",
        info: "#818cf8",
        aviso: "#f59e0b",
        rosa: "#ec4899",
        sombra: "#000000",
        esquema: "dark",
      },
    },
  ],
};
