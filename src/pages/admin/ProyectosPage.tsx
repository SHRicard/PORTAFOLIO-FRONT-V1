import { useState } from "react";
import { Link } from "react-router";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { mes, TIPO_PROYECTO } from "@/features/portafolio/formato";
import {
  useEliminarProyectoMutation,
  useGetProyectosAdminQuery,
  useReordenarProyectosMutation,
} from "@/features/proyectos/proyectosApi";
import { FilaProyecto } from "@/features/proyectos/FilaProyecto";
import { ESTADO_ESTILO, ESTADO_LABELS, ESTADOS_PROYECTO, queFalta } from "@/features/proyectos/schemas";
import type { EstadoProyecto, Proyecto } from "@/features/proyectos/types";
import { getErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { CabeceraLista } from "@/components/ui/FilaLista";
import { useConfirmar } from "@/components/ui/Confirmar";
import { VistaFicha } from "@/components/ui/DialogoConfirmar";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

export default function ProyectosPage() {
  const [estado, setEstado] = useState<EstadoProyecto | "">("");
  // currentData y no data: al cambiar el filtro, data sigue mostrando la lista anterior y reordenar la usaría incompleta
  const { currentData: proyectos, isFetching, error } = useGetProyectosAdminQuery(estado ? { estado } : undefined);
  const [reordenar, { isLoading: reordenando }] = useReordenarProyectosMutation();
  const [eliminar] = useEliminarProyectoMutation();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const confirmar = useConfirmar();

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
    const publicado = proyecto.estado === "publicado";
    const confirmado = await confirmar({
      tipo: "Proyecto",
      titulo: "¿Borrar este proyecto?",
      vista: (
        <VistaFicha
          titulo={proyecto.titulo}
          imagen={proyecto.galeria[0]?.url}
          etiqueta={<Badge estilo={ESTADO_ESTILO[proyecto.estado]}>{ESTADO_LABELS[proyecto.estado]}</Badge>}
          detalle={`${TIPO_PROYECTO[proyecto.tipo]} · ${mes(proyecto.fecha)}`}
        />
      ),
      consecuencias: [
        { icono: Trash2, texto: `Sale ${publicado ? "de la web y del panel" : "del panel"}, con sus textos y enlaces` },
        { icono: RotateCcw, texto: "No se puede deshacer", tono: "suave" },
      ],
      sugerencia: publicado ? "Si solo querés ocultarlo, cambiá su estado a Privado." : undefined,
      textoConfirmar: "Borrar proyecto",
    });
    if (!confirmado) return;

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

      {/* «Lista ordenada»: una fila por proyecto, con sus columnas. Se acomodan al ancho de la lista (@container) */}
      {proyectos && proyectos.length > 0 && (
        <div className="@container overflow-hidden rounded-card border border-borde bg-superficie">
          <CabeceraLista conOrden nombre="Proyecto" dato="Tipo y fecha" />
          <ul className="divide-y divide-borde">
            {proyectos.map((proyecto, i) => (
              <li key={proyecto.id}>
                {/* La portada es la primera imagen de la galería */}
                <FilaProyecto
                  numero={i + 1}
                  titulo={proyecto.titulo}
                  destacado={proyecto.destacado}
                  estado={proyecto.estado}
                  resumen={proyecto.resumen}
                  tipo={proyecto.tipo}
                  fecha={proyecto.fecha}
                  portada={proyecto.galeria[0] ?? null}
                  falta={queFalta(proyecto)}
                  // Reordenar necesita la lista completa: con un filtro activo no se puede
                  subir={
                    !estado && (
                      <Button
                        estilo="texto"
                        tamano="sm"
                        className="h-6 w-7 px-0"
                        aria-label={`Subir ${proyecto.titulo}`}
                        disabled={i === 0 || reordenando}
                        onClick={() => mover(proyectos, i, i - 1)}
                      >
                        <ArrowUp className="size-4" aria-hidden />
                      </Button>
                    )
                  }
                  bajar={
                    !estado && (
                      <Button
                        estilo="texto"
                        tamano="sm"
                        className="h-6 w-7 px-0"
                        aria-label={`Bajar ${proyecto.titulo}`}
                        disabled={i === proyectos.length - 1 || reordenando}
                        onClick={() => mover(proyectos, i, i + 1)}
                      >
                        <ArrowDown className="size-4" aria-hidden />
                      </Button>
                    )
                  }
                  acciones={
                    <>
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
