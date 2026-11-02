import { useMemo, type ReactNode } from "react";
import { Controller, useFieldArray, useForm, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampoArchivo } from "@/features/archivos/CampoArchivo";
import { TIENDA, TIPO_PROYECTO } from "@/features/portafolio/formato";
import { carpetaDe } from "@/lib/validaciones";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Casilla } from "@/components/ui/Casilla";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { FilaEditable, ListaEditable } from "@/components/ui/ListaEditable";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  aFormulario,
  ESTADO_AYUDA,
  ESTADO_LABELS,
  ESTADOS_PROYECTO,
  PROYECTO_VACIO,
  proyectoSchema,
  TIENDAS,
  TIPOS_PROYECTO,
  type ProyectoFormValues,
} from "./schemas";
import type { Proyecto } from "./types";

interface ProyectoFormProps {
  /** Sin proyecto: formulario para crear uno nuevo */
  proyecto?: Proyecto;
  guardando: boolean;
  errorGeneral: string | null;
  textoGuardar: string;
  /** Recibe setError para marcar los campos que rechace el backend */
  onGuardar: (valores: ProyectoFormValues, setError: UseFormSetError<ProyectoFormValues>) => void;
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Card className="space-y-4">
      <h2 className="font-subtitulo text-lg font-semibold text-texto">{titulo}</h2>
      {children}
    </Card>
  );
}

