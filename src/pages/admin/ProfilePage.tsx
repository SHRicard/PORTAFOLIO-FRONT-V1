import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetMeQuery, useUpdateMeMutation } from "@/features/auth/authApi";
import { profileSchema, SEXOS, SEXO_LABELS, type ProfileFormValues } from "@/features/auth/schemas";
import { getErrorMessage } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Subtitle, Title } from "@/components/ui/Typography";

const FIELDS = ["nombre", "apellido", "telefono", "pais", "correo", "sexo"] as const;

export default function ProfilePage() {
  const { data: user } = useGetMeQuery();
  const [updateMe, { isLoading }] = useUpdateMeMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // El formulario se rellena (y se vuelve a rellenar) con el perfil que viene de la API
  const values = useMemo<ProfileFormValues | undefined>(
    () =>
      user && {
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        pais: user.pais,
        correo: user.correo,
        sexo: user.sexo,
      },
    [user],
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({ resolver: zodResolver(profileSchema), values });

  async function onSubmit(data: ProfileFormValues) {
    setFormError(null);
    setSaved(false);
    try {
      await updateMe(data).unwrap();
      setSaved(true);
    } catch (error) {
      if (!applyServerFieldErrors(error, setError, FIELDS)) {
        setFormError(getErrorMessage(error));
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Title>Perfil</Title>
        <Subtitle className="mt-1 text-base">Actualizá tus datos personales.</Subtitle>
      </div>

      <Card>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && <Alert tipo="error">{formError}</Alert>}
          {saved && !isDirty && <Alert>Perfil actualizado.</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="nombre" error={errors.nombre?.message}>
              <Input id="nombre" invalid={!!errors.nombre} {...register("nombre")} />
            </Field>
            <Field label="Apellido" htmlFor="apellido" error={errors.apellido?.message}>
              <Input id="apellido" invalid={!!errors.apellido} {...register("apellido")} />
            </Field>
          </div>

          <Field label="Correo electrónico" htmlFor="correo" error={errors.correo?.message}>
            <Input id="correo" type="email" invalid={!!errors.correo} {...register("correo")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Teléfono" htmlFor="telefono" error={errors.telefono?.message}>
              <Input id="telefono" type="tel" invalid={!!errors.telefono} {...register("telefono")} />
            </Field>
            <Field label="País" htmlFor="pais" error={errors.pais?.message}>
              <Input id="pais" invalid={!!errors.pais} {...register("pais")} />
            </Field>
          </div>

          <Field label="Sexo" htmlFor="sexo" error={errors.sexo?.message}>
            <Select id="sexo" invalid={!!errors.sexo} {...register("sexo")}>
              {SEXOS.map((s) => (
                <option key={s} value={s}>
                  {SEXO_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>

          <Button type="submit" cargando={isLoading} disabled={!isDirty}>
            Guardar cambios
          </Button>
        </form>
      </Card>
    </div>
  );
}
