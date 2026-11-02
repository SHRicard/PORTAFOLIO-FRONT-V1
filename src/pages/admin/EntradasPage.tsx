import { useState } from "react";
import { Link } from "react-router";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useEliminarEntradaMutation, useGetEntradasAdminQuery } from "@/features/blog/blogApi";
import { ESTADO_LABELS, ESTADOS_ENTRADA, pendientes } from "@/features/blog/schemas";
import type { EntradaResumen, EstadoEntrada } from "@/features/blog/types";
import { fechaLarga } from "@/features/portafolio/formato";
import { getErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

export default function EntradasPage() {
  const [estado, setEstado] = useState<EstadoEntrada | "">("");
  const { currentData: entradas, isFetching, error } = useGetEntradasAdminQuery(estado ? { estado } : undefined);
  const [eliminar] = useEliminarEntradaMutation();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);

  async function borrar(entrada: EntradaResumen) {
    const mensaje = `¿Borrar "${entrada.titulo}"? No se puede deshacer. Si solo querés sacarla de la web, cambiá su estado a Borrador.`;
    if (!window.confirm(mensaje)) return;

    setErrorAccion(null);
    try {
      await eliminar(entrada.id).unwrap();
    } catch (err) {
      setErrorAccion(getErrorMessage(err));
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Title>Blog</Title>
          <Subtitle className="mt-1 text-base">Escribí noticias y novedades para tu portafolio.</Subtitle>
        </div>
        <Link to="/admin/blog/nuevo" className={buttonVariants()}>
          <Plus className="size-4" aria-hidden />
          Nueva entrada
        </Link>
      </div>

      <div className="max-w-xs">
        <Select
          aria-label="Filtrar por estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoEntrada | "")}
        >
          <option value="">Todos los estados</option>
          {ESTADOS_ENTRADA.map((e) => (
            <option key={e} value={e}>
              {ESTADO_LABELS[e]}
            </option>
          ))}
        </Select>
      </div>

      {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {isFetching && !entradas && <Spinner />}
      {entradas?.length === 0 && <Alert>No hay entradas para mostrar.</Alert>}

      <ul className="space-y-3">
        {entradas?.map((entrada) => (
          <li key={entrada.id}>
            <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="flex flex-wrap items-center gap-2 font-medium text-texto">
                  {entrada.titulo}
                  <Badge estilo={entrada.estado === "publicado" ? "primario" : "neutro"}>
                    {ESTADO_LABELS[entrada.estado]}
                  </Badge>
                </p>
                <p className="truncate text-sm text-texto-suave">
                  {entrada.publicadoEn && `${fechaLarga(entrada.publicadoEn)} · `}
                  {entrada.resumen}
                </p>
                <div className="flex flex-wrap gap-1">
                  {pendientes(entrada).map((falta) => (
                    <Badge key={falta}>{falta}</Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1">
                {entrada.estado === "publicado" && (
                  <Link
                    to={`/blog/${entrada.slug}`}
                    className={buttonVariants({ estilo: "texto", tamano: "sm" })}
                    aria-label={`Ver ${entrada.titulo} en la web`}
                  >
                    <ExternalLink className="size-4" aria-hidden />
                  </Link>
                )}
                <Link
                  to={`/admin/blog/${entrada.id}`}
                  className={buttonVariants({ estilo: "texto", tamano: "sm" })}
                  aria-label={`Editar ${entrada.titulo}`}
                >
                  <Pencil className="size-4" aria-hidden />
                </Link>
                <Button
                  estilo="texto"
                  tamano="sm"
                  aria-label={`Borrar ${entrada.titulo}`}
                  onClick={() => borrar(entrada)}
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
