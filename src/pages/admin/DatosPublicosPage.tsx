import { useGetPerfilAdminQuery } from "@/features/perfil/perfilApi";
import { PerfilForm } from "@/features/perfil/PerfilForm";
import { getErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

export default function DatosPublicosPage() {
  const { data: perfil, isLoading, error } = useGetPerfilAdminQuery();

  // 404 = el perfil todavía no existe: se muestra el formulario vacío para crearlo
  const sinPerfil = typeof error === "object" && "status" in error && error.status === 404;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Title>Datos públicos</Title>
        <Subtitle className="mt-1 text-base">Lo que ven los visitantes de tu portafolio sobre vos.</Subtitle>
      </div>

      {isLoading && <Spinner />}
      {error && !sinPerfil && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {(perfil || sinPerfil) && <PerfilForm perfil={perfil} />}
    </div>
  );
}
