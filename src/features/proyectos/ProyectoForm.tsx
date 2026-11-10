import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Eye,
  EyeOff,
  FileText,
  FolderGit2,
  Globe,
  Images,
  Layers,
  Link2,
  ListChecks,
  PencilLine,
  Send,
  Star,
  Tag,
  Type,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { CampoArchivo } from "@/features/archivos/CampoArchivo";
import { CampoPdf } from "@/features/archivos/CampoPdf";
import { GaleriaFotos } from "@/features/archivos/GaleriaFotos";
import { SubidasPendientesContexto, useSubidasPendientes } from "@/features/archivos/subidasPendientes";
import { TIPO_PROYECTO } from "@/features/portafolio/formato";
import { getErrorMessage } from "@/lib/errors";
import { aLineas, carpetaDe } from "@/lib/validaciones";
import { Alert } from "@/components/ui/Alert";
import { CampoFichas } from "@/components/ui/CampoFichas";
import { Field } from "@/components/ui/Field";
import {
  AccionesDeMuestra,
  AvisosFormulario,
  BarraFormulario,
  CajaLado,
  CuerpoFormulario,
  LoQueTiene,
  OpcionesEstado,
  PieCampo,
  Seccion,
  useEnfocarError,
} from "@/components/ui/FormularioPanel";
import { Input } from "@/components/ui/Input";
import { Interruptor } from "@/components/ui/Interruptor";
import { FilaEditable, ListaEditable } from "@/components/ui/ListaEditable";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { contarParrafos } from "./formulario";
import {
  aFormulario,
  aProyectoInput,
  ESTADO_AYUDA,
  ESTADO_ESTILO,
  ESTADO_LABELS,
  ESTADOS_PROYECTO,
  PROYECTO_VACIO,
  proyectoSchema,
  queFalta,
  TIPOS_PROYECTO,
  type ProyectoFormValues,
} from "./schemas";
import { FilaProyecto } from "./FilaProyecto";
import type { EstadoProyecto, Proyecto } from "./types";
import { useQuitarFoto } from "./useQuitarFoto";

interface ProyectoFormProps {
  /** Sin proyecto: formulario para crear uno nuevo */
  proyecto?: Proyecto;
  guardando: boolean;
  errorGeneral: string | null;
  textoGuardar: string;
  /** Recibe setError para marcar los campos que rechace el backend */
  onGuardar: (valores: ProyectoFormValues, setError: UseFormSetError<ProyectoFormValues>) => void;
  /** A dónde lleva «Volver», el botón rojo de la barra (ej. "/admin/proyectos"). Sin él, no va */
  volverA?: string;
}

/** El color del punto de cada estado y qué ícono acompaña su ayuda */
const TONO_ESTADO = { borrador: "neutro", publicado: "exito", privado: "peligro" } as const;
const ICONO_ESTADO: Record<EstadoProyecto, LucideIcon> = { borrador: PencilLine, publicado: Globe, privado: EyeOff };

/**
 * El formulario de un proyecto «Con vista previa»: arriba, una barra que acompaña al bajar, con el
 * nombre, el estado, «Ver en la web» y «Guardar». A la izquierda, el formulario en secciones; a la
 * derecha, quieta mientras se baja, la tarjeta tal como queda en la lista (cambia mientras se
 * escribe), la publicación y lo que tiene el proyecto
 */
