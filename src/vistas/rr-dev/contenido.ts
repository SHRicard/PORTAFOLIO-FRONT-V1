import { Award, CodeXml, FolderGit2, GitCommitHorizontal, type LucideIcon } from "lucide-react";
import type { Experiencia, Perfil } from "@/features/portafolio/types";
import type { LOGOS_TECNOLOGIA } from "@/vistas/rr-dev/logos";

export interface Tecnologia {
  id: keyof typeof LOGOS_TECNOLOGIA;
  label: string;
}

export type TonoEstadistica = "info" | "exito" | "aviso" | "rosa";

export interface Estadistica {
  valor: string;
  etiqueta: string;
  icono: LucideIcon;
  tono: TonoEstadistica;
}

/** Se reparten entre las dos constelaciones, de a tres por lado */
export const TECNOLOGIAS: Tecnologia[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "nodejs", label: "Node.js" },
  { id: "mongodb", label: "MongoDB" },
];

export const TECNOLOGIAS_POR_LADO = 3;

/** Las palabras del carrusel */
export const SERVICIOS = [
  "Apps web",
  "APIs REST",
  "Ingeniería de UI",
  "Bases de datos",
  "Rendimiento",
  "Accesibilidad",
  "Diseño responsive",
];

export const TEXTOS_INICIO = {
  saludo: "Hola, soy",
  disponible: "Disponible para nuevos proyectos",
  rol: "Desarrollador Full Stack",
  descripcion:
    "Creo aplicaciones web rápidas y accesibles de punta a punta: desde interfaces en React hasta APIs en Node.js y las bases de datos que las sostienen.",
  seguime: "Seguime en",
  tecnologias: "Tecnologías",
  tuFoto: "Tu foto",
  loQueHago: "Lo que hago",
};

export const TEXTOS_BLOG = {
  titulo: "Blog",
  publicaciones: "Publicaciones",
  deEstaPagina: "Publicaciones de esta página",
  loUltimo: "Lo último del blog",
  leer: "Leer publicación",
  leerTitulo: (titulo: string) => `Leer: ${titulo}`,
  ver: (titulo: string) => `Ver: ${titulo}`,
  temas: "Temas",
  paginas: "Páginas del blog",
  anterior: "Anterior",
  siguiente: "Siguiente",
  pagina: (numero: number) => `Página ${numero}`,
  paginaDeTotal: (numero: number, paginas: number) => `Página ${numero} de ${paginas}`,
  fotos: (cantidad: number) => (cantidad === 1 ? "1 foto" : `${cantidad} fotos`),
  vacio: "Todavía no hay publicaciones.",
  sinPagina: "Esa página no existe.",
  irAlPrincipio: "Ir a la primera página",
  noExiste: "Esta publicación no existe o no está publicada.",
  leyendo: "Leyendo",
  cerrar: "Cerrar",
  compartir: "Compartir",
  copiado: "Enlace copiado",
  verFoto: (alt: string) => `Ver foto: ${alt}`,
  fotoDe: (numero: number, total: number) => `${numero} de ${total}`,
  fotoAnterior: "Foto anterior",
  fotoSiguiente: "Foto siguiente",
};

export const TEXTOS_SOBRE_MI = {
  /** El título va en dos partes, como el nombre de Inicio: la segunda con el degradado */
  titulo: "Sobre",
  tituloDegradado: "mí",
  enElTrabajo: "En el trabajo",
  fueraDelTrabajo: "Fuera del trabajo",
  /** Nombra una constelación lejana: los datos más viejos de ese costado */
  anteriores: (costado: string) => `${costado}: anteriores`,
  datosCuriosos: "Datos curiosos",
  trayectoria: "Trayectoria e idiomas",
  seguirLeyendo: "Seguir leyendo",
  /** Las tres listas de la barra, con lo que dice debajo cada una: no depende de cuántos haya */
  categorias: { trabajos: "Trabajos", estudios: "Estudios", idiomas: "Idiomas" },
  etiquetas: { trabajos: "Experiencia laboral", estudios: "Formación", idiomas: "Los que hablo" },
  verCategoria: (categoria: string) => `Ver ${categoria.toLocaleLowerCase("es")}`,
  /** Nombra las pestañas del panel */
  listas: "Listas de la trayectoria",
  /** Nombran las listas de cada paso de la línea de tiempo, para los lectores de pantalla */
  logros: "Logros",
  tecnologias: "Tecnologías",
  /** La barra de arriba del panel */
  panelBio: "Sobre mí",
  panelTrayectoria: "Trayectoria",
};

