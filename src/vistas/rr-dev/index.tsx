import { IslandNavbar } from "@/vistas/rr-dev/components/organisms/IslandNavbar";
import { SpaceScene } from "@/vistas/rr-dev/components/organisms/SpaceScene";
import BlogPage from "@/vistas/rr-dev/pages/BlogPage";
import ContactoPage from "@/vistas/rr-dev/pages/ContactoPage";
import HabilidadesPage from "@/vistas/rr-dev/pages/HabilidadesPage";
import InicioPage from "@/vistas/rr-dev/pages/InicioPage";
import ProyectosPage from "@/vistas/rr-dev/pages/ProyectosPage";
import SobreMiPage from "@/vistas/rr-dev/pages/SobreMiPage";
import type { Vista } from "@/vistas/types";
import "./estilos.css";

function Miniatura() {
  return (
    <div aria-hidden className="h-28 space-y-3 overflow-hidden rounded-boton bg-fondo p-2">
      <div className="flex items-center gap-1.5 rounded-lg border border-borde bg-superficie px-2 py-1.5">
        <div className="h-1.5 w-8 rounded-full bg-secundario" />
        <div className="ml-auto h-1.5 w-3 rounded-full bg-borde" />
        <div className="h-1.5 w-3 rounded-full bg-borde" />
        <div className="h-1.5 w-3 rounded-full bg-borde" />
      </div>
      {["w-1/2", "w-full", "w-5/6"].map((ancho, i) => (
        <div key={i} className={`mx-1 h-1.5 rounded-full bg-borde ${ancho}`} />
      ))}
    </div>
  );
}

/** El primer diseño del portafolio, traído del proyecto RR-DEV */
export const rrDev: Vista = {
  id: "rr-dev",
  nombre: "RR-DEV",
  descripcion: "Mi primer diseño, con la isla flotante de navegación.",
  Miniatura,
  Encabezado: IslandNavbar,
  // El espacio con el sol y los planetas: la cámara viaja de un apartado al otro
  Fondo: SpaceScene,
  Pagina: InicioPage,
  paginas: [
    { ruta: "sobre-mi", Pagina: SobreMiPage },
    { ruta: "habilidades", Pagina: HabilidadesPage },
    { ruta: "proyectos", Pagina: ProyectosPage },
    { ruta: "contacto", Pagina: ContactoPage },
    // En lugar de la lista del blog: sus publicaciones tapaban el espacio
    { ruta: "blog", Pagina: BlogPage },
  ],
};
