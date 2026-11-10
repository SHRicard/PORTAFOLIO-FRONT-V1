import { useMemo, useState } from "react";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Award,
  BadgeCheck,
  BookOpen,
  CalendarCheck,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Landmark,
  ListChecks,
  Send,
  Shapes,
} from "lucide-react";
import { CampoPdf } from "@/features/archivos/CampoPdf";
import { SubidasPendientesContexto, useSubidasPendientes } from "@/features/archivos/subidasPendientes";
import { estadoEstudio, parrafos, TIPO_ESTUDIO } from "@/features/portafolio/formato";
import { getErrorMessage } from "@/lib/errors";
import { Field } from "@/components/ui/Field";
import {
  AccionesDeMuestra,
  AvisosFormulario,
  BarraFormulario,
  CajaLado,
  CuerpoFormulario,
  LoQueTiene,
  PieCampo,
  Seccion,
  useEnfocarError,
} from "@/components/ui/FormularioPanel";
import { Input } from "@/components/ui/Input";
import { Interruptor } from "@/components/ui/Interruptor";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FilaEstudio } from "./FilaEstudio";
import {
  aEstudioInput,
  aFormulario,
  estadoDe,
  ESTUDIO_VACIO,
  estudioSchema,
  queFalta,
  TIPOS_ESTUDIO,
  type EstudioFormValues,
} from "./schemas";
import type { Estudio } from "./types";

interface EstudioFormProps {
  /** Sin estudio: formulario para agregar uno nuevo */
  estudio?: Estudio;
  guardando: boolean;
  errorGeneral: string | null;
  textoGuardar: string;
  /** Recibe setError para marcar los campos que rechace el backend */
  onGuardar: (valores: EstudioFormValues, setError: UseFormSetError<EstudioFormValues>) => void;
  /** A dónde lleva «Volver», el botón rojo de la barra (ej. "/admin/estudios"). Sin él, no va */
  volverA?: string;
}

/**
 * El formulario de un estudio, con el formato del de proyectos («Con vista previa», piezas de `FormularioPanel`):
 * arriba, la barra con el nombre, si se ve en la web, «Volver» y «Guardar»; a la izquierda, el formulario en
 * secciones; a la derecha, la fila tal como queda en la lista (cambia mientras se escribe), la publicación y lo
 * que tiene. El PDF del certificado se sube al guardar
 */