export function ProyectoForm({ proyecto, guardando, errorGeneral, textoGuardar, onGuardar }: ProyectoFormProps) {
  const values = useMemo(() => (proyecto ? aFormulario(proyecto) : undefined), [proyecto]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<ProyectoFormValues>({ resolver: zodResolver(proyectoSchema), defaultValues: PROYECTO_VACIO, values });

  const repositorios = useFieldArray({ control, name: "repositorios" });
  const tiendas = useFieldArray({ control, name: "tiendas" });
  const galeria = useFieldArray({ control, name: "galeria" });
  const documentos = useFieldArray({ control, name: "documentos" });

  const estado = watch("estado");
  const slug = proyecto?.slug ?? watch("slug");
  const carpeta = carpetaDe("proyectos", slug, watch("titulo"));
  const carpetaApk = carpetaDe("apk", slug, watch("titulo"));

  return (
    <form noValidate onSubmit={handleSubmit((valores) => onGuardar(valores, setError))} className="space-y-6">
      <Seccion titulo="Datos principales">
        <Field label="Título" htmlFor="titulo" error={errors.titulo?.message}>
          <Input id="titulo" invalid={!!errors.titulo} {...register("titulo")} />
        </Field>

        <Field label="Slug (la dirección del proyecto en la web)" htmlFor="slug" error={errors.slug?.message}>
          <Input
            id="slug"
            placeholder={proyecto ? undefined : "Vacío: se arma solo desde el título"}
            invalid={!!errors.slug}
            {...register("slug")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tipo" htmlFor="tipo" error={errors.tipo?.message}>
            <Select id="tipo" invalid={!!errors.tipo} {...register("tipo")}>
              {TIPOS_PROYECTO.map((t) => (
                <option key={t} value={t}>
                  {TIPO_PROYECTO[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tu rol" htmlFor="rol" error={errors.rol?.message}>
            <Input id="rol" invalid={!!errors.rol} {...register("rol")} />
          </Field>
          <Field label="Fecha de inicio" htmlFor="fecha" error={errors.fecha?.message}>
            <Input id="fecha" type="month" invalid={!!errors.fecha} {...register("fecha")} />
          </Field>
        </div>

        <Field label="Resumen (para la tarjeta, hasta 160 caracteres)" htmlFor="resumen" error={errors.resumen?.message}>
          <Textarea id="resumen" rows={2} invalid={!!errors.resumen} {...register("resumen")} />
        </Field>

        <Field
          label="Descripción (separá los párrafos con una línea en blanco)"
          htmlFor="descripcion"
          error={errors.descripcion?.message}
        >
          <Textarea id="descripcion" rows={12} invalid={!!errors.descripcion} {...register("descripcion")} />
        </Field>

        <Field label="Tecnologías (una por línea)" htmlFor="tecnologias" error={errors.tecnologias?.message}>
          <Textarea id="tecnologias" rows={6} invalid={!!errors.tecnologias} {...register("tecnologias")} />
        </Field>
      </Seccion>

      <Seccion titulo="Enlaces">
        <Field label="Demo pública" htmlFor="demo" error={errors.demo?.message}>
          <Input id="demo" type="url" placeholder="https://..." invalid={!!errors.demo} {...register("demo")} />
        </Field>

        <Casilla label='Mostrar "Pedí una demo por Meet"' {...register("demoPorSolicitud")} />

        <ListaEditable
          titulo="Repositorios"
          error={errors.repositorios?.root?.message}
          textoAgregar="Agregar repositorio"
          onAgregar={() => repositorios.append({ nombre: "", url: "" })}
        >
          {repositorios.fields.map((campo, i) => (
            <FilaEditable
              key={campo.id}
              etiquetaQuitar={`Quitar repositorio ${i + 1}`}
              onQuitar={() => repositorios.remove(i)}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Nombre"
                  htmlFor={`repo-nombre-${i}`}
                  error={errors.repositorios?.[i]?.nombre?.message}
                >
                  <Input id={`repo-nombre-${i}`} {...register(`repositorios.${i}.nombre`)} />
                </Field>
                <Field label="URL" htmlFor={`repo-url-${i}`} error={errors.repositorios?.[i]?.url?.message}>
                  <Input id={`repo-url-${i}`} type="url" {...register(`repositorios.${i}.url`)} />
                </Field>
              </div>
            </FilaEditable>
          ))}
        </ListaEditable>

        <ListaEditable
          titulo="Tiendas de apps"
          error={errors.tiendas?.root?.message}
          ayuda="Sin link todavía no se muestra en la web."
          textoAgregar="Agregar tienda"
          onAgregar={() => tiendas.append({ tienda: "playStore", app: "", url: "" })}
        >
          {tiendas.fields.map((campo, i) => (
            <FilaEditable key={campo.id} etiquetaQuitar={`Quitar tienda ${i + 1}`} onQuitar={() => tiendas.remove(i)}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Tienda" htmlFor={`tienda-${i}`} error={errors.tiendas?.[i]?.tienda?.message}>
                  <Select id={`tienda-${i}`} {...register(`tiendas.${i}.tienda`)}>
                    {TIENDAS.map((t) => (
                      <option key={t} value={t}>
                        {TIENDA[t]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="App" htmlFor={`tienda-app-${i}`} error={errors.tiendas?.[i]?.app?.message}>
                  <Input id={`tienda-app-${i}`} {...register(`tiendas.${i}.app`)} />
                </Field>
                <Field label="URL" htmlFor={`tienda-url-${i}`} error={errors.tiendas?.[i]?.url?.message}>
                  <Input id={`tienda-url-${i}`} type="url" {...register(`tiendas.${i}.url`)} />
                </Field>
              </div>
            </FilaEditable>
          ))}
        </ListaEditable>

        <Field label="APK de demo (hasta 200 MB)" htmlFor="apkUrl" error={errors.apkUrl?.message}>
          <Controller
            control={control}
            name="apkUrl"
            render={({ field }) => (
              <CampoArchivo
                id="apkUrl"
                tipo="apk"
                carpeta={carpetaApk}
                valor={field.value}
                onCambio={field.onChange}
                invalid={!!errors.apkUrl}
              />
            )}
          />
        </Field>
        <Field label="Nota de la APK" htmlFor="apkNota" error={errors.apkNota?.message}>
          <Textarea id="apkNota" rows={2} invalid={!!errors.apkNota} {...register("apkNota")} />
        </Field>
      </Seccion>

      <Seccion titulo="Imágenes y documentos">
        <Field label="Portada" htmlFor="portadaUrl" error={errors.portadaUrl?.message}>
          <Controller
            control={control}
            name="portadaUrl"
            render={({ field }) => (
              <CampoArchivo
                id="portadaUrl"
                tipo="imagen"
                carpeta={carpeta}
                valor={field.value}
                onCambio={field.onChange}
                invalid={!!errors.portadaUrl}
              />
            )}
          />
        </Field>
        <Field label="Descripción de la portada" htmlFor="portadaAlt" error={errors.portadaAlt?.message}>
          <Input id="portadaAlt" invalid={!!errors.portadaAlt} {...register("portadaAlt")} />
        </Field>

        <ListaEditable
          titulo="Galería"
          error={errors.galeria?.root?.message}
          textoAgregar="Agregar imagen"
          onAgregar={() => galeria.append({ url: "", alt: "" })}
        >
          {galeria.fields.map((campo, i) => (
            <FilaEditable key={campo.id} etiquetaQuitar={`Quitar imagen ${i + 1}`} onQuitar={() => galeria.remove(i)}>
              <Field label="Imagen" htmlFor={`galeria-url-${i}`} error={errors.galeria?.[i]?.url?.message}>
                <Controller
                  control={control}
                  name={`galeria.${i}.url`}
                  render={({ field }) => (
                    <CampoArchivo
                      id={`galeria-url-${i}`}
                      tipo="imagen"
                      carpeta={carpeta}
                      valor={field.value}
                      onCambio={field.onChange}
                    />
                  )}
                />
              </Field>
              <Field label="Descripción" htmlFor={`galeria-alt-${i}`} error={errors.galeria?.[i]?.alt?.message}>
                <Input id={`galeria-alt-${i}`} {...register(`galeria.${i}.alt`)} />
              </Field>
            </FilaEditable>
          ))}
        </ListaEditable>

        <ListaEditable
          titulo="Documentos"
          error={errors.documentos?.root?.message}
          ayuda="Por ejemplo, el manual de usuario. Solo PDF."
          textoAgregar="Agregar documento"
          onAgregar={() => documentos.append({ url: "", titulo: "" })}
        >
          {documentos.fields.map((campo, i) => (
            <FilaEditable
              key={campo.id}
              etiquetaQuitar={`Quitar documento ${i + 1}`}
              onQuitar={() => documentos.remove(i)}
            >
              <Field label="Título" htmlFor={`doc-titulo-${i}`} error={errors.documentos?.[i]?.titulo?.message}>
                <Input id={`doc-titulo-${i}`} {...register(`documentos.${i}.titulo`)} />
              </Field>
              <Field label="Archivo" htmlFor={`doc-url-${i}`} error={errors.documentos?.[i]?.url?.message}>
                <Controller
                  control={control}
                  name={`documentos.${i}.url`}
                  render={({ field }) => (
                    <CampoArchivo
                      id={`doc-url-${i}`}
                      tipo="documento"
                      carpeta={carpeta}
                      valor={field.value}
                      onCambio={field.onChange}
                    />
                  )}
                />
              </Field>
            </FilaEditable>
          ))}
        </ListaEditable>
      </Seccion>

      <Seccion titulo="Publicación">
        <Field label="Estado" htmlFor="estado" error={errors.estado?.message}>
          <Select id="estado" invalid={!!errors.estado} {...register("estado")}>
            {ESTADOS_PROYECTO.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABELS[e]}
              </option>
            ))}
          </Select>
        </Field>
        <p className="text-sm text-texto-suave">{ESTADO_AYUDA[estado]}</p>
        <Casilla label="Destacado" {...register("destacado")} />
      </Seccion>

      {errorGeneral && <Alert tipo="error">{errorGeneral}</Alert>}
      {Object.keys(errors).length > 0 && <Alert tipo="error">Revisá los campos marcados.</Alert>}

      <Button type="submit" cargando={guardando}>
        {textoGuardar}
      </Button>
    </form>
  );
}
