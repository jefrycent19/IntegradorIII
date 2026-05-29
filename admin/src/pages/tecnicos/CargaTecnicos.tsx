import { IonContent, IonHeader, IonMenuButton, IonPage, IonRefresher, IonRefresherContent, IonSpinner, IonTitle, IonToolbar } from "@ionic/react";
import { motion } from "framer-motion";
import { Users, Bike, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";

const estadoBadge: Record<string, { bg: string; text: string }> = {
  recepcion:   { bg: "#EFF6FF", text: "#1D4ED8" },
  diagnostico: { bg: "#FFFBEB", text: "#B45309" },
  reparacion:  { bg: "#EFF6FF", text: "#1E40AF" },
  lista:       { bg: "#F0FDF4", text: "#15803D" },
  entregada:   { bg: "#F9FAFB", text: "#6B7280" },
};

const CargaTecnicos: React.FC = () => {
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [otsPorTecnico, setOtsPorTecnico] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const cargar = async () => {
    setLoading(true);
    const [usuariosRes, otsRes] = await Promise.all([
      api.get("/usuarios", { params: { rol: "Técnico" } }),
      api.get("/ordenes-trabajo", { params: { per_page: 100 } }),
    ]);

    const tecnicos = usuariosRes.data.filter((u: any) => u.rol?.nombre === "Técnico" && u.activo);
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
    setLoading(false);
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
          <div className="flex items-center justify-center h-48">
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <div className="px-4 py-5 pb-24 space-y-4">

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Técnicos",   value: tecnicos.length,                                   icon: Users,         color: "#0F2A3D" },
                { label: "OT activas", value: Object.values(otsPorTecnico).flat().length,          icon: Bike,          color: "#F59E0B" },
                { label: "Sin carga",  value: tecnicos.filter(t => !otsPorTecnico[t.id]?.length).length, icon: CheckCircle2, color: "#22C55E" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-2xl p-3 shadow-sm text-center" style={{ borderTop: `3px solid ${s.color}` }}>
                  <s.icon size={18} className="mx-auto mb-1.5" style={{ color: s.color }} />
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Técnicos */}
            {tecnicos.map((t, i) => {
              const ots = otsPorTecnico[t.id] ?? [];
              const pct = maxCarga > 0 ? (ots.length / maxCarga) * 100 : 0;
              const colorCarga = ots.length === 0 ? "#22C55E" : ots.length <= 2 ? "#F59E0B" : "#DC2626";

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  style={{ borderLeft: `4px solid ${colorCarga}` }}
                >
                  {/* Header técnico */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0F2A3D, #163449)" }}>
                      {t.nombre?.[0]}{t.apellido?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: "#1F2937" }}>{t.nombre} {t.apellido}</p>
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
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
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
                    <div style={{ borderTop: "1px solid #F3F4F6" }}>
                      {ots.map((ot: any, j: number) => {
                        const cfg = estadoBadge[ot.estado] ?? estadoBadge.recepcion;
                        const atrasada = ot.fecha_estimada_entrega &&
                          new Date(ot.fecha_estimada_entrega) < new Date();
                        return (
                          <button
                            key={ot.id}
                            onClick={() => history.push(`/ordenes-trabajo/${ot.id}`)}
                            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                            style={{ borderBottom: j < ots.length - 1 ? "1px solid #F9FAFB" : "none" }}
                          >
                            <Bike size={14} style={{ color: "#9CA3AF", flexShrink: 0 }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold" style={{ color: "#1F2937" }}>{ot.numero_ot}</p>
                              <p className="text-xs truncate" style={{ color: "#9CA3AF" }}>
                                {ot.motocicleta?.marca} {ot.motocicleta?.modelo} — {ot.motocicleta?.placa}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {atrasada && <AlertTriangle size={13} style={{ color: "#DC2626" }} />}
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
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
                      <p className="text-xs" style={{ color: "#9CA3AF" }}>
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