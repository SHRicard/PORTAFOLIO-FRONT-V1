import { useMemo, type ReactNode } from "react";
import { Controller, useFieldArray, useForm, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CampoArchivo } from "@/features/archivos/CampoArchivo";
import { carpetaDe } from "@/lib/validaciones";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { FilaEditable, ListaEditable } from "@/components/ui/ListaEditable";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  aFormulario,
  ENTRADA_VACIA,
  entradaSchema,
  ESTADO_AYUDA,
  ESTADO_LABELS,
  ESTADOS_ENTRADA,
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
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Card className="space-y-4">
      <h2 className="font-subtitulo text-lg font-semibold text-texto">{titulo}</h2>
      {children}
    </Card>
  );
}

export function EntradaForm({ entrada, guardando, errorGeneral, textoGuardar, onGuardar }: EntradaFormProps) {
  const values = useMemo(() => (entrada ? aFormulario(entrada) : undefined), [entrada]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<EntradaFormValues>({ resolver: zodResolver(entradaSchema), defaultValues: ENTRADA_VACIA, values });

  const galeria = useFieldArray({ control, name: "galeria" });
  const documentos = useFieldArray({ control, name: "documentos" });

  const estado = watch("estado");
  const carpeta = carpetaDe("blogs", entrada?.slug ?? watch("slug"), watch("titulo"));

  return (
    <form noValidate onSubmit={handleSubmit((valores) => onGuardar(valores, setError))} className="space-y-6">
      <Seccion titulo="Contenido">
        <Field label="Título" htmlFor="titulo" error={errors.titulo?.message}>
          <Input id="titulo" invalid={!!errors.titulo} {...register("titulo")} />
        </Field>

        <Field label="Slug (la dirección de la entrada en la web)" htmlFor="slug" error={errors.slug?.message}>
          <Input
            id="slug"
            placeholder={entrada ? undefined : "Vacío: se arma solo desde el título"}
            invalid={!!errors.slug}
            {...register("slug")}
          />
        </Field>

        <Field label="Resumen (para la lista, hasta 200 caracteres)" htmlFor="resumen" error={errors.resumen?.message}>
          <Textarea id="resumen" rows={2} invalid={!!errors.resumen} {...register("resumen")} />
        </Field>

        <Field
          label="Contenido (separá los párrafos con una línea en blanco)"
          htmlFor="contenido"
          error={errors.contenido?.message}
        >
          <Textarea id="contenido" rows={16} invalid={!!errors.contenido} {...register("contenido")} />
        </Field>

        <Field label="Etiquetas (una por línea)" htmlFor="etiquetas" error={errors.etiquetas?.message}>
          <Textarea id="etiquetas" rows={3} invalid={!!errors.etiquetas} {...register("etiquetas")} />
        </Field>
      </Seccion>

      <Seccion titulo="Fotos y archivos">
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
          titulo="Archivos adjuntos"
          ayuda="Solo PDF."
          error={errors.documentos?.root?.message}
          textoAgregar="Agregar archivo"
          onAgregar={() => documentos.append({ url: "", titulo: "" })}
        >
          {documentos.fields.map((campo, i) => (
            <FilaEditable
              key={campo.id}
              etiquetaQuitar={`Quitar archivo ${i + 1}`}
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
            {ESTADOS_ENTRADA.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABELS[e]}
              </option>
            ))}
          </Select>
        </Field>
        <p className="text-sm text-texto-suave">{ESTADO_AYUDA[estado]}</p>
      </Seccion>

      {errorGeneral && <Alert tipo="error">{errorGeneral}</Alert>}
      {Object.keys(errors).length > 0 && <Alert tipo="error">Revisá los campos marcados.</Alert>}

      <Button type="submit" cargando={guardando}>
        {textoGuardar}
      </Button>
    </form>
  );
}
