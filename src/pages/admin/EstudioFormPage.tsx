import { useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { EstudioForm } from "@/features/estudios/EstudioForm";
import {
  useActualizarEstudioMutation,
  useCrearEstudioMutation,
  useGetEstudiosAdminQuery,
} from "@/features/estudios/estudiosApi";
import { aEstudioInput, CAMPOS, type EstudioFormValues } from "@/features/estudios/schemas";
import { getErrorDetail, getErrorMessage } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { Alert } from "@/components/ui/Alert";
import { buttonVariants } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Agrega un estudio (/admin/estudios/nuevo) o edita uno (/admin/estudios/:id). El backend no tiene un endpoint
 * para pedir uno solo: sale de la lista del panel, que ya está en caché si se viene de ahí
 */
export default function EstudioFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: lista, isLoading, error } = useGetEstudiosAdminQuery(undefined, { skip: !id });
  const [crear, creando] = useCrearEstudioMutation();
  const [actualizar, actualizando] = useActualizarEstudioMutation();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const estudio = id ? lista?.find((e) => e.id === id) : undefined;
  const noExiste = Boolean(id && lista && !estudio);

  async function guardar(valores: EstudioFormValues, setError: UseFormSetError<EstudioFormValues>) {
    setErrorGeneral(null);
    const datos = aEstudioInput(valores);
    try {
      if (id) await actualizar({ id, cambios: datos }).unwrap();
      else await crear(datos).unwrap();
      navigate("/admin/estudios");
    } catch (err) {
      if (!applyServerFieldErrors(err, setError, CAMPOS)) setErrorGeneral(getErrorDetail(err));
    }
  }

  return (
    <div className="space-y-4">
      {/* Sin formulario (no se pudo cargar o el estudio no existe), «Volver» queda solo, debajo del aviso */}
      {(error || noExiste) && (
        <div className="space-y-4">
          <Alert tipo="error">
            {error ? getErrorMessage(error) : "Ese estudio no existe: puede que lo hayas borrado."}
          </Alert>
          <Link to="/admin/estudios" className={buttonVariants({ estilo: "peligro" })}>
            <ArrowLeft className="size-4" aria-hidden />
            Volver a estudios
          </Link>
        </div>
      )}
      {id && isLoading && <Spinner />}

      {(!id || estudio) && (
        <EstudioForm
          estudio={estudio}
          guardando={creando.isLoading || actualizando.isLoading}
          errorGeneral={errorGeneral}
          textoGuardar={id ? "Guardar cambios" : "Agregar estudio"}
          onGuardar={guardar}
          volverA="/admin/estudios"
        />
      )}
    </div>
  );
}
