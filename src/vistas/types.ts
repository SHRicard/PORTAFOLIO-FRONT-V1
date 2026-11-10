import type { ComponentType } from "react";
import type { ColoresPaleta, Paleta } from "@/features/theme/paletas";
import type { ThemeVars } from "@/features/theme/themeTypes";

/** El tema propio de un portafolio. No se comparte con los demás ni con el panel */
export interface TemaVista {
  /** Fuentes, radios y sombras del portafolio */
  base: Omit<ThemeVars, keyof ColoresPaleta>;
  /**
   * Sus modos (por ejemplo, oscuro y claro), cada uno con sus colores. El primero es el de por
   * defecto. Con uno solo, no hay botón para cambiarlo
   */
  modos: Paleta[];
}

/** Un diseño de la web pública. Cada uno vive en su propia carpeta: src/vistas/<id>/ */
export interface Vista {
  id: string;
  nombre: string;
  descripcion: string;
  /** Muestra chica para la tarjeta de Apariencia */
  Miniatura: ComponentType;
  /**
   * Capturas de su portada para la vidriera del Inicio del panel: en una computadora (1440×900) y
   * en un celular (390×844). Viven en la carpeta del diseño, en `capturas/`
   */
  capturas: { escritorio: string; celular: string };
  /** Su tema, en `tema.ts` de su carpeta: colores, fuentes, formas y modos. Solo suyo */
  tema: TemaVista;
  /** Va arriba de todas las páginas públicas */
  Encabezado: ComponentType;
  /**
   * Va detrás de todas las páginas públicas y no se desmonta al cambiar de página: sirve para un
   * fondo que se anima de una a otra. Decide solo en qué páginas se ve
   */
  Fondo?: ComponentType;
  /** La página de inicio: lo que se ve en / */
  Pagina: ComponentType;
  /**
   * Las demás páginas del diseño. Con `ruta: "sobre-mi"` se ve en /sobre-mi. Con `ruta: "blog"`,
   * reemplaza la lista del blog; con `ruta: "blog/:slug"`, la página de cada publicación, y con
   * `ruta: "proyectos/:slug"`, la de cada proyecto
   */
  paginas?: { ruta: string; Pagina: ComponentType }[];
}
