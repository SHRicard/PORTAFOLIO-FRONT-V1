import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { EstudioForm } from "@/features/estudios/EstudioForm";
import { useEliminarEstudioMutation, useGetEstudiosAdminQuery } from "@/features/estudios/estudiosApi";
import type { Estudio } from "@/features/estudios/types";
import { estadoEstudio, rango, TIPO_ESTUDIO } from "@/features/portafolio/formato";
import { getErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

export default function EstudiosPage() {
  const { data: estudios, isLoading, error } = useGetEstudiosAdminQuery();
  const [eliminar] = useEliminarEstudioMutation();
  // "nuevo" = formulario vacío · un estudio = editándolo · null = formulario cerrado
  const [editando, setEditando] = useState<Estudio | "nuevo" | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  async function borrar(estudio: Estudio) {
    const mensaje = `¿Borrar "${estudio.titulo}"? No se puede deshacer. Si solo querés ocultarlo, editalo y destildá "Mostrar en la web".`;
    if (!window.confirm(mensaje)) return;

    setErrorAccion(null);
    try {
      await eliminar(estudio.id).unwrap();
      // Si estaba abierto en el formulario, ya no hay nada que guardar
      setEditando((actual) => (actual !== "nuevo" && actual?.id === estudio.id ? null : actual));
    } catch (err) {
      setErrorAccion(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title>Estudios</Title>
          <Subtitle className="mt-1 text-base">Tu formación, del estudio más reciente al más viejo.</Subtitle>
        </div>
        <Button onClick={() => setEditando("nuevo")}>
          <Plus className="size-4" aria-hidden />
          Nuevo estudio
        </Button>
      </div>

      {editando && (
        <EstudioForm
          key={editando === "nuevo" ? "nuevo" : editando.id}
          estudio={editando === "nuevo" ? undefined : editando}
          onListo={() => setEditando(null)}
        />
      )}

      {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <Spinner />}
      {estudios?.length === 0 && <Alert>Todavía no cargaste ningún estudio.</Alert>}

      <ul className="space-y-3">
        {estudios?.map((estudio) => (
          <li key={estudio.id}>
            <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="flex flex-wrap items-center gap-2 font-medium text-texto">
                  {estudio.titulo}
                  {!estudio.publicado && <Badge estilo="peligro">Oculto</Badge>}
                </p>
                <p className="text-sm text-texto-suave">
                  {estudio.institucion} · {TIPO_ESTUDIO[estudio.tipo]} · {rango(estudio.desde, estudio.hasta, "en curso")}{" "}
                  · {estadoEstudio(estudio)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  estilo="texto"
                  tamano="sm"
                  aria-label={`Editar ${estudio.titulo}`}
                  onClick={() => setEditando(estudio)}
                >
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <Button
                  estilo="texto"
                  tamano="sm"
                  aria-label={`Borrar ${estudio.titulo}`}
                  onClick={() => borrar(estudio)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
