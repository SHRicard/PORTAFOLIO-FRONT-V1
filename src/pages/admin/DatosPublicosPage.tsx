import { useGetPerfilAdminQuery } from "@/features/perfil/perfilApi";
import { PerfilForm } from "@/features/perfil/PerfilForm";
import { getErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

/**
 * Datos públicos: lo que la web cuenta de vos, en el formulario «Con vista previa» (`PerfilForm`). Con el
 * formulario, el título va en su barra; mientras carga o si falla, arriba de la página
 */
export default function DatosPublicosPage() {
  const { data: perfil, isLoading, error } = useGetPerfilAdminQuery();

  // 404 = el perfil todavía no existe: se muestra el formulario vacío para crearlo
  const sinPerfil = typeof error === "object" && "status" in error && error.status === 404;

  if (perfil || sinPerfil) return <PerfilForm perfil={perfil} />;

  return (
    <div className="space-y-6">
      <div>
        <Title>Datos públicos</Title>
        <Subtitle className="mt-1 text-base">Lo que ven los visitantes de tu portafolio sobre vos.</Subtitle>
      </div>
      {isLoading && <Spinner />}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
    </div>
  );
}
