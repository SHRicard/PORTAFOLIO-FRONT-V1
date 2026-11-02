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
