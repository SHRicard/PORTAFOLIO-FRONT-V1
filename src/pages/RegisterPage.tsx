import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "@/features/auth/authApi";
import { registerSchema, SEXOS, SEXO_LABELS, type RegisterFormValues } from "@/features/auth/schemas";
import { getErrorMessage } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Subtitle, Title } from "@/components/ui/Typography";

const FIELDS = ["nombre", "apellido", "telefono", "pais", "correo", "sexo", "password"] as const;

export default function RegisterPage() {
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), defaultValues: { sexo: undefined } });

  async function onSubmit({ confirmarPassword, ...input }: RegisterFormValues) {
    void confirmarPassword; // solo sirve para validar en el formulario, no se envía
    setFormError(null);
    try {
      // Si sale bien, GuestRoute detecta el token y redirige solo.
      await registerUser(input).unwrap();
    } catch (error) {
      if (!applyServerFieldErrors(error, setError, FIELDS)) {
        setFormError(getErrorMessage(error));
      }
    }
  }

  return (
    <>
      <Title>Crear cuenta</Title>
      <Subtitle className="mt-1 text-base">Completá tus datos</Subtitle>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {formError && <Alert tipo="error">{formError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" htmlFor="nombre" error={errors.nombre?.message}>
            <Input id="nombre" autoComplete="given-name" invalid={!!errors.nombre} {...register("nombre")} />
          </Field>
          <Field label="Apellido" htmlFor="apellido" error={errors.apellido?.message}>
            <Input id="apellido" autoComplete="family-name" invalid={!!errors.apellido} {...register("apellido")} />
          </Field>
        </div>

        <Field label="Correo electrónico" htmlFor="correo" error={errors.correo?.message}>
          <Input id="correo" type="email" autoComplete="email" invalid={!!errors.correo} {...register("correo")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono" htmlFor="telefono" error={errors.telefono?.message}>
            <Input id="telefono" type="tel" autoComplete="tel" invalid={!!errors.telefono} {...register("telefono")} />
          </Field>
          <Field label="País" htmlFor="pais" error={errors.pais?.message}>
            <Input id="pais" autoComplete="country-name" invalid={!!errors.pais} {...register("pais")} />
          </Field>
        </div>

        <Field label="Sexo" htmlFor="sexo" error={errors.sexo?.message}>
          <Select id="sexo" defaultValue="" invalid={!!errors.sexo} {...register("sexo")}>
            <option value="" disabled>
              Elegí una opción
            </option>
            {SEXOS.map((s) => (
              <option key={s} value={s}>
                {SEXO_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contraseña" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" invalid={!!errors.password} {...register("password")} />
          </Field>
          <Field label="Repetir contraseña" htmlFor="confirmarPassword" error={errors.confirmarPassword?.message}>
            <Input
              id="confirmarPassword"
              type="password"
              autoComplete="new-password"
              invalid={!!errors.confirmarPassword}
              {...register("confirmarPassword")}
            />
          </Field>
        </div>

        <Button type="submit" cargando={isLoading} className="w-full">
          Crear cuenta
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-texto-suave">
        ¿Ya tenés cuenta?{" "}
        <Link to="/login" className="font-medium text-primario hover:underline">
          Ingresá
        </Link>
      </p>
    </>
  );
}