export function EstudioForm({ estudio, guardando, errorGeneral, textoGuardar, onGuardar, volverA }: EstudioFormProps) {
  const values = useMemo(() => (estudio ? aFormulario(estudio) : undefined), [estudio]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<EstudioFormValues>({
    resolver: zodResolver(estudioSchema),
    defaultValues: ESTUDIO_VACIO,
    values,
    // El foco lo maneja el formulario: así también va al campo que rechace el backend
    shouldFocusError: false,
  });

  // El PDF elegido no se sube al elegirlo: se sube al tocar «Guardar»
  const subidas = useSubidasPendientes();
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const v = watch();
  const falta = queFalta({ descripcion: v.descripcion, certificado: aEstudioInput(v).certificado ?? null });
  const titulo = v.titulo.trim() || (estudio ? "Sin título" : "Nuevo estudio");
  const conCertificado = v.certificadoUrl.startsWith("https://") || !!subidas.pendiente(v.certificadoUrl);

  // Al guardar con errores (los del esquema o los que devuelva el backend), enfoca el primer campo marcado
  const foco = useEnfocarError(Object.keys(errors).join());
  const enviar = handleSubmit(
    async (valores) => {
      foco.buscar(); // por si el backend rechaza algún campo
      setErrorSubida(null);
      let conLinks: EstudioFormValues;
      try {
        // Primero se sube a Cloudinary el PDF elegido
        conLinks = await subidas.subir(valores, "estudios");
      } catch (err) {
        setErrorSubida(`No se pudo subir el certificado: ${getErrorMessage(err)}`);
        return;
      }
      onGuardar(conLinks, setError);
    },
    () => foco.buscar(),
  );

  const loQueTiene = [
    {
      ok: Boolean(v.titulo.trim() && v.institucion.trim()),
      si: "Título e institución",
      no: "Falta el título o la institución",
    },
    { ok: Boolean(v.desde), si: "Fechas", no: "Falta desde cuándo" },
    { ok: Boolean(v.descripcion.trim()), si: "Descripción", no: "Falta la descripción" },
    { ok: conCertificado, si: "Certificado", no: "Sin certificado" },
    { ok: Boolean(v.urlVerificacion.trim()), si: "Link de verificación", no: "Sin link de verificación" },
  ];

  return (
    <SubidasPendientesContexto.Provider value={subidas}>
      {/* Al enfocar un campo, que no quede debajo de la barra pegada */}
      <form noValidate onSubmit={enviar} className="[&_:is(input,textarea,select)]:scroll-mt-28">
        <BarraFormulario
          titulo={titulo}
          estado={estadoDe(v.publicado)}
          volver={volverA ? { a: volverA, etiqueta: "Volver a estudios" } : undefined}
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
                  <FilaEstudio
                    encabezado="h3"
                    titulo={v.titulo}
                    institucion={v.institucion}
                    tipo={v.tipo}
                    desde={v.desde}
                    hasta={v.hasta}
                    finalizado={v.finalizado}
                    publicado={v.publicado}
                    falta={falta}
                    acciones={<AccionesDeMuestra conVer={false} />}
                  />
                </div>
              </CajaLado>

              <CajaLado icono={Send} titulo="Publicación">
                <Interruptor
                  titulo="Mostrar en la web"
                  descripcion="Apagado, queda oculto: solo lo ves en el panel"
                  icono={<Globe className="size-4 text-exito" aria-hidden />}
                  {...register("publicado")}
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
            descripcion="Qué estudiaste, dónde, cuándo y si lo terminaste"
          >
            {/* Los tres del mismo ancho: en una fila si la sección es ancha, de a dos si no entran */}
            <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
              <Field label="Título" htmlFor="titulo" error={errors.titulo?.message}>
                <Input id="titulo" icono={GraduationCap} invalid={!!errors.titulo} {...register("titulo")} />
              </Field>
              <Field label="Institución" htmlFor="institucion" error={errors.institucion?.message}>
                <Input id="institucion" icono={Landmark} invalid={!!errors.institucion} {...register("institucion")} />
              </Field>
              <Field label="Tipo" htmlFor="tipo" error={errors.tipo?.message}>
                <Select id="tipo" icono={Shapes} invalid={!!errors.tipo} {...register("tipo")}>
                  {TIPOS_ESTUDIO.map((t) => (
                    <option key={t} value={t}>
                      {TIPO_ESTUDIO[t]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
              <Field label="Desde" htmlFor="desde" error={errors.desde?.message}>
                <Input id="desde" type="month" invalid={!!errors.desde} {...register("desde")} />
              </Field>
              <Field label="Hasta" htmlFor="hasta" ayuda="vacío: en curso" error={errors.hasta?.message}>
                <Input id="hasta" type="month" invalid={!!errors.hasta} {...register("hasta")} />
              </Field>
              {/* Con fecha de fin y apagado, el estudio queda incompleto: el texto dice cómo se va a ver. Arriba, a la
                altura de las fechas (debajo de «Hasta» va su ayuda) */}
              <Interruptor
                titulo="Finalizado"
                descripcion={`Se muestra como «${estadoEstudio({ hasta: v.hasta || null, finalizado: v.finalizado })}»`}
                icono={<CalendarCheck className="size-4 text-exito" aria-hidden />}
                className="self-start @lg:col-span-2 @4xl:col-span-1"
                {...register("finalizado")}
              />
            </div>
          </Seccion>

          <Seccion icono={BookOpen} tono="aviso" titulo="Lo que aprendiste" descripcion="Lo que se lee de este estudio">
            <Field
              label="Descripción"
              htmlFor="descripcion"
              ayuda="separá los párrafos con una línea en blanco"
              error={errors.descripcion?.message}
            >
              <Textarea id="descripcion" rows={8} invalid={!!errors.descripcion} {...register("descripcion")} />
              <PieCampo
                izquierda={`${parrafos(v.descripcion).length} párrafos`}
                derecha={`${v.descripcion.length.toLocaleString("es-AR")} / 2.000 caracteres`}
                pasado={v.descripcion.length > 2000}
              />
            </Field>
          </Seccion>

          <Seccion icono={Award} tono="rosa" titulo="Certificado" descripcion="El PDF y el link para verificarlo">
            <Field label="Certificado (PDF)" htmlFor="certificadoUrl">
              <Controller
                control={control}
                name="certificadoUrl"
                render={({ field }) => (
                  <CampoPdf
                    id="certificadoUrl"
                    quitable
                    valor={field.value}
                    onCambio={field.onChange}
                    error={errors.certificadoUrl?.message}
                  />
                )}
              />
            </Field>

            <Field label="Link de verificación" htmlFor="urlVerificacion" error={errors.urlVerificacion?.message}>
              <Input
                id="urlVerificacion"
                type="url"
                icono={BadgeCheck}
                placeholder="https://..."
                invalid={!!errors.urlVerificacion}
                {...register("urlVerificacion")}
              />
            </Field>
          </Seccion>
        </CuerpoFormulario>
      </form>
    </SubidasPendientesContexto.Provider>
  );
}
