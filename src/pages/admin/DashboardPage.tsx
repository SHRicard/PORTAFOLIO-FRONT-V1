import { useGetMeQuery } from "@/features/auth/authApi";
import { SEXO_LABELS } from "@/features/auth/schemas";
import { Card } from "@/components/ui/Card";
import { Subtitle, Title } from "@/components/ui/Typography";

export default function DashboardPage() {
  const { data: user } = useGetMeQuery();
  if (!user) return null; // ProtectedRoute ya garantiza que el usuario está cargado

  const datos: [string, string][] = [
    ["Correo", user.correo],
    ["Teléfono", user.telefono],
    ["País", user.pais],
    ["Sexo", SEXO_LABELS[user.sexo]],
  ];

  return (
    <div className="space-y-8">
      <div>
        <Title>Hola, {user.nombre}</Title>
        <Subtitle className="mt-1 text-base">Este es tu panel. Desde acá vas a manejar todo el sitio.</Subtitle>
      </div>

      <Card>
        <h2 className="font-subtitulo text-lg font-semibold text-texto">Tus datos</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {datos.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-texto-suave">{label}</dt>
              <dd className="font-medium text-texto">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
