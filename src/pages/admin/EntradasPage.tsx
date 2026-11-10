import { useState } from "react";
import { Link } from "react-router";
import { ExternalLink, Newspaper, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEliminarEntradaMutation, useGetEntradasAdminQuery } from "@/features/blog/blogApi";
import { FilaEntrada } from "@/features/blog/FilaEntrada";
import { ESTADO_ESTILO, ESTADO_LABELS, ESTADOS_ENTRADA, queFalta } from "@/features/blog/schemas";
import type { EntradaResumen, EstadoEntrada } from "@/features/blog/types";
import { fechaLarga } from "@/features/portafolio/formato";
import { getErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useConfirmar } from "@/components/ui/Confirmar";
import { VistaFicha } from "@/components/ui/DialogoConfirmar";
import { CabeceraLista } from "@/components/ui/FilaLista";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

export default function EntradasPage() {
  const [estado, setEstado] = useState<EstadoEntrada | "">("");
  const { currentData: entradas, isFetching, error } = useGetEntradasAdminQuery(estado ? { estado } : undefined);
  const [eliminar] = useEliminarEntradaMutation();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const confirmar = useConfirmar();

  async function borrar(entrada: EntradaResumen) {
    const publicada = entrada.estado === "publicado";
    const confirmado = await confirmar({
      tipo: "Entrada del blog",
      titulo: "¿Borrar esta entrada?",
      vista: (
        <VistaFicha
          titulo={entrada.titulo}
          imagen={entrada.portada?.url}
          icono={Newspaper}
          etiqueta={<Badge estilo={ESTADO_ESTILO[entrada.estado]}>{ESTADO_LABELS[entrada.estado]}</Badge>}
          detalle={entrada.publicadoEn ? fechaLarga(entrada.publicadoEn) : undefined}
        />
      ),
      consecuencias: [
        { icono: Trash2, texto: `Sale ${publicada ? "de la web y del panel" : "del panel"}, con su texto` },
        { icono: RotateCcw, texto: "No se puede deshacer", tono: "suave" },
      ],
      sugerencia: publicada ? "Si solo querés sacarla de la web, cambiá su estado a Borrador." : undefined,
      textoConfirmar: "Borrar entrada",
    });
    if (!confirmado) return;

    setErrorAccion(null);
    try {
      await eliminar(entrada.id).unwrap();
    } catch (err) {
      setErrorAccion(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
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

      {/* Como la lista de proyectos («Lista ordenada»), sin orden a mano: el backend las trae de la más nueva
          a la más vieja. Las columnas se acomodan al ancho de la lista (@container) */}
      {entradas && entradas.length > 0 && (
        <div className="@container overflow-hidden rounded-card border border-borde bg-superficie">
          <CabeceraLista conOrden={false} nombre="Entrada" dato="Etiquetas y fecha" />
          <ul className="divide-y divide-borde">
            {entradas.map((entrada) => (
              <li key={entrada.id}>
                <FilaEntrada
                  titulo={entrada.titulo}
                  estado={entrada.estado}
                  resumen={entrada.resumen}
                  etiquetas={entrada.etiquetas}
                  publicadoEn={entrada.publicadoEn}
                  portada={entrada.portada}
                  falta={queFalta(entrada)}
                  acciones={
                    <>
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
                    </>
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
