import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { VISTAS } from "@/vistas";
import { TarjetaEleccion } from "./TarjetaEleccion";
import { setVistaWeb } from "./themeSlice";

/** Elegir el diseño de la web pública: cada uno es una carpeta de src/vistas/ y siempre hay uno elegido. */
export function SelectorVista() {
  const dispatch = useAppDispatch();
  const vistaWeb = useAppSelector((state) => state.theme.vistaWeb);

  return (
    <fieldset className="space-y-4">
      <div>
        <legend className="font-subtitulo text-lg font-semibold text-texto">Vista web pública</legend>
        <p className="mt-1 text-sm text-texto-suave">Elegí el diseño de tu portafolio.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {VISTAS.map(({ id, nombre, descripcion, Miniatura }) => (
          <TarjetaEleccion
            key={id}
            grupo="vista-web"
            valor={id}
            elegida={vistaWeb === id}
            onElegir={() => dispatch(setVistaWeb(id))}
            nombre={nombre}
            descripcion={descripcion}
          >
            <Miniatura />
          </TarjetaEleccion>
        ))}
      </div>
    </fieldset>
  );
}
