import { useState } from "react";
import { Link } from "react-router";
import { BriefcaseBusiness, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEliminarExperienciaMutation, useGetExperienciaAdminQuery } from "@/features/experiencia/experienciaApi";
import { FilaExperiencia } from "@/features/experiencia/FilaExperiencia";
import { estadoDe, queFalta } from "@/features/experiencia/schemas";
import type { Experiencia } from "@/features/experiencia/types";
import { MODALIDAD, rango } from "@/features/portafolio/formato";
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
 * Experiencia, con el formato de la lista de proyectos («Lista ordenada») y sin orden a mano: el backend trae los
 * trabajos del más reciente al más viejo. Agregar y editar abren su formulario («Con vista previa»)
 */
export default function ExperienciaPage() {
  const { data: experiencia, isLoading, error } = useGetExperienciaAdminQuery();
  const [eliminar] = useEliminarExperienciaMutation();
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const confirmar = useConfirmar();

  async function borrar(trabajo: Experiencia) {
    const estado = estadoDe(trabajo.publicado);
    const confirmado = await confirmar({
      tipo: "Experiencia",
      titulo: "¿Borrar este trabajo?",
      vista: (
        <VistaFicha
          titulo={`${trabajo.puesto} en ${trabajo.empresa}`}
          icono={BriefcaseBusiness}
          etiqueta={<Badge estilo={estado.estilo}>{estado.etiqueta}</Badge>}
          detalle={`${rango(trabajo.desde, trabajo.hasta)} · ${MODALIDAD[trabajo.modalidad]}`}
        />
      ),
      consecuencias: [
        { icono: Trash2, texto: `Sale ${trabajo.publicado ? "de la web y del panel" : "del panel"}` },
        { icono: RotateCcw, texto: "No se puede deshacer", tono: "suave" },
      ],
      sugerencia: trabajo.publicado ? "Si solo querés ocultarlo, editalo y apagá «Mostrar en la web»." : undefined,
      textoConfirmar: "Borrar trabajo",
    });
    if (!confirmado) return;

    setErrorAccion(null);
    try {
      await eliminar(trabajo.id).unwrap();
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
        <Link to="/admin/experiencia/nuevo" className={buttonVariants()}>
          <Plus className="size-4" aria-hidden />
          Nuevo trabajo
        </Link>
      </div>

      {errorAccion && <Alert tipo="error">{errorAccion}</Alert>}
      {error && <Alert tipo="error">{getErrorMessage(error)}</Alert>}
      {isLoading && <Spinner />}
      {experiencia?.length === 0 && <Alert>Todavía no cargaste ningún trabajo.</Alert>}

      {/* Una fila por trabajo, con sus columnas. Se acomodan al ancho de la lista (@container) */}
      {experiencia && experiencia.length > 0 && (
        <div className="@container overflow-hidden rounded-card border border-borde bg-superficie">
          <CabeceraLista conOrden={false} nombre="Trabajo" dato="Fechas y modalidad" />
          <ul className="divide-y divide-borde">
            {experiencia.map((trabajo) => {
              const nombre = `${trabajo.puesto} en ${trabajo.empresa}`;
              return (
                <li key={trabajo.id}>
                  <FilaExperiencia
                    empresa={trabajo.empresa}
                    puesto={trabajo.puesto}
                    desde={trabajo.desde}
                    hasta={trabajo.hasta}
                    ubicacion={trabajo.ubicacion}
                    modalidad={trabajo.modalidad}
                    descripcion={trabajo.descripcion}
                    publicado={trabajo.publicado}
                    falta={queFalta(trabajo)}
                    acciones={
                      <>
                        <Link
                          to={`/admin/experiencia/${trabajo.id}`}
                          className={buttonVariants({ estilo: "texto", tamano: "sm" })}
                          aria-label={`Editar ${nombre}`}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                        <Button
                          estilo="texto"
                          tamano="sm"
                          aria-label={`Borrar ${nombre}`}
                          onClick={() => borrar(trabajo)}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </>
                    }
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
