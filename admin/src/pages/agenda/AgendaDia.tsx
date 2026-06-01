import {
  IonContent, IonHeader, IonMenuButton, IonPage,
  IonRefresher, IonRefresherContent, IonSpinner, IonTitle, IonToolbar,
} from "@ionic/react";
import { motion } from "framer-motion";
import { Calendar, Clock, Bike, Phone, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { useCanEdit } from "../../hooks/useCanEdit";

const estadoConfig: Record<string, { color: string; bg: string; label: string }> = {
  pendiente:  { color: "var(--warning)",     bg: "rgba(234,179,8,0.12)", label: "Pendiente" },
  confirmada: { color: "var(--success)",     bg: "rgba(34,197,94,0.12)", label: "Confirmada" },
  cancelada:  { color: "var(--danger)",      bg: "rgba(239,68,68,0.12)", label: "Cancelada" },
  completada: { color: "var(--text-muted)",  bg: "var(--bg-hover)",      label: "Completada" },
};

const tipoIcon: Record<string, string> = {
  preventivo:  "🔧",
  reparacion:  "🔩",
  diagnostico: "🔍",
  garantia:    "🛡️",
  emergencia:  "🚨",
};

const AgendaDia: React.FC = () => {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const canEdit = useCanEdit();
  const hoy = new Date().toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long" });
  const fechaHoy = new Date().toISOString().split("T")[0];

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/citas", { params: { fecha: fechaHoy, per_page: 50 } });
      const ordenadas = (data.data ?? []).sort((a: any, b: any) =>
        new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
      );
      setCitas(ordenadas);
    } catch { setCitas([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const confirmar = async (id: number) => { await api.patch(`/citas/${id}`, { estado: "confirmada" }); cargar(); };
  const cancelar  = async (id: number) => { await api.delete(`/citas/${id}`); cargar(); };

  const pendientes  = citas.filter(c => c.estado === "pendiente").length;
  const confirmadas = citas.filter(c => c.estado === "confirmada").length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Agenda de Hoy</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await cargar(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Header con fecha + resumen */}
        <div className="px-5 py-4" style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={18} style={{ color: "var(--accent)" }} />
            <p className="font-bold capitalize" style={{ color: "var(--text-primary)" }}>{hoy}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: citas.length, color: "var(--accent)" },
              { label: "Pendientes", value: pendientes, color: "var(--warning)" },
              { label: "Confirmadas", value: confirmadas, color: "var(--success)" },
            ].map((s) => (
              <div key={s.label} className="text-center p-3 rounded-xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48"><IonSpinner name="crescent" /></div>
        ) : citas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: "var(--text-muted)" }}>
            <Calendar size={48} className="opacity-30" />
            <p className="text-base font-semibold">No hay citas para hoy</p>
            {canEdit && (
              <button onClick={() => history.push("/citas/nueva")}
                className="press mt-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: "var(--accent)" }}>
                + Agendar cita
              </button>
            )}
          </div>
        ) : (
          <div className="px-4 py-4 pb-24 space-y-3">
            {citas.map((cita, i) => {
              const cfg = estadoConfig[cita.estado] ?? estadoConfig.pendiente;
              const hora = new Date(cita.fecha_hora).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });
              const isPast = new Date(cita.fecha_hora) < new Date() && cita.estado === "pendiente";

              return (
                <motion.div
                  key={cita.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)", opacity: cita.estado === "cancelada" ? 0.6 : 1 }}
                >
                  <div className="px-4 py-4">
                    {/* Hora y estado */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: cfg.bg }}>
                          <Clock size={12} style={{ color: cfg.color }} />
                          <span className="text-sm font-bold" style={{ color: cfg.color }}>{hora}</span>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                        <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                        {isPast && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(239,68,68,0.12)", color: "var(--danger)" }}>
                            Vencida
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{tipoIcon[cita.tipo_servicio] ?? "🔧"}</span>
                        <span className="text-xs font-medium capitalize" style={{ color: "var(--text-muted)" }}>
                          {cita.tipo_servicio}
                        </span>
                      </div>
                    </div>

                    {/* Cliente */}
                    <p className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
                      {cita.cliente?.nombre} {cita.cliente?.apellido}
                    </p>

                    {/* Moto */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bike size={13} style={{ color: "var(--text-muted)" }} />
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {cita.motocicleta?.marca} {cita.motocicleta?.modelo} — {cita.motocicleta?.placa}
                      </p>
                    </div>

                    {/* Teléfono */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Phone size={13} style={{ color: "var(--text-muted)" }} />
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{cita.cliente?.telefono}</p>
                    </div>

                    {/* Descripción */}
                    {cita.descripcion_problema && (
                      <p className="text-xs p-2.5 rounded-xl mb-3" style={{ background: "var(--bg-hover)", color: "var(--text-secondary)" }}>
                        {cita.descripcion_problema}
                      </p>
                    )}

                    {/* Duración */}
                    <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      Duración estimada: {cita.duracion_estimada_min} min
                    </p>

                    {/* Acciones */}
                    {canEdit && cita.estado === "pendiente" && (
                      <div className="flex gap-2">
                        <button onClick={() => confirmar(cita.id)}
                          className="press flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white"
                          style={{ background: "var(--success)" }}>
                          <CheckCircle2 size={15} /> Confirmar
                        </button>
                        <button onClick={() => cancelar(cita.id)}
                          className="press flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ background: "rgba(239,68,68,0.12)", color: "var(--danger)" }}>
                          <XCircle size={15} /> Cancelar
                        </button>
                      </div>
                    )}

                    {cita.estado === "confirmada" && canEdit && (
                      <button onClick={() => history.push("/ordenes-trabajo/nueva")}
                        className="press w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5"
                        style={{ background: "var(--accent)" }}>
                        <ChevronRight size={15} /> Crear OT de ingreso
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AgendaDia;
