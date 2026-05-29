import { IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Clock, Users, Package, Star, ArrowUpRight, Target, Percent } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { cn } from "../../lib/utils";

const fmt = (n: number) => n.toLocaleString("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });

const tabs = [
  { id: "operativos",    label: "Operativos",    icon: BarChart3 },
  { id: "financieros",   label: "Financieros",   icon: TrendingUp },
  { id: "productividad", label: "Productividad", icon: Users },
];

const Reportes: React.FC = () => {
  const [tab, setTab] = useState("operativos");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.get("/dashboard").then(({ data }) => { setData(data); setLoading(false); });
  }, []);

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Reportes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "var(--bg-hover)" }}>
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="relative flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 overflow-hidden"
                  style={{
                    background: active
                      ? "linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.06) 100%)"
                      : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-muted)",
                    border: active ? "1px solid rgba(249,115,22,0.25)" : "1px solid transparent",
                    boxShadow: active ? "0 2px 12px rgba(249,115,22,0.12)" : "none",
                  }}>
                  <t.icon size={14} strokeWidth={active ? 2.5 : 2}
                    style={{ color: active ? "var(--accent)" : "currentColor" }} />
                  <span>{t.label}</span>
                  {active && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full"
                      style={{ background: "var(--accent)", boxShadow: "0 0 8px rgba(249,115,22,0.8)" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="px-4 py-5 pb-24">

            {/* OPERATIVOS */}
            {tab === "operativos" && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                <motion.div variants={item}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>OT por Estado</p>
                  <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1a1a1a" }}>
                    {[
                      ["Recepcion",   data?.ot?.por_estado?.recepcion   ?? 0, "#888888"],
                      ["Diagnostico", data?.ot?.por_estado?.diagnostico ?? 0, "#f59e0b"],
                      ["Reparacion",  data?.ot?.por_estado?.reparacion  ?? 0, "#3b82f6"],
                      ["Lista",       data?.ot?.por_estado?.lista       ?? 0, "#10b981"],
                      ["Entregada",   data?.ot?.por_estado?.entregada   ?? 0, "#6b7280"],
                    ].map(([label, val, color], i, arr) => {
                      const max = Math.max(...arr.map(x => Number(x[1])), 1);
                      return (
                        <div key={label as string} className="px-5 py-4" style={{ borderBottom: i < arr.length - 1 ? "1px solid #111111" : "none", background: "#0c0c0c" }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium" style={{ color: "#888" }}>{label}</span>
                            <span className="font-bold text-white">{val}</span>
                          </div>
                          <div className="h-1.5 rounded-full" style={{ background: "#1a1a1a" }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${(Number(val) / max) * 100}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 }}
                              className="h-full rounded-full" style={{ background: color as string }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div variants={item}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Indicadores clave</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Motos activas",     value: data?.ot?.activas ?? 0,          icon: BarChart3,  color: "#3b82f6" },
                      { label: "Atrasadas",          value: data?.ot?.atrasadas ?? 0,         icon: Clock,      color: "#ef4444" },
                      { label: "Listas p/entregar",  value: data?.ot?.listas ?? 0,            icon: Star,       color: "#10b981" },
                      { label: "Entregadas hoy",     value: data?.ot?.entregadas_hoy ?? 0,    icon: TrendingUp, color: "#8b5cf6" },
                      { label: "Sem. rojas",         value: data?.ot?.semaforo_rojo ?? 0,     icon: Clock,      color: "#ef4444" },
                      { label: "Citas hoy",          value: data?.citas_hoy ?? 0,             icon: Users,      color: "#f59e0b" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl p-4" style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: s.color + "15" }}>
                          <s.icon size={15} style={{ color: s.color }} />
                        </div>
                        <p className="text-2xl font-black text-white">{s.value}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#555" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div variants={item}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Tiempo promedio reparacion</p>
                  <div className="rounded-2xl px-5 py-4 flex items-center justify-between" style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
                        <Clock size={18} style={{ color: "#3b82f6" }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "#888" }}>Promedio en taller</span>
                    </div>
                    <span className="font-black text-2xl text-white">{data?.tiempo_promedio_horas ?? 0}h</span>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* FINANCIEROS */}
            {tab === "financieros" && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">

                {/* Facturación por período */}
                <motion.div variants={item}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)", opacity: 0.6 }}>Facturacion</p>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    {[
                      ["Hoy",    data?.facturacion?.hoy,    "var(--success)"],
                      ["Semana", data?.facturacion?.semana, "var(--text-primary)"],
                      ["Mes",    data?.facturacion?.mes,    "var(--text-primary)"],
                    ].map(([label, val, color], i) => (
                      <div key={label as string} className="flex items-center justify-between px-5 py-3.5"
                        style={{ borderBottom: i < 2 ? "1px solid var(--border)" : "none" }}>
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
                        <span className="font-bold text-base" style={{ color: color as string }}>{fmt(Number(val ?? 0))}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-5 py-3" style={{ background: "var(--bg-hover)", borderTop: "1px solid var(--border)" }}>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Ticket promedio</span>
                      <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{fmt(data?.facturacion?.ticket_promedio ?? 0)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Rentabilidad estimada */}
                <motion.div variants={item}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)", opacity: 0.6 }}>Rentabilidad estimada — este mes</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderTop: "3px solid var(--success)" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(34,197,94,0.12)" }}>
                        <TrendingUp size={18} style={{ color: "var(--success)" }} />
                      </div>
                      <p className="text-2xl font-black" style={{ color: "var(--success)", letterSpacing: "-0.03em" }}>
                        {fmt(data?.rentabilidad?.estimada_mes ?? 0)}
                      </p>
                      <p className="text-xs font-medium mt-1" style={{ color: "var(--text-muted)" }}>Ganancia estimada</p>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderTop: "3px solid #7C3AED" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(124,58,237,0.12)" }}>
                        <Percent size={18} style={{ color: "#7C3AED" }} />
                      </div>
                      <p className="text-2xl font-black" style={{ color: "#7C3AED", letterSpacing: "-0.03em" }}>
                        {data?.rentabilidad?.margen_porcentaje ?? 0}%
                      </p>
                      <p className="text-xs font-medium mt-1" style={{ color: "var(--text-muted)" }}>Margen del mes</p>
                    </div>
                  </div>
                  <div className="rounded-2xl p-4 mt-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderTop: "3px solid var(--warning)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(234,179,8,0.12)" }}>
                          <Package size={18} style={{ color: "var(--warning)" }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Costo de repuestos</p>
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Estimado este mes</p>
                        </div>
                      </div>
                      <p className="font-bold" style={{ color: "var(--warning)" }}>{fmt(data?.rentabilidad?.costo_repuestos ?? 0)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Conversión diagnóstico → reparación */}
                <motion.div variants={item}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)", opacity: 0.6 }}>Conversion diagnostico → reparacion</p>
                  <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Target size={16} style={{ color: "var(--accent)" }} />
                        <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Tasa de conversion</span>
                      </div>
                      <span className="font-black text-2xl" style={{ color: "var(--text-primary)" }}>
                        {data?.conversion?.tasa_porcentaje ?? 0}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bg-hover)" }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${data?.conversion?.tasa_porcentaje ?? 0}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full rounded-full" style={{ background: "linear-gradient(90deg, var(--accent), var(--success))" }} />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>{data?.conversion?.total_diagnosticos ?? 0} diagnosticos totales</span>
                      <span className="text-xs font-semibold" style={{ color: "var(--success)" }}>{data?.conversion?.aprobados ?? 0} aprobados</span>
                    </div>
                  </div>
                </motion.div>

                {/* Tendencia 7 días */}
                {data?.tendencia_7dias?.length > 0 && (
                  <motion.div variants={item}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)", opacity: 0.6 }}>Tendencia ultimos 7 dias</p>
                    <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                      {(() => {
                        const max = Math.max(...data.tendencia_7dias.map((d: any) => d.total), 1);
                        return (
                          <div className="flex items-end gap-2 h-20">
                            {data.tendencia_7dias.map((d: any, i: number) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${Math.max((d.total / max) * 100, 4)}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.08 }}
                                  className="w-full rounded-t-lg"
                                  style={{ background: d.total > 0 ? "var(--accent)" : "var(--border)", minHeight: 4 }}
                                />
                                <span className="text-xs" style={{ color: "var(--text-muted)", fontSize: "0.6rem" }}>{d.fecha}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

              </motion.div>
            )}

            {/* PRODUCTIVIDAD */}
            {tab === "productividad" && (
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
                <motion.div variants={item}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Ranking de tecnicos — este mes</p>
                  {data?.tecnicos_productivos?.length === 0 ? (
                    <div className="rounded-2xl px-5 py-10 text-center" style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }}>
                      <Users size={32} className="mx-auto mb-3" style={{ color: "#333" }} />
                      <p className="text-sm" style={{ color: "#555" }}>Sin datos de tecnicos este mes.</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1a1a1a" }}>
                      {data?.tecnicos_productivos?.map((t: any, i: number) => {
                        const pct = data.tecnicos_productivos[0]?.total_ot > 0 ? (t.total_ot / data.tecnicos_productivos[0].total_ot) * 100 : 0;
                        return (
                          <div key={t.id} className="px-5 py-4" style={{ background: "#0c0c0c", borderBottom: i < data.tecnicos_productivos.length - 1 ? "1px solid #111111" : "none" }}>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm truncate">{t.nombre}</p>
                                <p className="text-xs" style={{ color: "#555" }}>{t.total_ot} OT asignadas • {t.entregadas} entregadas</p>
                              </div>
                              <span className="font-black text-sm" style={{ color: "#10b981" }}>{t.entregadas > 0 ? Math.round((t.entregadas / t.total_ot) * 100) : 0}%</span>
                            </div>
                            <div className="h-1.5 rounded-full" style={{ background: "#1a1a1a" }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="h-full rounded-full" style={{ background: i === 0 ? "#f59e0b" : i === 1 ? "#6b7280" : "#a16207" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>

                <motion.div variants={item}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Resumen del taller</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "OT activas",    value: data?.ot?.activas ?? 0,        color: "#3b82f6" },
                      { label: "OT atrasadas",  value: data?.ot?.atrasadas ?? 0,       color: "#ef4444" },
                      { label: "Alertas rojas", value: data?.ot?.semaforo_rojo ?? 0,   color: "#ef4444" },
                      { label: "Citas hoy",     value: data?.citas_hoy ?? 0,           color: "#f59e0b" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl p-4" style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }}>
                        <p className="text-3xl font-black text-white mb-1">{s.value}</p>
                        <p className="text-xs" style={{ color: "#555" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Reportes;