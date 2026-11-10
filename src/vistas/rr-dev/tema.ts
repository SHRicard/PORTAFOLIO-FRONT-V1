import type { TemaVista } from "@/vistas/types";

const SISTEMA = "ui-sans-serif, system-ui, sans-serif";

/**
 * El tema de mi.universo. Es solo suyo: el panel y los demás portafolios tienen el propio.
 * Sus modos son los dos cielos de noche entre los que ya pasaba el botón de sol y luna de la isla.
 * El primero es el de por defecto y coincide con `:root` de `src/index.css`, para que la primera
 * visita no parpadee. Todavía no tiene modo claro: hay que diseñarlo
 */
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
      id: "negro-violeta",
      nombre: "Negro y violeta",
      descripcion: "El espacio negro, con el violeta de acento.",
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
    {
      id: "uva-neon",
      nombre: "Uva y neón",
      descripcion: "El espacio morado, con rosa neón.",
      colores: {
        primario: "#ff4fae",
        primarioOscuro: "#7a3fe0",
        secundario: "#ff9ad6",
        fondo: "#1c1145",
        superficie: "#271a5c",
        borde: "#44318f",
        texto: "#ffffff",
        textoSuave: "#d3cbf5",
        peligro: "#ffb4a8",
        exito: "#22c55e",
        info: "#818cf8",
        aviso: "#f59e0b",
        rosa: "#ec4899",
        sombra: "#070218",
        esquema: "dark",
      },
    },
  ],
};