export function ProyectoForm({
  proyecto,
  guardando,
  errorGeneral,
  textoGuardar,
  onGuardar,
  volverA,
}: ProyectoFormProps) {
  const values = useMemo(() => (proyecto ? aFormulario(proyecto) : undefined), [proyecto]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProyectoFormValues>({
    resolver: zodResolver(proyectoSchema),
    defaultValues: PROYECTO_VACIO,
    values,
    // El foco lo maneja el formulario: así también va al campo que rechace el backend
    shouldFocusError: false,
  });

  // «Quitar» una foto ya guardada la elimina también de Cloudinary; una sin guardar solo sale del formulario
  const fotos = useQuitarFoto(proyecto, isDirty);
  // Las fotos y los PDF elegidos no se suben al elegirlos: se suben al tocar «Guardar»
  const subidas = useSubidasPendientes();
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const repositorios = useFieldArray({ control, name: "repositorios" });
  const galeria = useFieldArray({ control, name: "galeria" });
  const documentos = useFieldArray({ control, name: "documentos" });

  const v = watch();
  // Un proyecto nuevo todavía no tiene slug: la carpeta sale del título, como el slug que va a armar el backend
  const carpeta = carpetaDe("proyectos", proyecto?.slug ?? "", v.titulo);
  const borrador = aProyectoInput(v);
  const falta = queFalta({ galeria: borrador.galeria ?? [], documentos: borrador.documentos ?? [] });
  const tecnologias = aLineas(v.tecnologias);
  const titulo = v.titulo.trim() || (proyecto ? "Sin título" : "Nuevo proyecto");
  const enlaceWeb = proyecto?.estado === "publicado" ? `/proyectos/${proyecto.slug}` : undefined;

  // Al guardar con errores (los del esquema o los que devuelva el backend), enfoca el primer campo marcado
  const foco = useEnfocarError(Object.keys(errors).join());

  const enviar = handleSubmit(
    async (valores) => {
      foco.buscar(); // por si el backend rechaza algún campo
      setErrorSubida(null);
      let conLinks: ProyectoFormValues;
      try {
        // Primero se suben a Cloudinary los archivos elegidos, a la carpeta con el nombre de ahora
        conLinks = await subidas.subir(valores, carpeta);
      } catch (err) {
        setErrorSubida(`No se pudo subir un archivo: ${getErrorMessage(err)}`);
        return;
      }
      onGuardar(conLinks, setError);
    },
    () => foco.buscar(),
  );

  const nRepos = v.repositorios.length;
  const loQueTiene = [
    { ok: Boolean(v.titulo.trim() && v.resumen.trim()), si: "Título y resumen", no: "Falta el título o el resumen" },
    { ok: Boolean(v.descripcion.trim()), si: "Historia", no: "Falta la historia" },
    {
      ok: tecnologias.length > 0,
      si: `${tecnologias.length} ${tecnologias.length === 1 ? "tecnología" : "tecnologías"}`,
      no: "Faltan las tecnologías",
    },
    { ok: nRepos > 0, si: `${nRepos} ${nRepos === 1 ? "repositorio" : "repositorios"}`, no: "Sin repositorios" },
    {
      ok: v.portadaUrl.startsWith("https://") || !!subidas.pendiente(v.portadaUrl),
      si: "Portada",
      no: "Falta la portada",
    },
  ];

  return (
    // Al enfocar un campo, que no quede debajo de la barra pegada
    <SubidasPendientesContexto.Provider value={subidas}>
      <form noValidate onSubmit={enviar} className="[&_:is(input,textarea,select)]:scroll-mt-28">
        <BarraFormulario
          titulo={titulo}
          estado={{ etiqueta: ESTADO_LABELS[v.estado], estilo: ESTADO_ESTILO[v.estado] }}
          volver={volverA ? { a: volverA, etiqueta: "Volver a proyectos" } : undefined}
          verEnLaWeb={enlaceWeb}
          textoGuardar={textoGuardar}
          guardando={guardando || subidas.subiendo}
        />
        <AvisosFormulario errores={[errorSubida, errorGeneral]} conCampos={Object.keys(errors).length > 0} />

        <CuerpoFormulario
          campos={foco.campos}
          lado={
            <>
              <CajaLado icono={Eye} titulo="Así se ve en la lista">
                {/* La misma fila de la lista; en esta columna angosta se acomoda como en el celular */}
                <div className="@container overflow-hidden rounded-card border border-borde bg-superficie">
                  <FilaProyecto
                    encabezado="h3"
                    numero={proyecto?.orden}
                    titulo={titulo}
                    destacado={v.destacado}
                    estado={v.estado}
                    resumen={v.resumen}
                    tipo={v.tipo}
                    fecha={v.fecha}
                    portada={v.portadaUrl ? { url: v.portadaUrl, alt: v.portadaAlt } : null}
                    falta={falta}
                    // Las flechas y los botones de la lista, de muestra
                    subir={<ArrowUp className="my-1 size-4 text-secundario" aria-hidden />}
                    bajar={<ArrowDown className="my-1 size-4 text-secundario" aria-hidden />}
                    acciones={<AccionesDeMuestra conVer={v.estado === "publicado"} />}
                  />
                </div>
              </CajaLado>

              <CajaLado icono={Send} titulo="Publicación">
                <OpcionesEstado
                  opciones={ESTADOS_PROYECTO.map((e) => ({
                    valor: e,
                    etiqueta: ESTADO_LABELS[e],
                    tono: TONO_ESTADO[e],
                  }))}
                  registro={register("estado")}
                  ayuda={{ icono: ICONO_ESTADO[v.estado], texto: ESTADO_AYUDA[v.estado] }}
                  error={errors.estado?.message}
                />
                <Interruptor
                  titulo="Destacado"
                  descripcion="Lo marca entre tus proyectos principales"
                  icono={<Star className="size-4 text-aviso" aria-hidden />}
                  {...register("destacado")}
                />
              </CajaLado>

              {/* En el celular no va: ahí la columna está debajo del formulario */}
              <CajaLado icono={ListChecks} titulo="Lo que tiene" className="hidden lg:grid">
                <LoQueTiene items={loQueTiene} />
              </CajaLado>
            </>
          }
        >
          <Seccion
            icono={FileText}
            tono="info"
            titulo="Datos principales"
            descripcion="Nombre, tipo, rol y de qué se trata"
          >
            {/* Los cuatro del mismo ancho: en una fila si la sección es ancha, de a dos si no entran */}
            <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-4">
              <Field label="Título" htmlFor="titulo" error={errors.titulo?.message}>
                <Input id="titulo" icono={Type} invalid={!!errors.titulo} {...register("titulo")} />
              </Field>
              <Field label="Tipo" htmlFor="tipo" error={errors.tipo?.message}>
                <Select id="tipo" icono={Tag} invalid={!!errors.tipo} {...register("tipo")}>
                  {TIPOS_PROYECTO.map((t) => (
                    <option key={t} value={t}>
                      {TIPO_PROYECTO[t]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tu rol" htmlFor="rol" error={errors.rol?.message}>
                <Input id="rol" icono={UserRound} invalid={!!errors.rol} {...register("rol")} />
              </Field>
              <Field label="Fecha de inicio" htmlFor="fecha" error={errors.fecha?.message}>
                <Input id="fecha" type="month" invalid={!!errors.fecha} {...register("fecha")} />
              </Field>
            </div>

            <Field label="Resumen" htmlFor="resumen" error={errors.resumen?.message}>
              <Textarea id="resumen" rows={2} invalid={!!errors.resumen} {...register("resumen")} />
              <PieCampo
                izquierda="Lo que se lee en la tarjeta y arriba del detalle"
                derecha={`${v.resumen.length} / 160`}
                pasado={v.resumen.length > 160}
              />
            </Field>
          </Seccion>

          <Seccion
            icono={BookOpen}
            tono="aviso"
            titulo="La historia"
            descripcion="Lo que se lee en el detalle del proyecto"
          >
            <Field
              label="Descripción"
              htmlFor="descripcion"
              ayuda="separá los párrafos con una línea en blanco"
              error={errors.descripcion?.message}
            >
              <Textarea id="descripcion" rows={14} invalid={!!errors.descripcion} {...register("descripcion")} />
              <PieCampo
                izquierda={`${contarParrafos(v.descripcion)} párrafos`}
                derecha={`${v.descripcion.length.toLocaleString("es-AR")} / 5.000 caracteres`}
                pasado={v.descripcion.length > 5000}
              />
            </Field>
          </Seccion>

          <Seccion icono={Layers} tono="exito" titulo="Tecnologías" descripcion="Con qué lo hiciste">
            <Field
              label="Tecnologías"
              htmlFor="tecnologias"
              ayuda={`${tecnologias.length} · escribí una y apretá Enter`}
              error={errors.tecnologias?.message}
            >
              <Controller
                control={control}
                name="tecnologias"
                render={({ field }) => (
                  <CampoFichas
                    id="tecnologias"
                    valores={aLineas(field.value)}
                    onCambio={(lista) => field.onChange(lista.join("\n"))}
                    placeholder="Agregar tecnología…"
                    invalid={!!errors.tecnologias}
                  />
                )}
              />
            </Field>
          </Seccion>

          <Seccion icono={Link2} tono="rosa" titulo="Enlaces" descripcion="Dónde está el código y el APK de prueba">
            <ListaEditable
              titulo="Repositorios"
              error={errors.repositorios?.root?.message}
              textoAgregar="Agregar repositorio"
              onAgregar={() => repositorios.append({ nombre: "", url: "" })}
            >
              {repositorios.fields.map((campo, i) => (
                <FilaEditable
                  key={campo.id}
                  className="bg-fondo"
                  etiquetaQuitar={`Quitar repositorio ${i + 1}`}
                  onQuitar={() => repositorios.remove(i)}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Nombre"
                      htmlFor={`repo-nombre-${i}`}
                      error={errors.repositorios?.[i]?.nombre?.message}
                    >
                      <Input
                        id={`repo-nombre-${i}`}
                        placeholder="Ej.: API (Node.js) o APK de prueba (Android)"
                        invalid={!!errors.repositorios?.[i]?.nombre}
                        {...register(`repositorios.${i}.nombre`)}
                      />
                    </Field>
                    <Field label="URL" htmlFor={`repo-url-${i}`} error={errors.repositorios?.[i]?.url?.message}>
                      <Input
                        id={`repo-url-${i}`}
                        type="url"
                        icono={FolderGit2}
                        invalid={!!errors.repositorios?.[i]?.url}
                        {...register(`repositorios.${i}.url`)}
                      />
                    </Field>
                  </div>
                </FilaEditable>
              ))}
            </ListaEditable>
          </Seccion>

          <Seccion
            icono={Images}
            tono="secundario"
            titulo="Imágenes y documentos"
            descripcion="La portada, la galería y los PDF"
          >
            {fotos.aviso && <Alert tipo={fotos.aviso.tipo}>{fotos.aviso.texto}</Alert>}
            {/* La portada a todo el ancho y su descripción debajo; después, la galería */}
            <div className="grid gap-4">
              <Field label="Portada" htmlFor="portadaUrl" error={errors.portadaUrl?.message}>
                <Controller
                  control={control}
                  name="portadaUrl"
                  render={({ field }) => (
                    <CampoArchivo
                      id="portadaUrl"
                      tipo="imagen"
                      vista="recuadro"
                      textoVacio="Subí la portada"
                      ayudaVacio="Es la foto de la tarjeta y del detalle"
                      carpeta={carpeta}
                      valor={field.value}
                      onCambio={field.onChange}
                      onQuitar={() => fotos.quitar(field.value, () => field.onChange(""))}
                      quitando={!!field.value && fotos.eliminando === field.value}
                      invalid={!!errors.portadaUrl}
                    />
                  )}
                />
              </Field>

              <Field
                label="Descripción de la portada"
                htmlFor="portadaAlt"
                ayuda="para quien no la ve"
                error={errors.portadaAlt?.message}
              >
                <Input
                  id="portadaAlt"
                  placeholder="Qué se ve en la foto"
                  invalid={!!errors.portadaAlt}
                  {...register("portadaAlt")}
                />
              </Field>
            </div>

            <GaleriaFotos
              fotos={galeria.fields.map((campo, i) => ({
                id: campo.id,
                url: v.galeria[i]?.url ?? "",
                errorUrl: errors.galeria?.[i]?.url?.message,
                errorDescripcion: errors.galeria?.[i]?.alt?.message,
              }))}
              descripcion={(i) => register(`galeria.${i}.alt`)}
              onAgregar={(urls) => galeria.append(urls.map((url) => ({ url, alt: "" })))}
              onElegir={(i, url) => galeria.update(i, { url, alt: v.galeria[i]?.alt ?? "" })}
              onQuitar={(i) => fotos.quitar(v.galeria[i]?.url ?? "", () => galeria.remove(i))}
              quitando={fotos.eliminando}
              error={errors.galeria?.root?.message}
            />

            <ListaEditable
              titulo="Documentos"
              error={errors.documentos?.root?.message}
              ayuda="Por ejemplo, el manual de usuario. Solo PDF, hasta 10 MB."
              textoAgregar="Agregar documento"
              onAgregar={() => documentos.append({ url: "", titulo: "" })}
            >
              {documentos.fields.map((campo, i) => (
                <FilaEditable
                  key={campo.id}
                  className="bg-fondo"
                  etiquetaQuitar={`Quitar documento ${i + 1}`}
                  onQuitar={() => documentos.remove(i)}
                >
                  {/* El PDF sin su link: el ícono, el título y debajo si está guardado o se sube al guardar */}
                  <Controller
                    control={control}
                    name={`documentos.${i}.url`}
                    render={({ field }) => (
                      <CampoPdf
                        id={`doc-url-${i}`}
                        carpeta={carpeta}
                        valor={field.value}
                        onCambio={field.onChange}
                        error={errors.documentos?.[i]?.url?.message}
                      >
                        <Field
                          label="Título"
                          htmlFor={`doc-titulo-${i}`}
                          error={errors.documentos?.[i]?.titulo?.message}
                        >
                          <Input
                            id={`doc-titulo-${i}`}
                            invalid={!!errors.documentos?.[i]?.titulo}
                            {...register(`documentos.${i}.titulo`)}
                          />
                        </Field>
                      </CampoPdf>
                    )}
                  />
                </FilaEditable>
              ))}
            </ListaEditable>
          </Seccion>
        </CuerpoFormulario>
      </form>
    </SubidasPendientesContexto.Provider>
  );
}
