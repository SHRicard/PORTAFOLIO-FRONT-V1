import {
  Award,
  Briefcase,
  Bug,
  Calendar,
  Dumbbell,
  GraduationCap,
  Languages,
  Leaf,
  Lightbulb,
  type LucideIcon,
  Rocket,
  School,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { estadoEstudio, MODALIDAD, parrafos, TIPO_ESTUDIO } from "@/features/portafolio/formato";
import type { Estudio, Experiencia, FechaMes, Perfil } from "@/features/portafolio/types";
import type { TonoEstadistica } from "@/vistas/rr-dev/contenido";

export type DatoCurioso = Perfil["datosCuriosos"][number];

/** Un trabajo o un estudio de la trayectoria, con lo que muestra la línea de tiempo del panel */
export interface PasoTrayectoria {
  id: string;
  titulo: string;
  /** La empresa o la institución */
  lugar: string;
  desde: FechaMes;
  hasta: FechaMes | null;
  /** Modalidad y ubicación de un trabajo; tipo y estado de un estudio */
  pildoras: string[];
  parrafos: string[];
  logros: string[];
  tecnologias: string[];
  icono: LucideIcon;
  tono: TonoEstadistica;
}

/** Los datos curiosos de cada costado: cinco en la constelación de cerca y tres en la lejana */
export const DATOS_CERCA = 5;
export const DATOS_LEJOS = 3;

/**
 * Los datos de un tipo repartidos entre las dos constelaciones de su costado. Llegan del backend del
 * más nuevo al más viejo: los más nuevos van cerca y los que siguen, los más viejos, en la lejana.
 * Con cinco o menos no hay constelación lejana; lo que pase de ocho no se ve en los costados
 */
export function repartirDatos(datos: DatoCurioso[], tipo: DatoCurioso["tipo"]) {
  const delTipo = datos.filter((dato) => dato.tipo === tipo);
  return { cerca: delTipo.slice(0, DATOS_CERCA), lejos: delTipo.slice(DATOS_CERCA, DATOS_CERCA + DATOS_LEJOS) };
}

/** Los colores de los íconos, en orden, de arriba a abajo en cada costado: los de StatsBar */
export const TONOS_DATOS: TonoEstadistica[] = ["info", "exito", "aviso", "rosa", "info"];

/**
 * El ícono de cada dato curioso. El backend no guarda íconos: van por el título que tiene cada dato
 * en el panel. Uno con otro título lleva el de su tipo
 */
const ICONOS_DATO: Record<string, LucideIcon> = {
  "usuarios en rest911": Users,
  "roles de permisos": ShieldCheck,
  "en docmovi desde": Calendar,
  "migrando apps a": Smartphone,
  aprendiendo: GraduationCap,
  "en mi tiempo libre": Rocket,
  investigando: Bug,
  "siempre pensando": Lightbulb,
  "mate por día": Leaf,
  gimnasio: Dumbbell,
};

export function iconoDato({ titulo, tipo }: Pick<DatoCurioso, "titulo" | "tipo">): LucideIcon {
  return ICONOS_DATO[titulo.trim().toLocaleLowerCase("es")] ?? (tipo === "profesional" ? Briefcase : Sparkles);
}

const ICONO_ESTUDIO: Record<Estudio["tipo"], { icono: LucideIcon; tono: TonoEstadistica }> = {
  carrera: { icono: School, tono: "aviso" },
  curso: { icono: GraduationCap, tono: "exito" },
  certificacion: { icono: Award, tono: "exito" },
};

/** Del que empezó más tarde al más viejo */
const masNuevoPrimero = (a: PasoTrayectoria, b: PasoTrayectoria) => b.desde.localeCompare(a.desde);

/** Los trabajos, del que empezó más tarde al más viejo, con lo que muestra la línea de tiempo */
export function trabajosDe(experiencia: Experiencia[]): PasoTrayectoria[] {
  return experiencia
    .map<PasoTrayectoria>((trabajo) => ({
      id: trabajo.id,
      titulo: trabajo.puesto,
      lugar: trabajo.empresa,
      desde: trabajo.desde,
      hasta: trabajo.hasta,
      pildoras: [MODALIDAD[trabajo.modalidad], trabajo.ubicacion].filter(Boolean),
      parrafos: parrafos(trabajo.descripcion),
      logros: trabajo.logros,
      tecnologias: trabajo.tecnologias,
      icono: Briefcase,
      tono: "info",
    }))
    .sort(masNuevoPrimero);
}

/** Los estudios, del que empezó más tarde al más viejo: su tipo y si se terminó van en las píldoras */
export function estudiosDe(estudios: Estudio[]): PasoTrayectoria[] {
  return estudios
    .map<PasoTrayectoria>((estudio) => ({
      id: estudio.id,
      titulo: estudio.titulo,
      lugar: estudio.institucion,
      desde: estudio.desde,
      hasta: estudio.hasta,
      pildoras: [TIPO_ESTUDIO[estudio.tipo], estadoEstudio(estudio)],
      parrafos: parrafos(estudio.descripcion),
      logros: [],
      tecnologias: [],
      ...ICONO_ESTUDIO[estudio.tipo],
    }))
    .sort(masNuevoPrimero);
}

/** Las tres listas de la barra de Sobre mí, que se abren en el panel */
export type CategoriaTrayectoria = "trabajos" | "estudios" | "idiomas";

export interface Trayectoria {
  trabajos: PasoTrayectoria[];
  estudios: PasoTrayectoria[];
  idiomas: Perfil["idiomas"];
}

/** En este orden van en la barra y en las pestañas del panel, cada una con su ícono y su color */
export const CATEGORIAS_TRAYECTORIA: { id: CategoriaTrayectoria; icono: LucideIcon; tono: TonoEstadistica }[] = [
  { id: "trabajos", icono: Briefcase, tono: "info" },
  { id: "estudios", icono: GraduationCap, tono: "exito" },
  { id: "idiomas", icono: Languages, tono: "rosa" },
];

/** Las listas que tienen algo: las vacías no van ni en la barra ni en el panel */
export function categoriasCon(trayectoria: Trayectoria) {
  return CATEGORIAS_TRAYECTORIA.filter(({ id }) => trayectoria[id].length > 0);
}
