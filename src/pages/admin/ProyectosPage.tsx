import { useState } from "react";
import { Link } from "react-router";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  useEliminarProyectoMutation,
  useGetProyectosAdminQuery,
  useReordenarProyectosMutation,
} from "@/features/proyectos/proyectosApi";
import { ESTADO_LABELS, ESTADOS_PROYECTO, pendientes } from "@/features/proyectos/schemas";
import type { EstadoProyecto, Proyecto } from "@/features/proyectos/types";
import { getErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

const ESTILO_ESTADO: Record<EstadoProyecto, "neutro" | "primario" | "peligro"> = {
  borrador: "neutro",
  publicado: "primario",
  privado: "peligro",
};

export default function ProyectosPage() {
  const [estado, setEstado] = useState<EstadoProyecto | "">("");
  // currentData y no data: al cambiar el filtro, data sigue mostrando la lista anterior y reordenar la usaría incompleta
  const { currentData: proyectos, isFetching, error } = useGetProyectosAdminQuery(estado ? { estado } : undefined);
  const [reordenar, { isLoading: reordenando }] = useReordenarProyectosMutation();
  const [eliminar] = useEliminarProyectoMutation();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  async function mover(lista: Proyecto[], desde: number, hasta: number) {
    const ids = lista.map((p) => p.id);
    const [id] = ids.splice(desde, 1);
    if (id === undefined) return;
    ids.splice(hasta, 0, id);

    setErrorAccion(null);
    try {
      await reordenar(ids).unwrap();
    } catch (err) {
      setErrorAccion(getErrorMessage(err));
    }
  }

  async function borrar(proyecto: Proyecto) {
    const mensaje = `¿Borrar "${proyecto.titulo}"? No se puede deshacer. Si solo querés ocultarlo, cambiá su estado a Privado.`;
    if (!window.confirm(mensaje)) return;

    setErrorAccion(null);
    try {
      await eliminar(proyecto.id).unwrap();
    } catch (err) {
      setErrorAccion(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title>Proyectos</Title>
          <Subtitle className="mt-1 text-base">Agregá, editá y ordená los proyectos de tu portafolio.</Subtitle>
        </div>
        <Link to="/admin/proyectos/nuevo" className={buttonVariants()}>
          <Plus className="size-4" aria-hidden />
          Nuevo proyecto
        </Link>
      </div>

      <div className="max-w-xs">
        <Select
          aria-label="Filtrar por estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoProyecto | "")}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_PROYECTO.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABELS[e]}
            </option>
          ))}
        </Select>
      </div>

      {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {isFetching && !proyectos && <Spinner />}
      {proyectos?.length === 0 && <Alert>No hay proyectos para mostrar.</Alert>}

      <ul className="space-y-3">
        {proyectos?.map((proyecto, i) => (
          <li key={proyecto.id}>
            <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="flex flex-wrap items-center gap-2 font-medium text-texto">
                  {proyecto.titulo}
                  {proyecto.destacado && <Star className="size-4 text-secundario" aria-label="Destacado" />}
                  <Badge estilo={ESTILO_ESTADO[proyecto.estado]}>{ESTADO_LABELS[proyecto.estado]}</Badge>
                </p>
                <p className="truncate text-sm text-texto-suave">{proyecto.resumen}</p>
                <div className="flex flex-wrap gap-1">
                  {pendientes(proyecto).map((falta) => (
                    <Badge key={falta}>{falta}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Reordenar necesita la lista completa: con un filtro activo no se puede */}
                {!estado && (
                  <>
                    <Button
                      estilo="texto"
                      tamano="sm"
                      aria-label={`Subir ${proyecto.titulo}`}
                      disabled={i === 0 || reordenando}
                      onClick={() => mover(proyectos, i, i - 1)}
                    >
                      <ArrowUp className="size-4" aria-hidden />
                    </Button>
                    <Button
                      estilo="texto"
                      tamano="sm"
                      aria-label={`Bajar ${proyecto.titulo}`}
                      disabled={i === proyectos.length - 1 || reordenando}
                      onClick={() => mover(proyectos, i, i + 1)}
                    >
                      <ArrowDown className="size-4" aria-hidden />
                    </Button>
                  </>
                )}
                {proyecto.estado === "publicado" && (
                  <Link
                    to={`/proyectos/${proyecto.slug}`}
                    className={buttonVariants({ estilo: "texto", tamano: "sm" })}
                    aria-label={`Ver ${proyecto.titulo} en la web`}
                  >
                    <ExternalLink className="size-4" aria-hidden />
                  </Link>
                )}
                <Link
                  to={`/admin/proyectos/${proyecto.id}`}
                  className={buttonVariants({ estilo: "texto", tamano: "sm" })}
                  aria-label={`Editar ${proyecto.titulo}`}
                >
                  <Pencil className="size-4" aria-hidden />
                </Link>
                <Button
                  estilo="texto"
                  tamano="sm"
                  aria-label={`Borrar ${proyecto.titulo}`}
                  onClick={() => borrar(proyecto)}
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
