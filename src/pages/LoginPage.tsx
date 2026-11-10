import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useLoginMutation } from "@/features/auth/authApi";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { getErrorMessage } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { NOMBRE } from "@/lib/identidad";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Subtitle, Title } from "@/components/ui/Typography";
import { GlassInput } from "@/vistas/rr-dev/components/atoms/GlassInput";

/**
 * Ingresar al panel, dentro del amanecer de RR-DEV (`AuthLayout`): el saludo, con mi nombre en los
 * colores del amanecer, y el formulario con los campos de vidrio. Entran de a uno
 */
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
    <div className="grid justify-items-center gap-[clamp(1.25rem,3.4vh,2.25rem)] text-center">
      <div className="entra-amanecer grid justify-items-center gap-3 [--orden:1]">
        <Title className="text-[length:clamp(2.125rem,5vh,2.5rem)] leading-[1.08] tracking-[-0.03em] text-balance md:text-[length:clamp(2.5rem,6vh,4rem)]">
          Hola de nuevo,{" "}
          <span className="bg-linear-120 from-secundario via-rosa to-aviso bg-clip-text text-transparent">{NOMBRE}</span>
        </Title>
        <Subtitle className="text-[length:clamp(0.9375rem,1.8vh,1.125rem)]">Ingresá para editar tu portafolio.</Subtitle>
      </div>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="entra-amanecer grid w-full max-w-100 gap-4 text-left [--orden:2]">
        {formError && (
          <Alert tipo="error" className="rounded-xl backdrop-blur-md">
            {formError}
          </Alert>
        )}

        <Field label="Correo electrónico" htmlFor="correo" error={errors.correo?.message}>
          <GlassInput
            id="correo"
            icono={Mail}
            type="email"
            autoComplete="email"
            invalid={!!errors.correo}
            {...register("correo")}
          />
        </Field>

        <Field label="Contraseña" htmlFor="password" error={errors.password?.message}>
          <GlassInput
            id="password"
            icono={LockKeyhole}
            type="password"
            autoComplete="current-password"
            invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        {/* Con la banda de luz que cruza el botón del CV */}
        <Button
          type="submit"
          tamano="lg"
          cargando={isLoading}
          className="group boton-luz relative mt-1 h-12.5 w-full overflow-hidden rounded-xl text-[0.96875rem] font-semibold shadow-[0_14px_32px_-14px_color-mix(in_srgb,var(--primario)_80%,transparent)]"
        >
          Ingresar
          <ArrowRight
            className="size-4.5 transition-transform duration-500 ease-(--salida) group-hover:translate-x-1"
            aria-hidden
          />
        </Button>
      </form>
    </div>
  );
}
