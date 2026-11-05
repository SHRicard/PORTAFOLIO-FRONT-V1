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
  /**
   * Va detrás de todas las páginas públicas y no se desmonta al cambiar de página: sirve para un
   * fondo que se anima de una a otra. Decide solo en qué páginas se ve
   */
  Fondo?: ComponentType;
  /** La página de inicio: lo que se ve en / */
  Pagina: ComponentType;
  /** Las demás páginas del diseño. Con `ruta: "sobre-mi"` se ve en /sobre-mi. Con `ruta: "blog"`, reemplaza la lista del blog */
  paginas?: { ruta: string; Pagina: ComponentType }[];
}
