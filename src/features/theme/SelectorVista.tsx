import { Alert } from "@/components/ui/Alert";
import { useElegirVistaMutation, useGetPerfilAdminQuery } from "@/features/perfil/perfilApi";
import { getErrorMessage } from "@/lib/errors";
import { VISTAS } from "@/vistas";
import { varsDeVista } from "@/vistas/useTemaVista";
import { defaultVistaWeb } from "./defaultTheme";
import { estiloDeTema } from "./estiloDeTema";
import { TarjetaEleccion } from "./TarjetaEleccion";

/**
 * Elegir el diseño de la web pública: cada uno es una carpeta de src/vistas/. Se guarda en el
 * perfil (`PATCH /perfil`), así que lo ven todos los visitantes. Se manda la id, nunca el nombre
 */
export function SelectorVista() {
  const { data: perfil, error: errorPerfil } = useGetPerfilAdminQuery();
  const [elegirVista, { isLoading: guardando, error }] = useElegirVistaMutation();
  const sinPerfil = errorPerfil != null && "status" in errorPerfil && errorPerfil.status === 404;
  const elegida = perfil?.vista ?? defaultVistaWeb;

  return (
    // Deshabilitado mientras carga el perfil, mientras se guarda y si todavía no se creó (el PATCH daría 404)
    <fieldset className="space-y-4" disabled={!perfil || guardando}>
      <div>
        <legend className="font-subtitulo text-lg font-semibold text-texto">Vista web pública</legend>
        <p className="mt-1 text-sm text-texto-suave">Elegí el diseño de tu portafolio. Lo ven todos los visitantes.</p>
      </div>

      {sinPerfil && <Alert>Primero cargá el perfil: la vista se guarda en él.</Alert>}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}

      <div className="grid gap-4 md:grid-cols-3">
        {VISTAS.map((vista) => (
          <TarjetaEleccion
            key={vista.id}
            grupo="vista-web"
            valor={vista.id}
            elegida={elegida === vista.id}
            onElegir={() => elegirVista(vista.id)}
            nombre={vista.nombre}
            descripcion={vista.descripcion}
          >
            {/* La muestra con los colores de SU portafolio, no con los del panel */}
            <div className="tema" style={estiloDeTema(varsDeVista(vista))}>
              <vista.Miniatura />
            </div>
          </TarjetaEleccion>
        ))}
      </div>
    </fieldset>
  );
}
