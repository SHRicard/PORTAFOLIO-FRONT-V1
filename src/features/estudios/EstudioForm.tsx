import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampoArchivo } from "@/features/archivos/CampoArchivo";
import { TIPO_ESTUDIO } from "@/features/portafolio/formato";
import { getErrorDetail } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Casilla } from "@/components/ui/Casilla";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useActualizarEstudioMutation, useCrearEstudioMutation } from "./estudiosApi";
import {
  aEstudioInput,
  aFormulario,
  ESTUDIO_VACIO,
  estudioSchema,
  TIPOS_ESTUDIO,
  type EstudioFormValues,
} from "./schemas";
import type { Estudio } from "./types";

const CAMPOS = ["tipo", "institucion", "titulo", "desde", "hasta", "descripcion", "urlVerificacion"] as const;

interface EstudioFormProps {
  /** Sin estudio: formulario para agregar uno nuevo */
  estudio?: Estudio;
  onListo: () => void;
}

export function EstudioForm({ estudio, onListo }: EstudioFormProps) {
  const [crear, creando] = useCrearEstudioMutation();
  const [actualizar, actualizando] = useActualizarEstudioMutation();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const values = useMemo(() => (estudio ? aFormulario(estudio) : undefined), [estudio]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EstudioFormValues>({ resolver: zodResolver(estudioSchema), defaultValues: ESTUDIO_VACIO, values });

  async function guardar(valores: EstudioFormValues) {
    setErrorGeneral(null);
    const datos = aEstudioInput(valores);
    try {
      if (estudio) await actualizar({ id: estudio.id, cambios: datos }).unwrap();
      else await crear(datos).unwrap();
      onListo();
    } catch (err) {
      if (!applyServerFieldErrors(err, setError, CAMPOS)) setErrorGeneral(getErrorDetail(err));
    }
  }

  return (
    <Card>
      <form noValidate onSubmit={handleSubmit(guardar)} className="space-y-4">
        <h2 className="font-subtitulo text-lg font-semibold text-texto">{estudio ? "Editar estudio" : "Nuevo estudio"}</h2>
        {errorGeneral && <Alert tipo="error">{errorGeneral}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título" htmlFor="titulo" error={errors.titulo?.message}>
            <Input id="titulo" invalid={!!errors.titulo} {...register("titulo")} />
          </Field>
          <Field label="Institución" htmlFor="institucion" error={errors.institucion?.message}>
            <Input id="institucion" invalid={!!errors.institucion} {...register("institucion")} />
          </Field>
          <Field label="Tipo" htmlFor="tipo" error={errors.tipo?.message}>
            <Select id="tipo" invalid={!!errors.tipo} {...register("tipo")}>
              {TIPOS_ESTUDIO.map((t) => (
                <option key={t} value={t}>
                  {TIPO_ESTUDIO[t]}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end pb-2">
            <Casilla label="Finalizado" {...register("finalizado")} />
          </div>
          <Field label="Desde" htmlFor="desde" error={errors.desde?.message}>
            <Input id="desde" type="month" invalid={!!errors.desde} {...register("desde")} />
          </Field>
          <Field label="Hasta (vacío = en curso)" htmlFor="hasta" error={errors.hasta?.message}>
            <Input id="hasta" type="month" invalid={!!errors.hasta} {...register("hasta")} />
          </Field>
        </div>

        <p className="text-sm text-texto-suave">
          Con fecha de fin y sin tildar &quot;Finalizado&quot;, se muestra como incompleto.
        </p>

        <Field
          label="Descripción (separá los párrafos con una línea en blanco)"
          htmlFor="descripcion"
          error={errors.descripcion?.message}
        >
          <Textarea id="descripcion" rows={6} invalid={!!errors.descripcion} {...register("descripcion")} />
        </Field>

        <Field label="Link de verificación" htmlFor="urlVerificacion" error={errors.urlVerificacion?.message}>
          <Input
            id="urlVerificacion"
            type="url"
            placeholder="https://..."
            invalid={!!errors.urlVerificacion}
            {...register("urlVerificacion")}
          />
        </Field>

        <Field label="Certificado (PDF)" htmlFor="certificadoUrl" error={errors.certificadoUrl?.message}>
          <Controller
            control={control}
            name="certificadoUrl"
            render={({ field }) => (
              <CampoArchivo
                id="certificadoUrl"
                tipo="documento"
                carpeta="estudios"
                valor={field.value}
                onCambio={field.onChange}
                invalid={!!errors.certificadoUrl}
              />
            )}
          />
        </Field>

        <Casilla label="Mostrar en la web (si la destildás, queda oculto y solo lo ves en el panel)" {...register("publicado")} />

        <div className="flex gap-2">
          <Button type="submit" cargando={creando.isLoading || actualizando.isLoading}>
            {estudio ? "Guardar cambios" : "Agregar estudio"}
          </Button>
          <Button estilo="texto" onClick={onListo}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
