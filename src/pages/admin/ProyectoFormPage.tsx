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
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

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
      if (!applyServerFieldErrors(err, setError, campoFormulario)) setErrorGeneral(getErrorDetail(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/proyectos" className="inline-flex items-center gap-1 text-sm text-texto-suave hover:text-texto">
          <ArrowLeft className="size-4" aria-hidden />
          Volver a proyectos
        </Link>
        <Title className="mt-2">{id ? "Editar proyecto" : "Nuevo proyecto"}</Title>
        <Subtitle className="mt-1 text-base">
          {id ? proyecto?.titulo : "Los proyectos nuevos arrancan en borrador y van al final de la lista."}
        </Subtitle>
      </div>

      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {id && isLoading && <Spinner />}

      {(!id || proyecto) && (
        <ProyectoForm
          proyecto={proyecto}
          guardando={creando.isLoading || actualizando.isLoading}
          errorGeneral={errorGeneral}
          textoGuardar={id ? "Guardar cambios" : "Crear proyecto"}
          onGuardar={guardar}
        />
      )}
    </div>
  );
}
