import { Portafolio } from "@/features/portafolio/Portafolio";
import type { Vista } from "@/vistas/types";
import celular from "./capturas/celular.webp";
import escritorio from "./capturas/escritorio.webp";
import { Encabezado } from "./Encabezado";
import { tema } from "./tema";

function Miniatura() {
  return (
    <div aria-hidden className="h-28 space-y-2 overflow-hidden rounded-boton bg-superficie p-3">
      {["w-1/2", "w-full", "w-5/6", "w-full", "w-3/4"].map((ancho, i) => (
        <div key={i} className={`h-1.5 rounded-full bg-borde ${ancho}`} />
      ))}
    </div>
  );
}

/** La primera vista: el contenido del portafolio como texto, sin diseño */
export const basica: Vista = {
  id: "basica",
  nombre: "Básica",
  descripcion: "Tu contenido como texto, sin diseño.",
  Miniatura,
  capturas: { escritorio, celular },
  tema,
  Encabezado,
  Pagina: Portafolio,
};
