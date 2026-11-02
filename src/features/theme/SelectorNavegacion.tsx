import type { ReactNode } from "react";
import { BriefcaseBusiness, FolderKanban, LayoutDashboard, Newspaper, Palette } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { cn } from "@/lib/cn";
import { TarjetaEleccion } from "./TarjetaEleccion";
import { setNavegacion } from "./themeSlice";
import type { EstiloNavegacion } from "./themeTypes";

/** Pantalla en miniatura: muestra en qué parte de la app queda la navegación */
function Miniatura({ arriba = false, children }: { arriba?: boolean; children: ReactNode }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-28 justify-center overflow-hidden rounded-boton bg-superficie p-3",
        arriba ? "items-start" : "items-end",
      )}
    >
      {children}
    </div>
  );
}

function EjemploDock() {
  return (
    <Miniatura>
      <div className="flex items-center gap-1 rounded-full border border-borde bg-fondo p-1 shadow-flotante">
        <span className="flex items-center gap-1 rounded-full bg-primario px-2 py-1 text-[0.625rem] font-medium text-primario-texto">
          <LayoutDashboard className="size-3" />
          Inicio
        </span>
        {[FolderKanban, Newspaper, BriefcaseBusiness, Palette].map((Icono, i) => (
          <span key={i} className="grid size-5 place-items-center text-texto-suave">
            <Icono className="size-3" />
          </span>
        ))}
      </div>
    </Miniatura>
  );
}

function EjemploCapsula() {
  return (
    <Miniatura>
      <div className="flex items-center rounded-full border border-borde bg-superficie p-1 text-[0.625rem] font-medium whitespace-nowrap shadow-flotante">
        <span className="rounded-full bg-primario px-2 py-1 text-primario-texto">Inicio</span>
        <span className="px-1.5 text-texto-suave">Proyectos</span>
        <span className="px-1.5 text-texto-suave">Blog</span>
      </div>
    </Miniatura>
  );
}

function EjemploTabs() {
  return (
    <Miniatura arriba>
      <div className="flex w-full gap-3 border-b border-borde text-[0.625rem] font-medium whitespace-nowrap text-texto-suave">
        <span className="-mb-px flex items-center gap-1 border-b-2 border-primario pb-1.5 text-secundario">
          <LayoutDashboard className="size-3" />
          Inicio
        </span>
        <span className="flex items-center gap-1 pb-1.5">
          <FolderKanban className="size-3" />
          Proyectos
        </span>
      </div>
    </Miniatura>
  );
}

const OPCIONES: { id: EstiloNavegacion; nombre: string; descripcion: string; ejemplo: ReactNode }[] = [
  {
    id: "dock",
    nombre: "Dock",
    descripcion: "Iconos flotantes al pie. La sección actual muestra su nombre.",
    ejemplo: <EjemploDock />,
  },
  {
    id: "capsula",
    nombre: "Cápsula",
    descripcion: "Barra flotante al pie, con todos los nombres a la vista.",
    ejemplo: <EjemploCapsula />,
  },
  {
    id: "tabs",
    nombre: "Tabs arriba",
    descripcion: "Pestañas fijas debajo del encabezado.",
    ejemplo: <EjemploTabs />,
  },
];

/** Elegir el estilo de navegación del panel: siempre hay uno elegido y se aplica al instante. */
export function SelectorNavegacion() {
  const dispatch = useAppDispatch();
  const navegacion = useAppSelector((state) => state.theme.navegacion);

  return (
    <fieldset className="space-y-4">
      <div>
        <legend className="font-subtitulo text-lg font-semibold text-texto">Navegación</legend>
        <p className="mt-1 text-sm text-texto-suave">Elegí cómo te movés por el panel. Se aplica al instante.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {OPCIONES.map(({ id, nombre, descripcion, ejemplo }) => (
          <TarjetaEleccion
            key={id}
            grupo="navegacion"
            valor={id}
            elegida={navegacion === id}
            onElegir={() => dispatch(setNavegacion(id))}
            nombre={nombre}
            descripcion={descripcion}
          >
            {ejemplo}
          </TarjetaEleccion>
        ))}
      </div>
    </fieldset>
  );
}
