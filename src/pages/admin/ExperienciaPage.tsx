import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ExperienciaForm } from "@/features/experiencia/ExperienciaForm";
import { useEliminarExperienciaMutation, useGetExperienciaAdminQuery } from "@/features/experiencia/experienciaApi";
import type { Experiencia } from "@/features/experiencia/types";
import { MODALIDAD, rango } from "@/features/portafolio/formato";
import { getErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

export default function ExperienciaPage() {
  const { data: experiencia, isLoading, error } = useGetExperienciaAdminQuery();
  const [eliminar] = useEliminarExperienciaMutation();
  // "nuevo" = formulario vacío · un trabajo = editándolo · null = formulario cerrado
  const [editando, setEditando] = useState<Experiencia | "nuevo" | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  async function borrar(trabajo: Experiencia) {
    const mensaje = `¿Borrar "${trabajo.puesto} en ${trabajo.empresa}"? No se puede deshacer. Si solo querés ocultarlo, editalo y destildá "Mostrar en la web".`;
    if (!window.confirm(mensaje)) return;

    setErrorAccion(null);
    try {
      await eliminar(trabajo.id).unwrap();
      // Si estaba abierto en el formulario, ya no hay nada que guardar
      setEditando((actual) => (actual !== "nuevo" && actual?.id === trabajo.id ? null : actual));
    } catch (err) {
      setErrorAccion(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title>Experiencia</Title>
          <Subtitle className="mt-1 text-base">Tus trabajos, del más reciente al más viejo.</Subtitle>
        </div>
        <Button onClick={() => setEditando("nuevo")}>
          <Plus className="size-4" aria-hidden />
          Nuevo trabajo
        </Button>
      </div>

      {editando && (
        <ExperienciaForm
          key={editando === "nuevo" ? "nuevo" : editando.id}
          experiencia={editando === "nuevo" ? undefined : editando}
          onListo={() => setEditando(null)}
        />
      )}

      {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <Spinner />}
      {experiencia?.length === 0 && <Alert>Todavía no cargaste ningún trabajo.</Alert>}

      <ul className="space-y-3">
        {experiencia?.map((trabajo) => (
          <li key={trabajo.id}>
            <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="flex flex-wrap items-center gap-2 font-medium text-texto">
                  {trabajo.puesto} en {trabajo.empresa}
                  {!trabajo.publicado && <Badge estilo="peligro">Oculto</Badge>}
                </p>
                <p className="text-sm text-texto-suave">
                  {rango(trabajo.desde, trabajo.hasta)} · {MODALIDAD[trabajo.modalidad]}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  estilo="texto"
                  tamano="sm"
                  aria-label={`Editar ${trabajo.puesto} en ${trabajo.empresa}`}
                  onClick={() => setEditando(trabajo)}
                >
                  <Pencil className="size-4" aria-hidden />
                </Button>
                <Button
                  estilo="texto"
                  tamano="sm"
                  aria-label={`Borrar ${trabajo.puesto} en ${trabajo.empresa}`}
                  onClick={() => borrar(trabajo)}
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
