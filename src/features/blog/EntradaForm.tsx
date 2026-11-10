import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Eye, FileText, Globe, Hash, Images, ListChecks, PencilLine, Send, Type } from "lucide-react";
import { CampoArchivo } from "@/features/archivos/CampoArchivo";
import { CampoPdf } from "@/features/archivos/CampoPdf";
import { GaleriaFotos } from "@/features/archivos/GaleriaFotos";
import { SubidasPendientesContexto, useSubidasPendientes } from "@/features/archivos/subidasPendientes";
import { parrafos } from "@/features/portafolio/formato";
import { getErrorMessage } from "@/lib/errors";
import { aLineas, carpetaDe } from "@/lib/validaciones";
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
import { FilaEditable, ListaEditable } from "@/components/ui/ListaEditable";
import { Textarea } from "@/components/ui/Textarea";
import { FilaEntrada } from "./FilaEntrada";
import {
  aEntradaInput,
  aFormulario,
  ENTRADA_VACIA,
  entradaSchema,
  ESTADO_AYUDA,
  ESTADO_ESTILO,
  ESTADO_LABELS,
  ESTADOS_ENTRADA,
  queFalta,
  type EntradaFormValues,
} from "./schemas";
import type { Entrada } from "./types";

interface EntradaFormProps {
  /** Sin entrada: formulario para crear una nueva */
  entrada?: Entrada;
  guardando: boolean;
  errorGeneral: string | null;
  textoGuardar: string;
  /** Recibe setError para marcar los campos que rechace el backend */
  onGuardar: (valores: EntradaFormValues, setError: UseFormSetError<EntradaFormValues>) => void;
  /** A dónde lleva «Volver», el botón rojo de la barra (ej. "/admin/blog"). Sin él, no va */
  volverA?: string;
}

/** El color del punto de cada estado y qué ícono acompaña su ayuda */
const TONO_ESTADO = { borrador: "neutro", publicado: "exito" } as const;
const ICONO_ESTADO = { borrador: PencilLine, publicado: Globe };

/**
 * El formulario de una entrada del blog, con el formato del de proyectos («Con vista previa», piezas de
 * `FormularioPanel`): arriba, la barra con el nombre, el estado, «Volver», «Ver en la web» y «Guardar»; a la
 * izquierda, el formulario en secciones; a la derecha, la fila tal como queda en la lista (cambia mientras se
 * escribe), la publicación y lo que tiene. Las fotos y los PDF se suben al guardar
 */
