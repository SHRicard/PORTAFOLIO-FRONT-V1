import { useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ExperienciaForm } from "@/features/experiencia/ExperienciaForm";
import {
  useActualizarExperienciaMutation,
  useCrearExperienciaMutation,
  useGetExperienciaAdminQuery,
} from "@/features/experiencia/experienciaApi";
import { aExperienciaInput, CAMPOS, type ExperienciaFormValues } from "@/features/experiencia/schemas";
import { getErrorDetail, getErrorMessage } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { Alert } from "@/components/ui/Alert";
import { buttonVariants } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Agrega un trabajo (/admin/experiencia/nuevo) o edita uno (/admin/experiencia/:id). El backend no tiene un
 * endpoint para pedir uno solo: sale de la lista del panel, que ya está en caché si se viene de ahí
 */
export default function ExperienciaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lista, isLoading, error } = useGetExperienciaAdminQuery(undefined, { skip: !id });
  const [crear, creando] = useCrearExperienciaMutation();
  const [actualizar, actualizando] = useActualizarExperienciaMutation();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const experiencia = id ? lista?.find((trabajo) => trabajo.id === id) : undefined;
  const noExiste = Boolean(id && lista && !experiencia);

  async function guardar(valores: ExperienciaFormValues, setError: UseFormSetError<ExperienciaFormValues>) {
    setErrorGeneral(null);
    const datos = aExperienciaInput(valores);
    try {
      if (id) await actualizar({ id, cambios: datos }).unwrap();
      else await crear(datos).unwrap();
      navigate("/admin/experiencia");
    } catch (err) {
      if (!applyServerFieldErrors(err, setError, CAMPOS)) setErrorGeneral(getErrorDetail(err));
    }
  }

  return (
    <div className="space-y-4">
      {/* Sin formulario (no se pudo cargar o el trabajo no existe), «Volver» queda solo, debajo del aviso */}
      {(error || noExiste) && (
        <div className="space-y-4">
          <Alert tipo="error">
            {error ? getErrorMessage(error) : "Ese trabajo no existe: puede que lo hayas borrado."}
          </Alert>
          <Link to="/admin/experiencia" className={buttonVariants({ estilo: "peligro" })}>
            <ArrowLeft className="size-4" aria-hidden />
            Volver a experiencia
          </Link>
        </div>
      )}
      {id && isLoading && <Spinner />}

      {(!id || experiencia) && (
        <ExperienciaForm
          experiencia={experiencia}
          guardando={creando.isLoading || actualizando.isLoading}
          errorGeneral={errorGeneral}
          textoGuardar={id ? "Guardar cambios" : "Agregar trabajo"}
          onGuardar={guardar}
          volverA="/admin/experiencia"
        />
      )}
    </div>
  );
}
