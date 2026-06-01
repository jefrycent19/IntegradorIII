import {
  IonContent, IonHeader, IonMenuButton, IonPage,
  IonRefresher, IonRefresherContent, IonTitle, IonToolbar,
} from "@ionic/react";
import { motion } from "framer-motion";
import {
  Bike, AlertTriangle, CheckCircle2, PackageX, TrendingUp,
  CalendarCheck, Clock, ChevronRight, Wrench, ArrowUpRight,
  Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";

const fmt = (n: number) => n.toLocaleString("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });

const estadoBadge: Record<string, { color: string; bg: string; dot: string }> = {
  recepcion:   { color: "var(--text-secondary)", bg: "var(--bg-hover)",                    dot: "var(--border-light)" },
  diagnostico: { color: "#EAB308",               bg: "rgba(234,179,8,0.08)",                dot: "#EAB308" },
  reparacion:  { color: "var(--info)",            bg: "rgba(59,130,246,0.08)",               dot: "var(--info)" },
  lista:       { color: "var(--success)",         bg: "rgba(34,197,94,0.08)",                dot: "var(--success)" },
  entregada:   { color: "var(--text-muted)",      bg: "var(--bg-surface)",                   dot: "var(--text-muted)" },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
// Curva ease-out fuerte de Emil (tupla cubic-bezier que framer-motion exige).
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
const fadeUp  = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } } };
// Reveal de sección: rápido y con ease-out fuerte. El dashboard se ve decenas de
// veces al día — la entrada debe sentirse instantánea, no coreografiada.
const section = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.3, ease: EASE_OUT },
});

