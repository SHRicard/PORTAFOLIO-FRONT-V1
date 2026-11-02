import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MODALIDAD } from "@/features/portafolio/formato";
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
import { useActualizarExperienciaMutation, useCrearExperienciaMutation } from "./experienciaApi";
import {
  aExperienciaInput,
  aFormulario,
  EXPERIENCIA_VACIA,
  experienciaSchema,
  MODALIDADES,
  type ExperienciaFormValues,
} from "./schemas";
import type { Experiencia } from "./types";

const CAMPOS = ["empresa", "puesto", "desde", "hasta", "ubicacion", "modalidad", "descripcion"] as const;

interface ExperienciaFormProps {
  /** Sin experiencia: formulario para agregar un trabajo nuevo */
  experiencia?: Experiencia;
  onListo: () => void;
}

export function ExperienciaForm({ experiencia, onListo }: ExperienciaFormProps) {
  const [crear, creando] = useCrearExperienciaMutation();
  const [actualizar, actualizando] = useActualizarExperienciaMutation();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const values = useMemo(() => (experiencia ? aFormulario(experiencia) : undefined), [experiencia]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ExperienciaFormValues>({
    resolver: zodResolver(experienciaSchema),
    defaultValues: EXPERIENCIA_VACIA,
    values,
  });

  async function guardar(valores: ExperienciaFormValues) {
    setErrorGeneral(null);
    const datos = aExperienciaInput(valores);
    try {
      if (experiencia) await actualizar({ id: experiencia.id, cambios: datos }).unwrap();
      else await crear(datos).unwrap();
      onListo();
    } catch (err) {
      if (!applyServerFieldErrors(err, setError, CAMPOS)) setErrorGeneral(getErrorDetail(err));
    }
  }

  return (
    <Card>
      <form noValidate onSubmit={handleSubmit(guardar)} className="space-y-4">
        <h2 className="font-subtitulo text-lg font-semibold text-texto">
          {experiencia ? "Editar trabajo" : "Nuevo trabajo"}
        </h2>
        {errorGeneral && <Alert tipo="error">{errorGeneral}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Empresa" htmlFor="empresa" error={errors.empresa?.message}>
            <Input id="empresa" invalid={!!errors.empresa} {...register("empresa")} />
          </Field>
          <Field label="Puesto" htmlFor="puesto" error={errors.puesto?.message}>
            <Input id="puesto" invalid={!!errors.puesto} {...register("puesto")} />
          </Field>
          <Field label="Desde" htmlFor="desde" error={errors.desde?.message}>
            <Input id="desde" type="month" invalid={!!errors.desde} {...register("desde")} />
          </Field>
          <Field label="Hasta (vacío = trabajo actual)" htmlFor="hasta" error={errors.hasta?.message}>
            <Input id="hasta" type="month" invalid={!!errors.hasta} {...register("hasta")} />
          </Field>
          <Field label="Ubicación" htmlFor="ubicacion" error={errors.ubicacion?.message}>
            <Input id="ubicacion" invalid={!!errors.ubicacion} {...register("ubicacion")} />
          </Field>
          <Field label="Modalidad" htmlFor="modalidad" error={errors.modalidad?.message}>
            <Select id="modalidad" invalid={!!errors.modalidad} {...register("modalidad")}>
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>
                  {MODALIDAD[m]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Descripción (separá los párrafos con una línea en blanco)"
          htmlFor="descripcion"
          error={errors.descripcion?.message}
        >
          <Textarea id="descripcion" rows={6} invalid={!!errors.descripcion} {...register("descripcion")} />
        </Field>
        <Field label="Logros (uno por línea)" htmlFor="logros" error={errors.logros?.message}>
          <Textarea id="logros" rows={6} invalid={!!errors.logros} {...register("logros")} />
        </Field>
        <Field label="Tecnologías (una por línea)" htmlFor="tecnologias" error={errors.tecnologias?.message}>
          <Textarea id="tecnologias" rows={6} invalid={!!errors.tecnologias} {...register("tecnologias")} />
        </Field>

        <Casilla label="Mostrar en la web (si la destildás, queda oculto y solo lo ves en el panel)" {...register("publicado")} />

        <div className="flex gap-2">
          <Button type="submit" cargando={creando.isLoading || actualizando.isLoading}>
            {experiencia ? "Guardar cambios" : "Agregar trabajo"}
          </Button>
          <Button estilo="texto" onClick={onListo}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
