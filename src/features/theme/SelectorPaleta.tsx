import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { APELLIDO, NOMBRE } from "@/lib/identidad";
import { PALETAS, type ColoresPaleta } from "./paletas";
import { TarjetaEleccion } from "./TarjetaEleccion";
import { setPaleta } from "./themeSlice";

/**
 * Muestra de una paleta. Usa sus propios colores y no los tokens del tema: tiene que verse
 * como esa paleta aunque la elegida sea otra.
 */
function MuestraPaleta({ colores }: { colores: ColoresPaleta }) {
  const tonos = [
    { nombre: "Fondo", color: colores.fondo },
    { nombre: "Acento", color: colores.primario },
    { nombre: "Texto", color: colores.texto },
    { nombre: "Texto secundario", color: colores.textoSuave },
  ];

  return (
    <div
      aria-hidden
      className="space-y-3 rounded-boton border p-4"
      style={{ backgroundColor: colores.fondo, borderColor: colores.borde }}
    >
      <div>
        <p className="text-lg font-bold" style={{ color: colores.texto }}>
          {NOMBRE} <span style={{ color: colores.secundario }}>{APELLIDO}</span>
        </p>
        <p className="text-xs" style={{ color: colores.textoSuave }}>
          Así se ve el texto secundario
        </p>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {tonos.map(({ nombre, color }) => (
          <span key={nombre} className="flex items-center gap-1 text-[0.625rem]" style={{ color: colores.textoSuave }}>
            <span
              className="size-3 rounded-full border"
              style={{ backgroundColor: color, borderColor: colores.borde }}
            />
            {nombre}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Elegir el pack de colores del panel: siempre hay uno elegido y cambia el panel al instante. La web pública tiene los suyos */
export function SelectorPaleta() {
  const dispatch = useAppDispatch();
  const paleta = useAppSelector((state) => state.theme.paleta);

  return (
    <fieldset className="space-y-4">
      <div>
        <legend className="font-subtitulo text-lg font-semibold text-texto">Colores del panel</legend>
        <p className="mt-1 text-sm text-texto-suave">
          Elegí un pack de colores para el panel. Tus portafolios tienen los suyos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PALETAS.map(({ id, nombre, descripcion, colores }) => (
          <TarjetaEleccion
            key={id}
            grupo="paleta"
            valor={id}
            elegida={paleta === id}
            onElegir={() => dispatch(setPaleta(id))}
            nombre={nombre}
            descripcion={descripcion}
          >
            <MuestraPaleta colores={colores} />
          </TarjetaEleccion>
        ))}
      </div>
    </fieldset>
  );
}
