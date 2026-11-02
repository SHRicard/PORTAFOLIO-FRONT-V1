import type { ComponentType } from "react";

/** Un diseño de la web pública. Cada uno vive en su propia carpeta: src/vistas/<id>/ */
export interface Vista {
  id: string;
  nombre: string;
  descripcion: string;
  /** Muestra chica para la tarjeta de Apariencia */
  Miniatura: ComponentType;
  /** Va arriba de todas las páginas públicas */
  Encabezado: ComponentType;
  /** La página de inicio: lo que se ve en / */
  Pagina: ComponentType;
  /** Las demás páginas del diseño. Con `ruta: "sobre-mi"` se ve en /sobre-mi */
  paginas?: { ruta: string; Pagina: ComponentType }[];
}
