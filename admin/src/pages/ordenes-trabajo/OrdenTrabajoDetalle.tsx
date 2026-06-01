import {
  IonBackButton, IonButtons, IonContent, IonHeader,
  IonPage, IonSpinner, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import { motion } from "framer-motion";
import {
  User, Bike, MessageSquare, Wrench, Package, Camera, Receipt,
  ShieldCheck, CheckCircle2, AlertCircle, ChevronRight, ArrowRight,
  UserCog, Bell, Printer, Plus, Timer, Stethoscope,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const fmt = (n: any) => "₡" + Number(n ?? 0).toLocaleString("es-CR", { maximumFractionDigits: 0 });

const flujo = ["recepcion", "diagnostico", "reparacion", "lista", "entregada"];

const estadoCfg: Record<string, { label: string; color: string; bg: string }> = {
  recepcion:   { label: "Recepción",       color: "var(--text-secondary)", bg: "var(--bg-hover)" },
  diagnostico: { label: "Diagnóstico",     color: "var(--warning)",        bg: "rgba(234,179,8,0.12)" },
  reparacion:  { label: "En Reparación",   color: "var(--info)",           bg: "rgba(59,130,246,0.12)" },
  lista:       { label: "Lista p/entregar",color: "var(--success)",        bg: "rgba(34,197,94,0.12)" },
  entregada:   { label: "Entregada",       color: "var(--text-muted)",     bg: "var(--bg-hover)" },
};
const siguiente: Record<string, string> = {
  recepcion: "Pasar a Diagnóstico", diagnostico: "Pasar a Reparación",
  reparacion: "Marcar como Lista", lista: "Registrar Entrega",
};
const prioCfg: Record<string, string> = {
  emergencia: "var(--danger)", garantia: "#8B5CF6", rapido: "var(--warning)",
  mayor: "var(--info)", preventivo: "var(--text-muted)",
};
const semaforoCfg: Record<string, string> = {
  verde: "var(--success)", amarillo: "var(--warning)", rojo: "var(--danger)",
};

const tabs = [
  { id: "info",      label: "Info",      icon: User },
  { id: "avances",   label: "Avances",   icon: Wrench },
  { id: "repuestos", label: "Repuestos", icon: Package },
  { id: "docs",      label: "Docs",      icon: Camera },
];

/* Tarjeta de sección reutilizable */
const Section: React.FC<{ icon: any; title: string; right?: React.ReactNode; children: React.ReactNode; onClick?: () => void }> =
  ({ icon: Icon, title, right, children, onClick }) => (
  <div className={onClick ? "press rounded-2xl overflow-hidden" : "rounded-2xl overflow-hidden"}
    onClick={onClick}
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)", cursor: onClick ? "pointer" : "default" }}>
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2">
        <Icon size={14} style={{ color: "var(--accent)" }} />
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>{title}</p>
      </div>
      {right}
    </div>
    <div className="px-4 py-3.5">{children}</div>
  </div>
);

const OrdenTrabajoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ot, setOt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info");
  const [toast] = useIonToast();
  const history = useHistory();
  const { tieneRol } = useAuth();

  const cargar = () => {
    setLoading(true);
    api.get(`/ordenes-trabajo/${id}`)
      .then(({ data }) => { setOt(data); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { cargar(); }, [id]);

  const avanzarEstado = async () => {
    const idx = flujo.indexOf(ot.estado);
    if (idx >= flujo.length - 1) return;
    await api.patch(`/ordenes-trabajo/${id}`, { estado: flujo[idx + 1] });
    toast({ message: "Estado actualizado.", duration: 3000, color: "success" });
    cargar();
  };

  if (loading) return (
    <IonPage><IonContent className="ion-text-center ion-padding"><IonSpinner name="crescent" /></IonContent></IonPage>
  );

  // Guard null: /ordenes-trabajo/nueva monta esta vista en segundo plano (id="nueva").
  if (!ot) return (
    <IonPage><IonContent className="ion-padding">
      <div className="flex h-full items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
        Orden de trabajo no encontrada.
      </div>
    </IonContent></IonPage>
  );

  const est = estadoCfg[ot.estado] ?? estadoCfg.recepcion;
  const idxActual = flujo.indexOf(ot.estado);
  const semaforo = ot.tiempos_etapa?.slice(-1)[0]?.semaforo;
  const puedeGestionar = tieneRol("Administrador", "Jefe de Taller");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/ordenes-trabajo" /></IonButtons>
          <IonTitle>{ot.numero_ot}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="px-4 py-4 pb-28 space-y-4">

          {/* ===== HERO: estado + progreso + acciones ===== */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>

            {/* Badges */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ background: est.bg, color: est.color }}>
                  {est.label}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                  style={{ background: `${prioCfg[ot.prioridad] ?? "var(--text-muted)"}1f`, color: prioCfg[ot.prioridad] ?? "var(--text-muted)" }}>
                  {ot.prioridad}
                </span>
              </div>
              {semaforo && (
                <div className="flex items-center gap-1.5">
                  <Timer size={13} style={{ color: semaforoCfg[semaforo] }} />
                  <span className="w-2 h-2 rounded-full" style={{ background: semaforoCfg[semaforo], boxShadow: `0 0 8px ${semaforoCfg[semaforo]}` }} />
                </div>
              )}
            </div>

            {/* Stepper de progreso */}
            <div className="flex items-center gap-1.5 mb-4">
              {flujo.map((f, i) => {
                const done = i <= idxActual;
                return (
                  <div key={f} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full h-1.5 rounded-full transition-all duration-300"
                      style={{ background: done ? "var(--accent)" : "var(--bg-hover)", boxShadow: i === idxActual ? "0 0 8px rgba(249,115,22,0.6)" : "none" }} />
                    <span className="text-[9px] font-semibold capitalize text-center"
                      style={{ color: i === idxActual ? "var(--accent)" : "var(--text-muted)" }}>
                      {estadoCfg[f].label.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Acción primaria: avanzar estado */}
            {ot.estado !== "entregada" && puedeGestionar && (
              <button onClick={avanzarEstado}
                className="press w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #F97316, #EA580C)", boxShadow: "0 4px 20px rgba(249,115,22,0.3)" }}>
                {siguiente[ot.estado]} <ArrowRight size={16} />
              </button>
            )}

            {/* Acciones secundarias */}
            {(puedeGestionar || tieneRol("Administrador", "Recepcionista")) && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {puedeGestionar && (
                  <>
                    <button onClick={() => history.push(`/ordenes-trabajo/${id}/reasignar`)}
                      className="press flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                      <UserCog size={14} /> Reasignar
                    </button>
                    <button onClick={() => history.push(`/ordenes-trabajo/${id}/notificar`)}
                      className="press flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                      <Bell size={14} /> Notificar
                    </button>
                  </>
                )}
                {tieneRol("Administrador", "Recepcionista") && (
                  <button onClick={() => history.push(`/ordenes-trabajo/${id}/comprobante`)}
                    className="press flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold col-span-2"
                    style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                    <Printer size={14} /> Comprobante de recepción
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* ===== TABS ===== */}
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--bg-hover)" }}>
            {tabs.map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="relative flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{
                    background: active ? "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(249,115,22,0.06))" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    border: active ? "1px solid rgba(249,115,22,0.25)" : "1px solid transparent",
                  }}>
                  <t.icon size={13} strokeWidth={active ? 2.5 : 2} style={{ color: active ? "var(--accent)" : "currentColor" }} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* ===== TAB: INFO ===== */}
          {tab === "info" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <Section icon={User} title="Cliente"
                right={<ChevronRight size={16} style={{ color: "var(--text-muted)" }} />}
                onClick={() => history.push(`/clientes/${ot.cliente?.id}`)}>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ot.cliente?.nombre} {ot.cliente?.apellido}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{ot.cliente?.telefono}</p>
              </Section>

              <Section icon={Bike} title="Motocicleta">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {ot.motocicleta?.marca} {ot.motocicleta?.modelo} {ot.motocicleta?.anio}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                  <span>Placa: <span style={{ color: "var(--text-secondary)" }}>{ot.motocicleta?.placa}</span></span>
                  <span>Color: <span style={{ color: "var(--text-secondary)" }}>{ot.motocicleta?.color}</span></span>
                  <span>Km: <span style={{ color: "var(--text-secondary)" }}>{ot.kilometraje_ingreso?.toLocaleString()}</span></span>
                  <span>Combustible: <span style={{ color: "var(--text-secondary)" }}>{ot.nivel_combustible}</span></span>
                </div>
              </Section>

              <Section icon={MessageSquare} title="Problema reportado">
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{ot.problema_reportado}</p>
                {ot.estado_fisico && (
                  <p className="text-xs mt-2 pt-2" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
                    Estado físico: <span style={{ color: "var(--text-secondary)" }}>{ot.estado_fisico}</span>
                  </p>
                )}
              </Section>

              {ot.diagnostico && (
                <Section icon={Stethoscope} title="Diagnóstico"
                  right={<span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: ot.diagnostico.estado === "aprobado" ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)", color: ot.diagnostico.estado === "aprobado" ? "var(--success)" : "var(--warning)" }}>
                    {ot.diagnostico.estado}</span>}>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{ot.diagnostico.descripcion_fallas}</p>
                  <div className="flex gap-4 mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    <span>Mano de obra: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{fmt(ot.diagnostico.mano_obra_estimada)}</span></span>
                    <span>Tiempo: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{ot.diagnostico.tiempo_estimado_horas}h</span></span>
                  </div>
                </Section>
              )}

              {ot.checklist && (
                <Section icon={CheckCircle2} title="Checklist de entrega">
                  <div className="space-y-2">
                    {[
                      ["Prueba realizada", ot.checklist.prueba_realizada],
                      ["Lavado", ot.checklist.lavado],
                      ["Calidad revisada", ot.checklist.calidad_revisada],
                      ["Facturación lista", ot.checklist.facturacion_lista],
                      ["Cliente notificado", ot.checklist.cliente_notificado],
                    ].map(([label, val]) => (
                      <div key={label as string} className="flex items-center gap-2.5">
                        {val
                          ? <CheckCircle2 size={15} style={{ color: "var(--success)" }} />
                          : <AlertCircle size={15} style={{ color: "var(--text-muted)" }} />}
                        <span className="text-sm" style={{ color: val ? "var(--text-primary)" : "var(--text-muted)" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </motion.div>
          )}

          {/* ===== TAB: AVANCES ===== */}
          {tab === "avances" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {(!ot.avances || ot.avances.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3" style={{ color: "var(--text-muted)" }}>
                  <Wrench size={36} className="opacity-30" />
                  <p className="text-sm">Sin avances registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ot.avances.map((a: any) => (
                    <div key={a.id} className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                        {new Date(a.fecha_hora).toLocaleString("es-CR")} · {a.tecnico?.nombre} {a.tecnico?.apellido}
                      </p>
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>{a.descripcion}</p>
                    </div>
                  ))}
                </div>
              )}
              {tieneRol("Técnico", "Jefe de Taller", "Administrador") && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => history.push(`/ordenes-trabajo/${id}/avance`)}
                    className="press flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid rgba(249,115,22,0.25)" }}>
                    <Plus size={15} /> Registrar avance
                  </button>
                  <button onClick={() => history.push(`/ordenes-trabajo/${id}/timer`)}
                    className="press flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "rgba(34,197,94,0.1)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.25)" }}>
                    <Timer size={15} /> Timer
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ===== TAB: REPUESTOS ===== */}
          {tab === "repuestos" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {(!ot.repuestos || ot.repuestos.length === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3" style={{ color: "var(--text-muted)" }}>
                  <Package size={36} className="opacity-30" />
                  <p className="text-sm">Sin repuestos registrados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {ot.repuestos.map((r: any) => {
                    const c = r.estado === "disponible" ? "var(--success)" : r.estado === "pedido_especial" ? "var(--danger)" : "var(--warning)";
                    return (
                      <div key={r.id} className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(249,115,22,0.1)" }}>
                          <Package size={16} style={{ color: "var(--accent)" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{r.repuesto?.nombre}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{r.cantidad} × {fmt(r.precio_unitario)}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg capitalize" style={{ background: `${c}1f`, color: c }}>{r.estado}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {tieneRol("Técnico", "Jefe de Taller", "Administrador") && (
                <button onClick={() => history.push(`/ordenes-trabajo/${id}/repuesto`)}
                  className="press w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid rgba(249,115,22,0.25)" }}>
                  <Plus size={15} /> Agregar repuesto
                </button>
              )}
            </motion.div>
          )}

          {/* ===== TAB: DOCS ===== */}
          {tab === "docs" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <Section icon={Camera} title={`Evidencias (${ot.evidencias?.length ?? 0})`}>
                {(!ot.evidencias || ot.evidencias.length === 0) ? (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Sin evidencias adjuntas.</p>
                ) : (
                  <div className="space-y-2">
                    {ot.evidencias.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm" style={{ color: "var(--text-primary)" }}>{e.descripcion ?? e.tipo}</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{e.etapa}</p>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-lg" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>{e.tipo}</span>
                      </div>
                    ))}
                  </div>
                )}
                {tieneRol("Técnico", "Jefe de Taller", "Administrador") && (
                  <button onClick={() => history.push(`/ordenes-trabajo/${id}/evidencia`)}
                    className="press w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold mt-3"
                    style={{ background: "var(--accent-subtle)", color: "var(--accent)", border: "1px solid rgba(249,115,22,0.25)" }}>
                    <Camera size={15} /> Agregar evidencia
                  </button>
                )}
              </Section>

              {ot.factura && (
                <Section icon={Receipt} title="Factura"
                  right={<span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: ot.factura.estado === "pagada" ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)", color: ot.factura.estado === "pagada" ? "var(--success)" : "var(--warning)" }}>
                    {ot.factura.estado}</span>}
                  onClick={() => history.push(`/facturacion/${ot.factura.id}`)}>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ot.factura.numero_factura}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{fmt(ot.factura.total)} · {ot.factura.metodo_pago}</p>
                </Section>
              )}

              {ot.garantia && (
                <Section icon={ShieldCheck} title="Garantía"
                  right={<span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                    style={{ background: ot.garantia.estado === "activa" ? "rgba(34,197,94,0.12)" : "rgba(234,179,8,0.12)", color: ot.garantia.estado === "activa" ? "var(--success)" : "var(--warning)" }}>
                    {ot.garantia.estado}</span>}>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{ot.garantia.descripcion}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Vigencia: {ot.garantia.fecha_inicio} → {ot.garantia.fecha_fin}</p>
                </Section>
              )}
            </motion.div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OrdenTrabajoDetalle;