export function EntradaForm({ entrada, guardando, errorGeneral, textoGuardar, onGuardar, volverA }: EntradaFormProps) {
  const values = useMemo(() => (entrada ? aFormulario(entrada) : undefined), [entrada]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<EntradaFormValues>({
    resolver: zodResolver(entradaSchema),
    defaultValues: ENTRADA_VACIA,
    values,
    // El foco lo maneja el formulario: así también va al campo que rechace el backend
    shouldFocusError: false,
  });

  // Las fotos y los PDF elegidos no se suben al elegirlos: se suben al tocar «Guardar»
  const subidas = useSubidasPendientes();
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const galeria = useFieldArray({ control, name: "galeria" });
  const documentos = useFieldArray({ control, name: "documentos" });

  const v = watch();
  // Una entrada nueva todavía no tiene slug: la carpeta sale del título, como el slug que va a armar el backend
  const carpeta = carpetaDe("blogs", entrada?.slug ?? "", v.titulo);
  const borrador = aEntradaInput(v);
  const falta = queFalta({
    portada: borrador.portada ?? null,
    galeria: borrador.galeria ?? [],
    documentos: borrador.documentos ?? [],
  });
  const etiquetas = aLineas(v.etiquetas);
  const titulo = v.titulo.trim() || (entrada ? "Sin título" : "Nueva entrada");
  const enlaceWeb = entrada?.estado === "publicado" ? `/blog/${entrada.slug}` : undefined;

  // Al guardar con errores (los del esquema o los que devuelva el backend), enfoca el primer campo marcado
  const foco = useEnfocarError(Object.keys(errors).join());

  const enviar = handleSubmit(
    async (valores) => {
      foco.buscar(); // por si el backend rechaza algún campo
      setErrorSubida(null);
      let conLinks: EntradaFormValues;
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

  const loQueTiene = [
    { ok: Boolean(v.titulo.trim() && v.resumen.trim()), si: "Título y resumen", no: "Falta el título o el resumen" },
    { ok: Boolean(v.contenido.trim()), si: "Contenido", no: "Falta el contenido" },
    {
      ok: etiquetas.length > 0,
      si: `${etiquetas.length} ${etiquetas.length === 1 ? "etiqueta" : "etiquetas"}`,
      no: "Sin etiquetas",
    },
    {
      ok: v.portadaUrl.startsWith("https://") || !!subidas.pendiente(v.portadaUrl),
      si: "Portada",
      no: "Falta la portada",
    },
  ];

  return (
    <SubidasPendientesContexto.Provider value={subidas}>
      {/* Al enfocar un campo, que no quede debajo de la barra pegada */}
      <form noValidate onSubmit={enviar} className="[&_:is(input,textarea,select)]:scroll-mt-28">
        <BarraFormulario
          titulo={titulo}
          estado={{ etiqueta: ESTADO_LABELS[v.estado], estilo: ESTADO_ESTILO[v.estado] }}
          volver={volverA ? { a: volverA, etiqueta: "Volver al blog" } : undefined}
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
                  <FilaEntrada
                    encabezado="h3"
                    titulo={titulo}
                    estado={v.estado}
                    resumen={v.resumen}
                    etiquetas={etiquetas}
                    publicadoEn={entrada?.publicadoEn ?? null}
                    portada={v.portadaUrl ? { url: v.portadaUrl, alt: v.portadaAlt } : null}
                    falta={falta}
                    acciones={<AccionesDeMuestra conVer={v.estado === "publicado"} />}
                  />
                </div>
              </CajaLado>

              <CajaLado icono={Send} titulo="Publicación">
                <OpcionesEstado
                  opciones={ESTADOS_ENTRADA.map((e) => ({
                    valor: e,
                    etiqueta: ESTADO_LABELS[e],
                    tono: TONO_ESTADO[e],
                  }))}
                  registro={register("estado")}
                  ayuda={{ icono: ICONO_ESTADO[v.estado], texto: ESTADO_AYUDA[v.estado] }}
                  error={errors.estado?.message}
                />
              </CajaLado>

              {/* En el celular no va: ahí la columna está debajo del formulario */}
              <CajaLado icono={ListChecks} titulo="Lo que tiene" className="hidden lg:grid">
                <LoQueTiene items={loQueTiene} />
              </CajaLado>
            </>
          }
        >
          <Seccion icono={FileText} tono="info" titulo="Datos principales" descripcion="El título y de qué se trata">
            <Field label="Título" htmlFor="titulo" error={errors.titulo?.message}>
              <Input id="titulo" icono={Type} invalid={!!errors.titulo} {...register("titulo")} />
            </Field>

            <Field label="Resumen" htmlFor="resumen" error={errors.resumen?.message}>
              <Textarea id="resumen" rows={2} invalid={!!errors.resumen} {...register("resumen")} />
              <PieCampo
                izquierda="Lo que se lee en la lista y arriba de la entrada"
                derecha={`${v.resumen.length} / 200`}
                pasado={v.resumen.length > 200}
              />
            </Field>
          </Seccion>

          <Seccion icono={BookOpen} tono="aviso" titulo="El contenido" descripcion="Lo que se lee al abrir la entrada">
            <Field
              label="Contenido"
              htmlFor="contenido"
              ayuda="separá los párrafos con una línea en blanco"
              error={errors.contenido?.message}
            >
              <Textarea id="contenido" rows={14} invalid={!!errors.contenido} {...register("contenido")} />
              <PieCampo
                izquierda={`${parrafos(v.contenido).length} párrafos`}
                derecha={`${v.contenido.length.toLocaleString("es-AR")} / 20.000 caracteres`}
                pasado={v.contenido.length > 20000}
              />
            </Field>
          </Seccion>

          <Seccion icono={Hash} tono="exito" titulo="Etiquetas" descripcion="De qué temas habla, hasta 10">
            <Field
              label="Etiquetas"
              htmlFor="etiquetas"
              ayuda={`${etiquetas.length} de 10 · escribí una y apretá Enter`}
              error={errors.etiquetas?.message}
            >
              <Controller
                control={control}
                name="etiquetas"
                render={({ field }) => (
                  <CampoFichas
                    id="etiquetas"
                    valores={aLineas(field.value)}
                    onCambio={(lista) => field.onChange(lista.join("\n"))}
                    placeholder="Agregar etiqueta…"
                    invalid={!!errors.etiquetas}
                  />
                )}
              />
            </Field>
          </Seccion>

          <Seccion
            icono={Images}
            tono="secundario"
            titulo="Imágenes y archivos"
            descripcion="La portada, la galería y los PDF adjuntos"
          >
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
                      ayudaVacio="Es la foto de la lista y de arriba de la entrada"
                      carpeta={carpeta}
                      valor={field.value}
                      onCambio={field.onChange}
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

            {/* El blog no tiene cómo borrar una foto guardada en el momento: quitarla la saca del formulario,
                y el archivo sigue en Archivos */}
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
              onQuitar={(i) => galeria.remove(i)}
              error={errors.galeria?.root?.message}
            />

            <ListaEditable
              titulo="Archivos adjuntos"
              error={errors.documentos?.root?.message}
              ayuda="Solo PDF, hasta 10 MB."
              textoAgregar="Agregar archivo"
              onAgregar={() => documentos.append({ url: "", titulo: "" })}
            >
              {documentos.fields.map((campo, i) => (
                <FilaEditable
                  key={campo.id}
                  className="bg-fondo"
                  etiquetaQuitar={`Quitar archivo ${i + 1}`}
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
