import { useState } from "react";
import { Link } from "react-router";
import { GraduationCap, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEliminarEstudioMutation, useGetEstudiosAdminQuery } from "@/features/estudios/estudiosApi";
import { FilaEstudio } from "@/features/estudios/FilaEstudio";
import { estadoDe, queFalta } from "@/features/estudios/schemas";
import type { Estudio } from "@/features/estudios/types";
import { rango } from "@/features/portafolio/formato";
import { getErrorMessage } from "@/lib/errors";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useConfirmar } from "@/components/ui/Confirmar";
import { VistaFicha } from "@/components/ui/DialogoConfirmar";
import { CabeceraLista } from "@/components/ui/FilaLista";
import { Spinner } from "@/components/ui/Spinner";
import { Subtitle, Title } from "@/components/ui/Typography";

/**
 * Estudios, con el formato de la lista de proyectos («Lista ordenada») y sin orden a mano: el backend trae los
 * estudios del más reciente al más viejo. Agregar y editar abren su formulario («Con vista previa»)
 */
export default function EstudiosPage() {
  const { data: estudios, isLoading, error } = useGetEstudiosAdminQuery();
  const [eliminar] = useEliminarEstudioMutation();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const confirmar = useConfirmar();

  async function borrar(estudio: Estudio) {
    const estado = estadoDe(estudio.publicado);
    const confirmado = await confirmar({
      tipo: "Estudio",
      titulo: "¿Borrar este estudio?",
      vista: (
        <VistaFicha
          titulo={estudio.titulo}
          icono={GraduationCap}
          etiqueta={<Badge estilo={estado.estilo}>{estado.etiqueta}</Badge>}
          detalle={`${estudio.institucion} · ${rango(estudio.desde, estudio.hasta, "en curso")}`}
        />
      ),
      consecuencias: [
        { icono: Trash2, texto: `Sale ${estudio.publicado ? "de la web y del panel" : "del panel"}` },
        { icono: RotateCcw, texto: "No se puede deshacer", tono: "suave" },
      ],
      sugerencia: estudio.publicado ? "Si solo querés ocultarlo, editalo y apagá «Mostrar en la web»." : undefined,
      textoConfirmar: "Borrar estudio",
    });
    if (!confirmado) return;

    setErrorAccion(null);
    try {
      await eliminar(estudio.id).unwrap();
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
        <Link to="/admin/estudios/nuevo" className={buttonVariants()}>
          <Plus className="size-4" aria-hidden />
          Nuevo estudio
        </Link>
      </div>

      {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <Spinner />}
      {estudios?.length === 0 && <Alert>Todavía no cargaste ningún estudio.</Alert>}

      {/* Una fila por estudio, con sus columnas. Se acomodan al ancho de la lista (@container) */}
      {estudios && estudios.length > 0 && (
        <div className="@container overflow-hidden rounded-card border border-borde bg-superficie">
          <CabeceraLista conOrden={false} nombre="Estudio" dato="Fechas y estado" />
          <ul className="divide-y divide-borde">
            {estudios.map((estudio) => (
              <li key={estudio.id}>
                <FilaEstudio
                  titulo={estudio.titulo}
                  institucion={estudio.institucion}
                  tipo={estudio.tipo}
                  desde={estudio.desde}
                  hasta={estudio.hasta}
                  finalizado={estudio.finalizado}
                  publicado={estudio.publicado}
                  falta={queFalta(estudio)}
                  acciones={
                    <>
                      <Link
                        to={`/admin/estudios/${estudio.id}`}
                        className={buttonVariants({ estilo: "texto", tamano: "sm" })}
                        aria-label={`Editar ${estudio.titulo}`}
                      >
                        <Pencil className="size-4" aria-hidden />
                      </Link>
                      <Button
                        estilo="texto"
                        tamano="sm"
                        aria-label={`Borrar ${estudio.titulo}`}
                        onClick={() => borrar(estudio)}
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
