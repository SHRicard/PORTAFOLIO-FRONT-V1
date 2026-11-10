import { IslandNavbar } from "@/vistas/rr-dev/components/organisms/IslandNavbar";
import { SpaceScene } from "@/vistas/rr-dev/components/organisms/SpaceScene";
import BlogPage from "@/vistas/rr-dev/pages/BlogPage";
import ContactoPage from "@/vistas/rr-dev/pages/ContactoPage";
import HabilidadesPage from "@/vistas/rr-dev/pages/HabilidadesPage";
import InicioPage from "@/vistas/rr-dev/pages/InicioPage";
import ProyectosPage from "@/vistas/rr-dev/pages/ProyectosPage";
import SobreMiPage from "@/vistas/rr-dev/pages/SobreMiPage";
import type { Vista } from "@/vistas/types";
import celular from "./capturas/celular.webp";
import { tema } from "./tema";
import escritorio from "./capturas/escritorio.webp";
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

/** El primer diseño del portafolio, mi.universo, traído del proyecto RR-DEV */
export const rrDev: Vista = {
  id: "rr-dev",
  nombre: "mi.universo",
  descripcion: "Mi primer diseño, con la isla flotante de navegación.",
  Miniatura,
  capturas: { escritorio, celular },
  tema,
  Encabezado: IslandNavbar,
  // El espacio con el sol y los planetas: la cámara viaja de un apartado al otro
  Fondo: SpaceScene,
  Pagina: InicioPage,
  paginas: [
    { ruta: "sobre-mi", Pagina: SobreMiPage },
    { ruta: "habilidades", Pagina: HabilidadesPage },
    { ruta: "proyectos", Pagina: ProyectosPage },
    // Un proyecto se ve en su panel, encima de Proyectos: /proyectos/:slug muestra la lista con él abierto
    // (es a donde lleva «Ver en la web» del panel de administración)
    { ruta: "proyectos/:slug", Pagina: ProyectosPage },
    { ruta: "contacto", Pagina: ContactoPage },
    // El blog como la constelación de Inicio, sin scroll. Una publicación se abre en un panel
    // encima: /blog/:slug muestra el mismo blog con ella abierta
    { ruta: "blog", Pagina: BlogPage },
    { ruta: "blog/:slug", Pagina: BlogPage },
  ],
};
