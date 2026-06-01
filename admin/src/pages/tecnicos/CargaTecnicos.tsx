import { IonContent, IonHeader, IonMenuButton, IonPage, IonRefresher, IonRefresherContent, IonSpinner, IonTitle, IonToolbar } from "@ionic/react";
import { motion } from "framer-motion";
import { Users, Bike, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";

const estadoBadge: Record<string, { bg: string; text: string }> = {
  recepcion:   { bg: "var(--bg-hover)",        text: "var(--text-secondary)" },
  diagnostico: { bg: "rgba(234,179,8,0.12)",   text: "var(--warning)" },
  reparacion:  { bg: "rgba(59,130,246,0.12)",  text: "var(--info)" },
  lista:       { bg: "rgba(34,197,94,0.12)",   text: "var(--success)" },
  entregada:   { bg: "var(--bg-hover)",        text: "var(--text-muted)" },
};

const CargaTecnicos: React.FC = () => {
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [otsPorTecnico, setOtsPorTecnico] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const cargar = async () => {
    setLoading(true);
    try {
      const [usuariosRes, otsRes] = await Promise.all([
        api.get("/usuarios", { params: { rol: "Técnico" } }),
        api.get("/ordenes-trabajo", { params: { per_page: 100 } }),
      ]);

      const tecnicos = (usuariosRes.data ?? []).filter((u: any) => u.rol?.nombre === "Técnico" && u.activo);
      const ots = otsRes.data.data ?? [];

      const map: Record<number, any[]> = {};
      tecnicos.forEach((t: any) => { map[t.id] = []; });
      ots.forEach((ot: any) => {
        if (ot.tecnico_id && map[ot.tecnico_id] !== undefined && ot.estado !== "entregada") {
          map[ot.tecnico_id].push(ot);
        }
      });

      setTecnicos(tecnicos);
      setOtsPorTecnico(map);
    } catch { setTecnicos([]); setOtsPorTecnico({}); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const maxCarga = Math.max(...tecnicos.map(t => otsPorTecnico[t.id]?.length ?? 0), 1);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Carga de Técnicos</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await cargar(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <div className="flex items-center justify-center h-48"><IonSpinner name="crescent" /></div>
        ) : (
          <div className="px-4 py-5 pb-24 space-y-4">

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Técnicos",   value: tecnicos.length,                                            icon: Users,        color: "var(--accent)" },
                { label: "OT activas", value: Object.values(otsPorTecnico).flat().length,                 icon: Bike,         color: "var(--warning)" },
                { label: "Sin carga",  value: tecnicos.filter(t => !otsPorTecnico[t.id]?.length).length,  icon: CheckCircle2, color: "var(--success)" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl p-3 text-center"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1.5" style={{ background: `${s.color}1f` }}>
                    <s.icon size={16} style={{ color: s.color }} />
                  </div>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {tecnicos.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 gap-3" style={{ color: "var(--text-muted)" }}>
                <Users size={40} className="opacity-30" />
                <p className="text-sm">No hay técnicos activos</p>
              </div>
            )}

            {/* Técnicos */}
            {tecnicos.map((t, i) => {
              const ots = otsPorTecnico[t.id] ?? [];
              const pct = maxCarga > 0 ? (ots.length / maxCarga) * 100 : 0;
              const colorCarga = ots.length === 0 ? "var(--success)" : ots.length <= 2 ? "var(--warning)" : "var(--danger)";

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                >
                  {/* Header técnico */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--accent), #DC2626)" }}>
                      {t.nombre?.[0]}{t.apellido?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{t.nombre} {t.apellido}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: colorCarga }} />
                        <span className="text-xs font-medium" style={{ color: colorCarga }}>
                          {ots.length === 0 ? "Sin OT asignadas" : `${ots.length} OT activa${ots.length > 1 ? "s" : ""}`}
                        </span>
                      </div>
                    </div>
                    {ots.length > 0 && (
                      <span className="text-2xl font-black" style={{ color: colorCarga }}>{ots.length}</span>
                    )}
                  </div>

                  {/* Barra de carga */}
                  <div className="px-5 pb-3">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-hover)" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.07 }}
                        className="h-full rounded-full"
                        style={{ background: colorCarga }}
                      />
                    </div>
                  </div>

                  {/* OT asignadas */}
                  {ots.length > 0 && (
                    <div style={{ borderTop: "1px solid var(--border)" }}>
                      {ots.map((ot: any, j: number) => {
                        const cfg = estadoBadge[ot.estado] ?? estadoBadge.recepcion;
                        const atrasada = ot.fecha_estimada_entrega && new Date(ot.fecha_estimada_entrega) < new Date();
                        return (
                          <button
                            key={ot.id}
                            onClick={() => history.push(`/ordenes-trabajo/${ot.id}`)}
                            className="press w-full flex items-center gap-3 px-5 py-3 text-left"
                            style={{ borderBottom: j < ots.length - 1 ? "1px solid var(--border)" : "none" }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
                            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                          >
                            <Bike size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{ot.numero_ot}</p>
                              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                {ot.motocicleta?.marca} {ot.motocicleta?.modelo} — {ot.motocicleta?.placa}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {atrasada && <AlertTriangle size={13} style={{ color: "var(--danger)" }} />}
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize"
                                style={{ background: cfg.bg, color: cfg.text }}>
                                {ot.estado}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {ots.length === 0 && (
                    <div className="px-5 pb-4 pt-1">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Disponible para nuevas asignaciones
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default CargaTecnicos;
