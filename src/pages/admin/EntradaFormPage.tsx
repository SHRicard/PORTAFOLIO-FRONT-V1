import { useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { EntradaForm } from "@/features/blog/EntradaForm";
import {
  useActualizarEntradaMutation,
  useCrearEntradaMutation,
  useGetEntradaAdminQuery,
} from "@/features/blog/blogApi";
import { aEntradaInput, campoFormulario, type EntradaFormValues } from "@/features/blog/schemas";
import { getErrorDetail, getErrorMessage } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

/** Crea una entrada (/admin/blog/nuevo) o edita una existente (/admin/blog/:id) */
export default function EntradaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: entrada, isLoading, error } = useGetEntradaAdminQuery(id ?? "", { skip: !id });
  const [crear, creando] = useCrearEntradaMutation();
  const [actualizar, actualizando] = useActualizarEntradaMutation();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function guardar(valores: EntradaFormValues, setError: UseFormSetError<EntradaFormValues>) {
    setErrorGeneral(null);
    const datos = aEntradaInput(valores);
    try {
      if (id) await actualizar({ id, cambios: datos }).unwrap();
      else await crear(datos).unwrap();
      navigate("/admin/blog");
    } catch (err) {
      if (!applyServerFieldErrors(err, setError, campoFormulario)) setErrorGeneral(getErrorDetail(err));
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link to="/admin/blog" className="inline-flex items-center gap-1 text-sm text-texto-suave hover:text-texto">
          <ArrowLeft className="size-4" aria-hidden />
          Volver al blog
        </Link>
        <Title className="mt-2">{id ? "Editar entrada" : "Nueva entrada"}</Title>
        <Subtitle className="mt-1 text-base">
          {id ? entrada?.titulo : "Las entradas nuevas arrancan en borrador: elegí Publicada cuando esté lista."}
        </Subtitle>
      </div>

      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {id && isLoading && <Spinner />}

      {(!id || entrada) && (
        <EntradaForm
          entrada={entrada}
          guardando={creando.isLoading || actualizando.isLoading}
          errorGeneral={errorGeneral}
          textoGuardar={id ? "Guardar cambios" : "Crear entrada"}
          onGuardar={guardar}
        />
      )}
    </div>
  );
}
