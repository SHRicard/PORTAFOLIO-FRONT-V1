import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/features/auth/authApi";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { getErrorMessage } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Subtitle, Title } from "@/components/ui/Typography";

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      // Si sale bien, GuestRoute detecta el token y redirige solo.
      await login(values).unwrap();
    } catch (error) {
      if (!applyServerFieldErrors(error, setError, ["correo", "password"])) {
        setFormError(getErrorMessage(error));
      }
    }
  }

  return (
    <>
      <Title>Ingresar</Title>
      <Subtitle className="mt-1 text-base">Accedé a tu panel</Subtitle>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {formError && <Alert tipo="error">{formError}</Alert>}

        <Field label="Correo electrónico" htmlFor="correo" error={errors.correo?.message}>
          <Input id="correo" type="email" autoComplete="email" invalid={!!errors.correo} {...register("correo")} />
        </Field>

        <Field label="Contraseña" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" invalid={!!errors.password} {...register("password")} />
        </Field>

        <Button type="submit" cargando={isLoading} className="w-full">
          Ingresar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-texto-suave">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="font-medium text-primario hover:underline">
          Registrate
        </Link>
      </p>
    </>
  );
}