const StatCard: React.FC<{ label: string; value: number | string; icon: any; color: string; sub?: string }> = ({ label, value, icon: Icon, color, sub }) => (
  <motion.div variants={fadeUp}
    className="rounded-2xl p-4 flex flex-col gap-3"
    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}14` }}>
        <Icon size={17} style={{ color }} />
      </div>
    </div>
    <div>
      <p className="font-black text-3xl leading-none" style={{ color: "var(--text-primary)", letterSpacing: "-0.04em" }}>{value ?? 0}</p>
      <p className="text-xs font-medium mt-1.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const history = useHistory();

  const cargar = async () => {
    setLoading(true);
    setError(false);
    try { const r = await api.get("/dashboard"); setData(r.data); }
    catch { setError(true); }
    finally { setLoading(false); }
  };
  useEffect(() => { cargar(); }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={async e => { await cargar(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--border-light)", borderTopColor: "var(--accent)", animationDuration: "0.6s" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Cargando...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)" }}>
              <AlertTriangle size={22} style={{ color: "var(--danger)" }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>No se pudo cargar el dashboard</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Verifica la conexión con el servidor</p>
            </div>
            <button onClick={cargar}
              className="press px-5 py-2 rounded-xl text-sm font-semibold transition-opacity"
              style={{ background: "var(--accent)", color: "#fff" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Reintentar
            </button>
          </div>
        ) : data && (
          <div className="px-4 py-5 pb-24 space-y-5">

            {/* Stat cards 2x3 */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
              <StatCard label="Motos en taller"   value={data.ot.activas}           icon={Bike}           color="var(--accent)" />
              <StatCard label="Atrasadas"          value={data.ot.atrasadas}          icon={AlertTriangle}  color="var(--danger)" />
              <StatCard label="Listas p/entregar"  value={data.ot.listas}             icon={CheckCircle2}   color="var(--success)" />
              <StatCard label="Stock bajo"         value={data.inventario.stock_bajo}  icon={PackageX}       color="var(--warning)" />
              <StatCard label="Citas hoy"          value={data.citas_hoy}             icon={CalendarCheck}  color="var(--info)" />
              <StatCard label="Entregadas hoy"     value={data.ot.entregadas_hoy}     icon={TrendingUp}     color="#8B5CF6" />
            </motion.div>

            {/* Facturación + métricas */}
            <motion.div {...section(0.04)}>
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={15} style={{ color: "var(--success)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Facturación</p>
                  </div>
                  <ArrowUpRight size={14} style={{ color: "var(--text-muted)" }} />
                </div>
                {[
                  { label: "Hoy",    val: data.facturacion.hoy,    color: "var(--success)" },
                  { label: "Semana", val: data.facturacion.semana, color: "var(--text-primary)" },
                  { label: "Mes",    val: data.facturacion.mes,    color: "var(--text-primary)" },
                ].map((r, i) => (
                  <div key={r.label} className="flex items-center justify-between px-5 py-3.5"
                    style={{ borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.label}</span>
                    <span className="font-bold text-sm" style={{ color: r.color }}>{fmt(Number(r.val ?? 0))}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-5 py-3" style={{ background: "var(--bg-hover)", borderTop: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                    <Clock size={12} />
                    <span className="text-xs">Tiempo prom. reparacion</span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{data.tiempo_promedio_horas}h</span>
                </div>
              </div>
            </motion.div>

            {/* Alertas semáforo */}
            {(data.ot.semaforo_rojo > 0 || data.ot.semaforo_amarillo > 0) && (
              <motion.div {...section(0.08)}>
                <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={14} style={{ color: "var(--warning)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Alertas de tiempo</p>
                  </div>
                  <div className="space-y-2">
                    {data.ot.semaforo_rojo > 0 && (
                      <div className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: "var(--danger)" }} />
                          <span className="text-sm" style={{ color: "var(--text-primary)" }}>OT vencidas</span>
                        </div>
                        <span className="font-black text-sm" style={{ color: "var(--danger)" }}>{data.ot.semaforo_rojo}</span>
                      </div>
                    )}
                    {data.ot.semaforo_amarillo > 0 && (
                      <div className="flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.12)" }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: "var(--warning)" }} />
                          <span className="text-sm" style={{ color: "var(--text-primary)" }}>Proximas a vencer</span>
                        </div>
                        <span className="font-black text-sm" style={{ color: "var(--warning)" }}>{data.ot.semaforo_amarillo}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Técnicos */}
            {data.tecnicos_productivos?.length > 0 && (
              <motion.div {...section(0.12)}>
                <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                    <Wrench size={14} style={{ color: "var(--accent)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Tecnicos del mes</p>
                  </div>
                  {data.tecnicos_productivos.map((t: any, i: number) => (
                    <div key={t.id} className="flex items-center gap-3 px-5 py-3"
                      style={{ borderBottom: i < data.tecnicos_productivos.length - 1 ? "1px solid var(--border)" : "none" }}>
                      <span className="text-xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{t.nombre}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.total_ot} OT</p>
                      </div>
                      <span className="text-sm font-black" style={{ color: "var(--success)" }}>{t.entregadas} ✓</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* OT activas */}
            <motion.div {...section(0.16)}>
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <Bike size={14} style={{ color: "var(--accent)" }} />
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>OT Activas</p>
                  </div>
                  <button onClick={() => history.push("/ordenes-trabajo")}
                    className="press flex items-center gap-1 text-xs font-medium transition-opacity"
                    style={{ color: "var(--accent)" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    Ver todas <ChevronRight size={12} />
                  </button>
                </div>
                {data.ultimas_ot?.length === 0 ? (
                  <div className="px-5 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    No hay OT activas en este momento.
                  </div>
                ) : (
                  data.ultimas_ot?.map((ot: any, i: number) => {
                    const cfg = estadoBadge[ot.estado] ?? estadoBadge.recepcion;
                    return (
                      <button key={ot.id} onClick={() => history.push("/ordenes-trabajo/" + ot.id)}
                        className="press w-full flex items-center gap-3 px-5 py-3.5 text-left"
                        style={{ borderBottom: i < data.ultimas_ot.length - 1 ? "1px solid var(--border)" : "none" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ot.numero_ot}</p>
                          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{ot.moto}</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
                          style={{ background: cfg.bg, color: cfg.color }}>{ot.estado}</span>
                        <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;