export const TEXTOS_HABILIDADES = {
  titulo: "Habilidades",
  cuenta: (tecnologias: number, areas: number) =>
    `${tecnologias} ${tecnologias === 1 ? "tecnología" : "tecnologías"} en ${areas} ${areas === 1 ? "área" : "áreas"}`,
  /** La frase va en dos partes: el remate con el degradado */
  frase: "Sigo aprendiendo para mejorar lo que sé, y",
  fraseRemate: "cada día sumo algo nuevo.",
};

export const TEXTOS_PROYECTOS = {
  titulo: "Proyectos",
  cuenta: (cantidad: number) => `${cantidad} ${cantidad === 1 ? "proyecto publicado" : "proyectos publicados"}`,
  /** La frase va en dos partes: el remate con el degradado */
  frase: "Escucho ideas y las convierto en soluciones:",
  fraseRemate: "lo que sé está abierto a la tuya.",
  vacio: "Todavía no hay proyectos publicados.",
  paginas: "Páginas de proyectos",
  verProyecto: "Ver proyecto",
  verProyectoDe: (titulo: string) => `Ver proyecto: ${titulo}`,
  codigoDe: (repositorio: string) => `Código: ${repositorio}`,
  masTecnologias: (cantidad: number, nombres: string[]) => `${cantidad} tecnologías más: ${nombres.join(", ")}`,
  /** El panel */
  panel: "Proyecto",
  tecnologias: (cantidad: number) => `Tecnologías · ${cantidad}`,
  masFotos: (cantidad: number) => `Más fotos · ${cantidad}`,
  codigo: "Código",
  documentos: "Documentos",
  noExiste: "Este proyecto no existe o no está publicado.",
};

export const TEXTOS_CONTACTO = {
  titulo: "Contacto",
  cuenta: (cantidad: number) => `${cantidad} ${cantidad === 1 ? "forma" : "formas"} de contactarme`,
  escribime: "Escribime",
  seguime: "Seguime",
  abiertoA: "Abierto a",
  /** El nombre de cada forma, en la fila de su ficha */
  correo: "Correo",
  whatsapp: "WhatsApp",
  llamada: "Llamada",
  videollamada: "Videollamada",
  agendaValor: "Agendá un horario",
  agendaDetalle: "Elegí el día y la hora en mi agenda.",
  /** Lo que hace el botón de cada una */
  escribir: "Escribir",
  abrirWhatsapp: "Abrir WhatsApp",
  llamar: "Llamar",
  agendar: "Agendar",
  abrirPerfil: "Abrir perfil",
  copiar: "Copiar",
  copiado: "Copiado",
  noSeCopio: "No se pudo copiar",
};

/** Lo que comparten los paneles que se abren encima de una página */
export const TEXTOS_PANEL = {
  cerrar: "Cerrar",
};

/** Falta el dato definitivo */
const COMMITS = "X";
/** Repositorios públicos de GitHub, contados a mano */
const REPOSITORIOS = "23";
const SIN_DATO = "—";

/** Años enteros desde el primer trabajo cargado. Sin trabajos, null. */
export function aniosDeExperiencia(experiencia: Pick<Experiencia, "desde">[], hoy = new Date()): number | null {
  const [primero] = experiencia.map(({ desde }) => desde).sort();
  if (!primero) return null;

  const [anio, mes] = primero.split("-").map(Number) as [number, number];
  return Math.floor(((hoy.getFullYear() - anio) * 12 + hoy.getMonth() + 1 - mes) / 12);
}

/** Mientras no llegan los datos, o si faltan, muestra una raya en lugar de un número inventado */
export function armarEstadisticas(
  perfil?: Pick<Perfil, "habilidades">,
  experiencia: Pick<Experiencia, "desde">[] = [],
  hoy?: Date,
): Estadistica[] {
  const anios = aniosDeExperiencia(experiencia, hoy);

  return [
    { valor: anios ? `${anios}+` : SIN_DATO, etiqueta: "Años de experiencia", icono: Award, tono: "info" },
    { valor: COMMITS, etiqueta: "Commits hechos", icono: GitCommitHorizontal, tono: "exito" },
    { valor: REPOSITORIOS, etiqueta: "Repositorios", icono: FolderGit2, tono: "aviso" },
    {
      valor: perfil ? String(perfil.habilidades.length) : SIN_DATO,
      etiqueta: "Tecnologías",
      icono: CodeXml,
      tono: "rosa",
    },
  ];
}
