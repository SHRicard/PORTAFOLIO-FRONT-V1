import { useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BookOpen,
  BriefcaseBusiness,
  CalendarClock,
  CalendarPlus,
  Clock,
  Eye,
  Flag,
  Handshake,
  IdCard,
  Images,
  Languages,
  Laptop,
  Lightbulb,
  ListChecks,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { CampoArchivo } from "@/features/archivos/CampoArchivo";
import { CampoPdf } from "@/features/archivos/CampoPdf";
import { SubidasPendientesContexto, useSubidasPendientes } from "@/features/archivos/subidasPendientes";
import { CATEGORIA, MODALIDAD, NIVEL, parrafos, RED, TIPO_DATO } from "@/features/portafolio/formato";
import { getErrorDetail, getErrorMessage } from "@/lib/errors";
import { applyServerFieldErrors } from "@/lib/forms";
import { aLineas } from "@/lib/validaciones";
import { Alert } from "@/components/ui/Alert";
import { CampoFichas } from "@/components/ui/CampoFichas";
import { Field } from "@/components/ui/Field";
import {
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
import { FilaEditable, ListaEditable } from "@/components/ui/ListaEditable";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useGuardarPerfilMutation } from "./perfilApi";
import {
  aFormulario,
  aPerfilInput,
  campoFormulario,
  CATEGORIAS,
  MODALIDADES,
  NIVELES,
  PERFIL_VACIO,
  perfilSchema,
  REDES,
  TIPOS_DATO,
  type PerfilFormValues,
} from "./schemas";
import { TarjetaPerfil } from "./TarjetaPerfil";
import type { Perfil } from "./types";

/** "1 red", "4 redes" */
const cuantos = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

/**
 * Los datos públicos, con el formato de los formularios del panel («Con vista previa», piezas de
 * `FormularioPanel`): arriba, la barra con «Ver en la web» y «Guardar cambios»; a la izquierda, el formulario
 * en secciones; a la derecha, cómo te presenta la web (cambia mientras se escribe), la disponibilidad y lo que
 * tiene. La foto y el CV se suben al guardar. Sin perfil: todavía no se cargó y el formulario lo crea
 */
export function PerfilForm({ perfil }: { perfil?: Perfil }) {
  const [guardar, { isLoading }] = useGuardarPerfilMutation();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const values = useMemo(() => (perfil ? aFormulario(perfil) : undefined), [perfil]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: PERFIL_VACIO,
    values,
    // El foco lo maneja el formulario: así también va al campo que rechace el backend
    shouldFocusError: false,
  });

  // La foto y el CV elegidos no se suben al elegirlos: se suben al tocar «Guardar cambios»
  const subidas = useSubidasPendientes();
  const [errorSubida, setErrorSubida] = useState<string | null>(null);

  const redes = useFieldArray({ control, name: "redes" });
  const idiomas = useFieldArray({ control, name: "idiomas" });
  const datosCuriosos = useFieldArray({ control, name: "datosCuriosos" });

  const v = watch();
  const abiertoA = aLineas(v.abiertoA);
  const conArchivo = (url: string) => url.startsWith("https://") || !!subidas.pendiente(url);

  // Al guardar con errores (los del esquema o los que devuelva el backend), enfoca el primer campo marcado
  const foco = useEnfocarError(Object.keys(errors).join());
  const enviar = handleSubmit(
    async (valores) => {
      foco.buscar(); // por si el backend rechaza algún campo
      setErrorGeneral(null);
      setErrorSubida(null);
      setGuardado(false);
      let conLinks: PerfilFormValues;
      try {
        // Primero se suben a Cloudinary la foto y el CV elegidos
        conLinks = await subidas.subir(valores, "perfil");
      } catch (err) {
        setErrorSubida(`No se pudo subir un archivo: ${getErrorMessage(err)}`);
        return;
      }
      try {
        await guardar(aPerfilInput(conLinks)).unwrap();
        setGuardado(true);
      } catch (err) {
        if (!applyServerFieldErrors(err, setError, campoFormulario)) setErrorGeneral(getErrorDetail(err));
      }
    },
    () => foco.buscar(),
  );

  const loQueTiene = [
    {
      ok: Boolean(v.nombreVisible.trim() && v.rol.trim() && v.frase.trim()),
      si: "Nombre, rol y frase",
      no: "Falta el nombre, el rol o la frase",
    },
    { ok: Boolean(v.bioCorta.trim() && v.bioLarga.trim()), si: "Bio corta y larga", no: "Falta la bio" },
    { ok: conArchivo(v.fotoUrl), si: "Foto", no: "Falta la foto" },
    { ok: conArchivo(v.cvUrl), si: "CV", no: "Falta el CV" },
    { ok: v.redes.length > 0, si: cuantos(v.redes.length, "red", "redes"), no: "Sin redes" },
    {
      ok: v.habilidades.length > 0,
      si: cuantos(v.habilidades.length, "habilidad", "habilidades"),
      no: "Sin habilidades",
    },
    { ok: v.idiomas.length > 0, si: cuantos(v.idiomas.length, "idioma", "idiomas"), no: "Sin idiomas" },
    {
      ok: v.datosCuriosos.length > 0,
      si: cuantos(v.datosCuriosos.length, "dato curioso", "datos curiosos"),
      no: "Sin datos curiosos",
    },
  ];

  return (
    <SubidasPendientesContexto.Provider value={subidas}>
      {/* Al enfocar un campo, que no quede debajo de la barra pegada */}
      <form noValidate onSubmit={enviar} className="[&_:is(input,textarea,select)]:scroll-mt-28">
        <BarraFormulario
          titulo="Datos públicos"
          estado={
            v.disponible
              ? { etiqueta: "Disponible", estilo: "primario" }
              : { etiqueta: "No disponible", estilo: "neutro" }
          }
          verEnLaWeb={perfil ? "/" : undefined}
          textoGuardar="Guardar cambios"
          guardando={isLoading || subidas.subiendo}
        />
        <AvisosFormulario errores={[errorSubida, errorGeneral]} conCampos={Object.keys(errors).length > 0} />
        {guardado && !isDirty && (
          <div className="mt-4">
            <Alert>Cambios guardados. Ya se ven en la web.</Alert>
          </div>
        )}

        <CuerpoFormulario
          campos={foco.campos}
          lado={
            <>
              <CajaLado icono={Eye} titulo="Así te presenta la web">
                <TarjetaPerfil
                  nombre={v.nombreVisible}
                  rol={v.rol}
                  frase={v.frase}
                  ciudad={v.ciudad}
                  pais={v.pais}
                  modalidad={v.modalidad}
                  disponible={v.disponible}
                  disponibilidadTexto={v.disponibilidadTexto}
                  foto={v.fotoUrl}
                  fotoAlt={v.fotoAlt}
                />
              </CajaLado>

              <CajaLado icono={Handshake} titulo="Disponibilidad">
                <Interruptor
                  titulo="Disponible para ofertas"
                  descripcion="Prendido, la web muestra que estás disponible"
                  icono={<BriefcaseBusiness className="size-4 text-exito" aria-hidden />}
                  {...register("disponible")}
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
            icono={IdCard}
            tono="info"
            titulo="Presentación"
            descripcion="Quién sos, qué hacés y dónde estás: lo primero que se lee"
          >
            {/* Los tres del mismo ancho: en una fila si la sección es ancha, de a dos si no entran */}
            <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
              <Field label="Nombre visible" htmlFor="nombreVisible" error={errors.nombreVisible?.message}>
                <Input
                  id="nombreVisible"
                  icono={UserRound}
                  invalid={!!errors.nombreVisible}
                  {...register("nombreVisible")}
                />
              </Field>
              <Field label="Rol" htmlFor="rol" error={errors.rol?.message}>
                <Input id="rol" icono={BriefcaseBusiness} invalid={!!errors.rol} {...register("rol")} />
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
              <Field label="Ciudad" htmlFor="ciudad" error={errors.ciudad?.message}>
                <Input id="ciudad" icono={MapPin} invalid={!!errors.ciudad} {...register("ciudad")} />
              </Field>
              <Field label="País" htmlFor="pais" error={errors.pais?.message}>
                <Input id="pais" icono={Flag} invalid={!!errors.pais} {...register("pais")} />
              </Field>
            </div>
            <Field label="Frase" htmlFor="frase" error={errors.frase?.message}>
              <Input id="frase" invalid={!!errors.frase} {...register("frase")} />
              <PieCampo
                izquierda="La línea que acompaña tu nombre"
                derecha={`${v.frase.length} / 100`}
                pasado={v.frase.length > 100}
              />
            </Field>
            <Field
              label="Texto de disponibilidad"
              htmlFor="disponibilidadTexto"
              error={errors.disponibilidadTexto?.message}
            >
              <Input
                id="disponibilidadTexto"
                placeholder="Ej. Trabajando full time, pero abierto a escuchar ofertas"
                invalid={!!errors.disponibilidadTexto}
                {...register("disponibilidadTexto")}
              />
              <PieCampo
                izquierda="Lo que se lee al lado de «Disponible»"
                derecha={`${v.disponibilidadTexto.length} / 160`}
                pasado={v.disponibilidadTexto.length > 160}
              />
            </Field>
          </Seccion>

          <Seccion icono={BookOpen} tono="aviso" titulo="Sobre mí" descripcion="Lo que contás de vos">
            <Field label="Bio corta" htmlFor="bioCorta" error={errors.bioCorta?.message}>
              <Textarea id="bioCorta" rows={3} invalid={!!errors.bioCorta} {...register("bioCorta")} />
              <PieCampo
                izquierda="La presentación en pocas líneas"
                derecha={`${v.bioCorta.length} / 280`}
                pasado={v.bioCorta.length > 280}
              />
            </Field>
            <Field
              label="Bio larga"
              htmlFor="bioLarga"
              ayuda="separá los párrafos con una línea en blanco"
              error={errors.bioLarga?.message}
            >
              <Textarea id="bioLarga" rows={10} invalid={!!errors.bioLarga} {...register("bioLarga")} />
              <PieCampo
                izquierda={`${parrafos(v.bioLarga).length} párrafos`}
                derecha={`${v.bioLarga.length.toLocaleString("es-AR")} / 2.000 caracteres`}
                pasado={v.bioLarga.length > 2000}
              />
            </Field>
          </Seccion>

          <Seccion icono={Images} tono="secundario" titulo="Foto y CV" descripcion="Tu foto y el CV para descargar">
            {/* La foto (la columna más angosta, para que no quede enorme) con su descripción debajo y, al lado
                (debajo, si no entra), el CV */}
            <div className="grid items-start gap-5 @2xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="grid gap-4">
                <Field label="Foto" htmlFor="fotoUrl" error={errors.fotoUrl?.message}>
                  <Controller
                    control={control}
                    name="fotoUrl"
                    render={({ field }) => (
                      <CampoArchivo
                        id="fotoUrl"
                        tipo="imagen"
                        vista="recuadro"
                        textoVacio="Subí tu foto"
                        ayudaVacio="La que acompaña tu nombre en la web"
                        carpeta="perfil"
                        valor={field.value}
                        onCambio={field.onChange}
                        invalid={!!errors.fotoUrl}
                      />
                    )}
                  />
                </Field>
                <Field
                  label="Descripción de la foto"
                  htmlFor="fotoAlt"
                  ayuda="para quien no la ve"
                  error={errors.fotoAlt?.message}
                >
                  <Input
                    id="fotoAlt"
                    placeholder="Qué se ve en la foto"
                    invalid={!!errors.fotoAlt}
                    {...register("fotoAlt")}
                  />
                </Field>
              </div>

              <Field label="CV (PDF)" htmlFor="cvUrl">
                <Controller
                  control={control}
                  name="cvUrl"
                  render={({ field }) => (
                    <CampoPdf
                      id="cvUrl"
                      quitable
                      valor={field.value}
                      onCambio={field.onChange}
                      error={errors.cvUrl?.message}
                    />
                  )}
                />
              </Field>
            </div>
          </Seccion>

          <Seccion icono={Mail} tono="exito" titulo="Contacto y redes" descripcion="Cómo te encuentran y te escriben">
            <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
              <Field label="Correo público" htmlFor="correo" error={errors.correo?.message}>
                <Input id="correo" type="email" icono={Mail} invalid={!!errors.correo} {...register("correo")} />
              </Field>
              <Field
                label="Teléfono"
                htmlFor="telefono"
                ayuda="con código de país, ej. +54 9 11 5555-1234"
                error={errors.telefono?.message}
              >
                <Input id="telefono" type="tel" icono={Phone} invalid={!!errors.telefono} {...register("telefono")} />
              </Field>
              {/* Arriba, a la altura de los campos (debajo del teléfono va su ayuda) */}
              <Interruptor
                titulo="Tiene WhatsApp"
                descripcion="La web suma el botón para escribirte"
                icono={<MessageCircle className="size-4 text-exito" aria-hidden />}
                className="self-start @lg:col-span-2 @4xl:col-span-1"
                {...register("whatsapp")}
              />
            </div>

            <Field label="Mensaje" htmlFor="mensaje" error={errors.mensaje?.message}>
              <Textarea
                id="mensaje"
                rows={2}
                placeholder="Ej. Estoy escuchando ideas: proyectos, colaboraciones o algún desafío"
                invalid={!!errors.mensaje}
                {...register("mensaje")}
              />
              <PieCampo
                izquierda="Lo que se lee arriba del contacto"
                derecha={`${v.mensaje.length} / 200`}
                pasado={v.mensaje.length > 200}
              />
            </Field>

            <Field
              label="Abierto a"
              htmlFor="abiertoA"
              ayuda={`${abiertoA.length} de 10 · escribí uno y apretá Enter`}
              error={errors.abiertoA?.message}
            >
              <Controller
                control={control}
                name="abiertoA"
                render={({ field }) => (
                  <CampoFichas
                    id="abiertoA"
                    valores={aLineas(field.value)}
                    onCambio={(lista) => field.onChange(lista.join("\n"))}
                    placeholder="Agregar (ej. Proyectos freelance)…"
                    invalid={!!errors.abiertoA}
                  />
                )}
              />
            </Field>

            <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
              <Field label="Tiempo de respuesta" htmlFor="tiempoRespuesta" error={errors.tiempoRespuesta?.message}>
                <Input
                  id="tiempoRespuesta"
                  icono={Clock}
                  placeholder="Ej. Respondo en menos de 24 h"
                  invalid={!!errors.tiempoRespuesta}
                  {...register("tiempoRespuesta")}
                />
              </Field>
              <Field label="Horario" htmlFor="horario" error={errors.horario?.message}>
                <Input
                  id="horario"
                  icono={CalendarClock}
                  placeholder="Ej. Lun a vie, 9 a 18 h (GMT-3)"
                  invalid={!!errors.horario}
                  {...register("horario")}
                />
              </Field>
              <Field
                label="Link para agendar"
                htmlFor="agenda"
                ayuda="Calendly, Cal.com…"
                error={errors.agenda?.message}
              >
                <Input
                  id="agenda"
                  type="url"
                  icono={CalendarPlus}
                  placeholder="https://..."
                  invalid={!!errors.agenda}
                  {...register("agenda")}
                />
              </Field>
            </div>

            <ListaEditable
              titulo="Redes"
              ayuda={`${redes.fields.length} de 20`}
              error={errors.redes?.root?.message}
              textoAgregar="Agregar red"
              onAgregar={() => redes.append({ tipo: "github", url: "" })}
            >
              {redes.fields.map((campo, i) => (
                <FilaEditable
                  key={campo.id}
                  className="bg-fondo"
                  etiquetaQuitar={`Quitar red ${i + 1}`}
                  onQuitar={() => redes.remove(i)}
                >
                  <div className="grid gap-3 @lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)]">
                    <Field label="Red" htmlFor={`red-tipo-${i}`} error={errors.redes?.[i]?.tipo?.message}>
                      <Select id={`red-tipo-${i}`} {...register(`redes.${i}.tipo`)}>
                        {REDES.map((r) => (
                          <option key={r} value={r}>
                            {RED[r]}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Link" htmlFor={`red-url-${i}`} error={errors.redes?.[i]?.url?.message}>
                      <Input
                        id={`red-url-${i}`}
                        type="url"
                        placeholder="https://..."
                        invalid={!!errors.redes?.[i]?.url}
                        {...register(`redes.${i}.url`)}
                      />
                    </Field>
                  </div>
                </FilaEditable>
              ))}
            </ListaEditable>
          </Seccion>

          <Seccion
            icono={Sparkles}
            tono="rosa"
            titulo="Habilidades"
            descripcion={`Lo que sabés usar, por área: ${v.habilidades.length} de 100`}
          >
            {/* Una caja de fichas por área. La web las agrupa igual, así que el orden entre áreas no importa */}
            <Controller
              control={control}
              name="habilidades"
              render={({ field }) => (
                <div className="grid gap-4 @2xl:grid-cols-2">
                  {CATEGORIAS.map((categoria) => {
                    const indices = field.value.flatMap((h, i) => (h.categoria === categoria ? [i] : []));
                    const error = indices
                      .map(
                        (i) => errors.habilidades?.[i]?.nombre?.message ?? errors.habilidades?.[i]?.categoria?.message,
                      )
                      .find(Boolean);
                    return (
                      <Field
                        key={categoria}
                        label={CATEGORIA[categoria]}
                        htmlFor={`hab-${categoria}`}
                        ayuda={cuantos(indices.length, "habilidad", "habilidades")}
                        error={error}
                      >
                        <CampoFichas
                          id={`hab-${categoria}`}
                          valores={indices.map((i) => field.value[i]!.nombre)}
                          onCambio={(lista) =>
                            field.onChange([
                              ...field.value.filter((h) => h.categoria !== categoria),
                              ...lista.map((nombre) => ({ nombre, categoria })),
                            ])
                          }
                          placeholder="Agregar…"
                          invalid={!!error}
                        />
                      </Field>
                    );
                  })}
                </div>
              )}
            />
            {errors.habilidades?.root?.message && (
              <p role="alert" className="text-sm text-peligro">
                {errors.habilidades.root.message}
              </p>
            )}
          </Seccion>

          <Seccion
            icono={Languages}
            tono="info"
            titulo="Idiomas"
            descripcion={`Los que hablás y con qué nivel: ${idiomas.fields.length} de 20`}
          >
            <ListaEditable
              titulo="Idiomas"
              error={errors.idiomas?.root?.message}
              textoAgregar="Agregar idioma"
              onAgregar={() => idiomas.append({ idioma: "", nivel: "basico" })}
            >
              {idiomas.fields.map((campo, i) => (
                <FilaEditable
                  key={campo.id}
                  className="bg-fondo"
                  etiquetaQuitar={`Quitar idioma ${i + 1}`}
                  onQuitar={() => idiomas.remove(i)}
                >
                  <div className="grid gap-3 @lg:grid-cols-2">
                    <Field label="Idioma" htmlFor={`idioma-${i}`} error={errors.idiomas?.[i]?.idioma?.message}>
                      <Input
                        id={`idioma-${i}`}
                        invalid={!!errors.idiomas?.[i]?.idioma}
                        {...register(`idiomas.${i}.idioma`)}
                      />
                    </Field>
                    <Field label="Nivel" htmlFor={`nivel-${i}`} error={errors.idiomas?.[i]?.nivel?.message}>
                      <Select id={`nivel-${i}`} {...register(`idiomas.${i}.nivel`)}>
                        {NIVELES.map((n) => (
                          <option key={n} value={n}>
                            {NIVEL[n]}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </FilaEditable>
              ))}
            </ListaEditable>
          </Seccion>

          <Seccion
            icono={Lightbulb}
            tono="aviso"
            titulo="Datos curiosos"
            descripcion={`Números y cosas tuyas, profesionales y personales: ${datosCuriosos.fields.length} de 30`}
          >
            <ListaEditable
              titulo="Datos curiosos"
              error={errors.datosCuriosos?.root?.message}
              textoAgregar="Agregar dato"
              onAgregar={() => datosCuriosos.append({ titulo: "", valor: "", tipo: "profesional" })}
            >
              {datosCuriosos.fields.map((campo, i) => (
                <FilaEditable
                  key={campo.id}
                  className="bg-fondo"
                  etiquetaQuitar={`Quitar dato ${i + 1}`}
                  onQuitar={() => datosCuriosos.remove(i)}
                >
                  <div className="grid gap-3 @lg:grid-cols-2 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <Field
                      label="Título"
                      htmlFor={`dato-titulo-${i}`}
                      error={errors.datosCuriosos?.[i]?.titulo?.message}
                    >
                      <Input
                        id={`dato-titulo-${i}`}
                        invalid={!!errors.datosCuriosos?.[i]?.titulo}
                        {...register(`datosCuriosos.${i}.titulo`)}
                      />
                    </Field>
                    <Field label="Valor" htmlFor={`dato-valor-${i}`} error={errors.datosCuriosos?.[i]?.valor?.message}>
                      <Input
                        id={`dato-valor-${i}`}
                        invalid={!!errors.datosCuriosos?.[i]?.valor}
                        {...register(`datosCuriosos.${i}.valor`)}
                      />
                    </Field>
                    <Field label="Tipo" htmlFor={`dato-tipo-${i}`} error={errors.datosCuriosos?.[i]?.tipo?.message}>
                      <Select id={`dato-tipo-${i}`} {...register(`datosCuriosos.${i}.tipo`)}>
                        {TIPOS_DATO.map((t) => (
                          <option key={t} value={t}>
                            {TIPO_DATO[t]}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </FilaEditable>
              ))}
            </ListaEditable>
          </Seccion>
        </CuerpoFormulario>
      </form>
    </SubidasPendientesContexto.Provider>
  );
}
