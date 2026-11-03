export interface ItemMenu {
  id: string;
  href: string;
  label: string;
}

export const ITEMS_MENU: ItemMenu[] = [
  { id: "inicio", href: "/", label: "Inicio" },
  { id: "sobre-mi", href: "/sobre-mi", label: "Sobre mí" },
  { id: "habilidades", href: "/habilidades", label: "Habilidades" },
  { id: "proyectos", href: "/proyectos", label: "Proyectos" },
  { id: "contacto", href: "/contacto", label: "Contacto" },
  { id: "blog", href: "/blog", label: "Blog" },
];

export const TEXTOS = {
  navegacion: "Navegación principal",
  abrirMenu: "Abrir menú",
  cerrarMenu: "Cerrar menú",
  /** Va seguido del nombre de la paleta a la que se pasa */
  cambiarTema: "Cambiar a",
  descargarCv: "Descargar CV",
};

/** El enlace de la página actual. Un proyecto marca "Proyectos" y una publicación, "Blog". */
export function seccionActiva(pathname: string): string {
  return ITEMS_MENU.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`))?.id ?? "";
}
