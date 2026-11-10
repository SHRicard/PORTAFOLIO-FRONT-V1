import { useMemo } from "react";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  Building2,
  BriefcaseBusiness,
  Eye,
  FileText,
  Globe,
  Laptop,
  Layers,
  ListChecks,
  MapPin,
  Send,
  Trophy,
} from "lucide-react";
import { MODALIDAD, parrafos } from "@/features/portafolio/formato";
import { aLineas } from "@/lib/validaciones";
import { CampoFichas } from "@/components/ui/CampoFichas";
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
import { FilaExperiencia } from "./FilaExperiencia";
import {
  aFormulario,
  estadoDe,
  EXPERIENCIA_VACIA,
  experienciaSchema,
  MODALIDADES,
  queFalta,
  type ExperienciaFormValues,
} from "./schemas";
import type { Experiencia } from "./types";

interface ExperienciaFormProps {
  /** Sin experiencia: formulario para agregar un trabajo nuevo */
  experiencia?: Experiencia;
  guardando: boolean;
  errorGeneral: string | null;
  textoGuardar: string;
  /** Recibe setError para marcar los campos que rechace el backend */
  onGuardar: (valores: ExperienciaFormValues, setError: UseFormSetError<ExperienciaFormValues>) => void;
  /** A dónde lleva «Volver», el botón rojo de la barra (ej. "/admin/experiencia"). Sin él, no va */
  volverA?: string;
}

/**
 * El formulario de un trabajo, con el formato del de proyectos («Con vista previa», piezas de `FormularioPanel`):
 * arriba, la barra con el nombre, si se ve en la web, «Volver» y «Guardar»; a la izquierda, el formulario en
 * secciones; a la derecha, la fila tal como queda en la lista (cambia mientras se escribe), la publicación y lo
 * que tiene
 */
export function ExperienciaForm({
  experiencia,
  guardando,
  errorGeneral,
  textoGuardar,
  onGuardar,
  volverA,
}: ExperienciaFormProps) {
  const values = useMemo(() => (experiencia ? aFormulario(experiencia) : undefined), [experiencia]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<ExperienciaFormValues>({
    resolver: zodResolver(experienciaSchema),
    defaultValues: EXPERIENCIA_VACIA,
    values,
    // El foco lo maneja el formulario: así también va al campo que rechace el backend
    shouldFocusError: false,
  });

  const v = watch();
  const logros = aLineas(v.logros);
  const tecnologias = aLineas(v.tecnologias);
  const falta = queFalta({ descripcion: v.descripcion, logros, tecnologias });
  const nombre = [v.puesto.trim(), v.empresa.trim()].filter(Boolean).join(" en ");
  const titulo = nombre || (experiencia ? "Sin nombre" : "Nuevo trabajo");

  // Al guardar con errores (los del esquema o los que devuelva el backend), enfoca el primer campo marcado
  const foco = useEnfocarError(Object.keys(errors).join());
  const enviar = handleSubmit(
    (valores) => {
      foco.buscar(); // por si el backend rechaza algún campo
      onGuardar(valores, setError);
    },
    () => foco.buscar(),
  );

  const loQueTiene = [
    { ok: Boolean(v.empresa.trim() && v.puesto.trim()), si: "Empresa y puesto", no: "Falta la empresa o el puesto" },
    { ok: Boolean(v.desde), si: "Fechas", no: "Falta desde cuándo" },
    { ok: Boolean(v.descripcion.trim()), si: "Descripción", no: "Falta la descripción" },
    { ok: logros.length > 0, si: `${logros.length} ${logros.length === 1 ? "logro" : "logros"}`, no: "Sin logros" },
    {
      ok: tecnologias.length > 0,
      si: `${tecnologias.length} ${tecnologias.length === 1 ? "tecnología" : "tecnologías"}`,
      no: "Faltan las tecnologías",
    },
  ];

  return (
    // Al enfocar un campo, que no quede debajo de la barra pegada
    <form noValidate onSubmit={enviar} className="[&_:is(input,textarea,select)]:scroll-mt-28">
      <BarraFormulario
        titulo={titulo}
        estado={estadoDe(v.publicado)}
        volver={volverA ? { a: volverA, etiqueta: "Volver a experiencia" } : undefined}
        textoGuardar={textoGuardar}
        guardando={guardando}
      />
      <AvisosFormulario errores={[errorGeneral]} conCampos={Object.keys(errors).length > 0} />

      <CuerpoFormulario
        campos={foco.campos}
        lado={
          <>
            <CajaLado icono={Eye} titulo="Así se ve en la lista">
              {/* La misma fila de la lista; en esta columna angosta se acomoda como en el celular */}
              <div className="@container overflow-hidden rounded-card border border-borde bg-superficie">
                <FilaExperiencia
                  encabezado="h3"
                  empresa={v.empresa}
                  puesto={v.puesto}
                  desde={v.desde}
                  hasta={v.hasta}
                  ubicacion={v.ubicacion}
                  modalidad={v.modalidad}
                  descripcion={v.descripcion}
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
          descripcion="Dónde, qué puesto, cuándo y cómo trabajabas"
        >
          {/* Los cuatro del mismo ancho: en una fila si la sección es ancha, de a dos si no entran */}
          <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-4">
            <Field label="Empresa" htmlFor="empresa" error={errors.empresa?.message}>
              <Input id="empresa" icono={Building2} invalid={!!errors.empresa} {...register("empresa")} />
            </Field>
            <Field label="Puesto" htmlFor="puesto" error={errors.puesto?.message}>
              <Input id="puesto" icono={BriefcaseBusiness} invalid={!!errors.puesto} {...register("puesto")} />
            </Field>
            <Field label="Ubicación" htmlFor="ubicacion" error={errors.ubicacion?.message}>
              <Input id="ubicacion" icono={MapPin} invalid={!!errors.ubicacion} {...register("ubicacion")} />
            </Field>
            <Field label="Modalidad" htmlFor="modalidad" error={errors.modalidad?.message}>
              <Select id="modalidad" icono={Laptop} invalid={!!errors.modalidad} {...register("modalidad")}>
                {MODALIDADES.map((m) => (
                  <option key={m} value={m}>
                    {MODALIDAD[m]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 @lg:grid-cols-2">
            <Field label="Desde" htmlFor="desde" error={errors.desde?.message}>
              <Input id="desde" type="month" invalid={!!errors.desde} {...register("desde")} />
            </Field>
            <Field label="Hasta" htmlFor="hasta" ayuda="vacío: es tu trabajo actual" error={errors.hasta?.message}>
              <Input id="hasta" type="month" invalid={!!errors.hasta} {...register("hasta")} />
            </Field>
          </div>
        </Seccion>

        <Seccion icono={BookOpen} tono="aviso" titulo="Lo que hiciste" descripcion="Lo que se lee de este trabajo">
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

        <Seccion icono={Trophy} tono="rosa" titulo="Logros" descripcion="Lo que conseguiste, uno por línea">
          <Field label="Logros" htmlFor="logros" error={errors.logros?.message}>
            <Textarea id="logros" rows={6} invalid={!!errors.logros} {...register("logros")} />
            <PieCampo izquierda="uno por línea" derecha={`${logros.length} / 20 logros`} pasado={logros.length > 20} />
          </Field>
        </Seccion>

        <Seccion icono={Layers} tono="exito" titulo="Tecnologías" descripcion="Con qué trabajabas">
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
      </CuerpoFormulario>
    </form>
  );
}
