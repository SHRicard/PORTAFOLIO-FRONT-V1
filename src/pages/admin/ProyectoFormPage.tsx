import { useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ProyectoForm } from "@/features/proyectos/ProyectoForm";
import {
  useActualizarProyectoMutation,
  useCrearProyectoMutation,
  useGetProyectoAdminQuery,
} from "@/features/proyectos/proyectosApi";
import { aProyectoInput, campoFormulario, type ProyectoFormValues } from "@/features/proyectos/schemas";
import { getErrorDetail, getErrorMessage } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { Alert } from "@/components/ui/Alert";
import { buttonVariants } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

/** Crea un proyecto (/admin/proyectos/nuevo) o edita uno existente (/admin/proyectos/:id) */
export default function ProyectoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: proyecto, isLoading, error } = useGetProyectoAdminQuery(id ?? "", { skip: !id });
  const [crear, creando] = useCrearProyectoMutation();
  const [actualizar, actualizando] = useActualizarProyectoMutation();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function guardar(valores: ProyectoFormValues, setError: UseFormSetError<ProyectoFormValues>) {
    setErrorGeneral(null);
    const datos = aProyectoInput(valores);
    try {
      if (id) await actualizar({ id, cambios: datos }).unwrap();
      else await crear(datos).unwrap();
      navigate("/admin/proyectos");
    } catch (err) {
      // Con portada en el formulario, galeria.0 de la API es la portada y las demás se corren un lugar
      const conPortada = Boolean(valores.portadaUrl || valores.portadaAlt);
      if (!applyServerFieldErrors(err, setError, (campo) => campoFormulario(campo, conPortada))) {
        setErrorGeneral(getErrorDetail(err));
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* El nombre, el estado, «Volver» y «Guardar» van en la barra del formulario */}
      {!id && (
        <p className="text-sm text-texto-suave">
          Los proyectos nuevos arrancan en borrador y van al final de la lista.
        </p>
      )}

      {/* Sin formulario (el proyecto no existe), «Volver» queda solo, debajo del error */}
      {error && (
        <div className="space-y-4">
          <Alert tipo="error">{getErrorMessage(error)}</Alert>
          <Link to="/admin/proyectos" className={buttonVariants({ estilo: "peligro" })}>
            <ArrowLeft className="size-4" aria-hidden />
            Volver a proyectos
          </Link>
        </div>
      )}
      {id && isLoading && <Spinner />}

      {(!id || proyecto) && (
        <ProyectoForm
          proyecto={proyecto}
          guardando={creando.isLoading || actualizando.isLoading}
          errorGeneral={errorGeneral}
          textoGuardar={id ? "Guardar cambios" : "Crear proyecto"}
          onGuardar={guardar}
          volverA="/admin/proyectos"
        />
      )}
    </div>
  );
}
