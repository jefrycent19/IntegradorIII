import {
  IonContent, IonHeader, IonMenuButton, IonPage,
  IonRefresher, IonRefresherContent, IonSpinner, IonTitle, IonToolbar,
} from "@ionic/react";
import { motion } from "framer-motion";
import { ClipboardList, Bike, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

const estadoConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  recepcion:   { label: "Recepcion",   color: "#1D4ED8", bg: "#EFF6FF", dot: "#3B82F6" },
  diagnostico: { label: "Diagnostico", color: "#B45309", bg: "#FFFBEB", dot: "#F59E0B" },
  reparacion:  { label: "Reparacion",  color: "#1E40AF", bg: "#EFF6FF", dot: "#0F2A3D" },
  lista:       { label: "Lista",       color: "#15803D", bg: "#F0FDF4", dot: "#22C55E" },
  entregada:   { label: "Entregada",   color: "#6B7280", bg: "#F9FAFB", dot: "#D1D5DB" },
};

const prioridadColor: Record<string, string> = {
  emergencia: "#DC2626",
  garantia:   "#7C3AED",
  rapido:     "#F59E0B",
  mayor:      "#0F2A3D",
  preventivo: "#6B7280",
};

const MisOrdenesTrabajo: React.FC = () => {
  const [ots, setOts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"activas" | "todas">("activas");
  const { user } = useAuth();
  const history = useHistory();

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get("/ordenes-trabajo", {
      params: {
        tecnico_id: user?.id,
        per_page: 50,
      },
    });
    setOts(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, []);

  const otsFiltradas = filtro === "activas"
    ? ots.filter(ot => ot.estado !== "entregada")
    : ots;

  const activas = ots.filter(ot => ot.estado !== "entregada").length;
  const atrasadas = ots.filter(ot =>
    ot.fecha_estimada_entrega &&
    new Date(ot.fecha_estimada_entrega) < new Date() &&
    ot.estado !== "entregada"
  ).length;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Mis Ordenes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await cargar(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Resumen personal */}
        <div className="bg-white px-5 py-4 shadow-sm" style={{ borderBottom: "1px solid #F3F4F6" }}>
          <p className="text-sm font-semibold mb-3" style={{ color: "#1F2937" }}>
            Hola, {user?.nombre} 👋
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Asignadas", value: ots.length, color: "#0F2A3D" },
              { label: "Activas", value: activas, color: "#F59E0B" },
              { label: "Atrasadas", value: atrasadas, color: "#DC2626" },
            ].map((s) => (
              <div key={s.label} className="text-center p-2.5 rounded-xl" style={{ background: "#F9FAFB" }}>
                <p className="font-black text-2xl leading-none mb-1" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex px-4 pt-4 gap-2">
          {[
            { key: "activas", label: "Activas" },
            { key: "todas",   label: "Todas" },
          ].map((f) => (
            <button key={f.key}
              onClick={() => setFiltro(f.key as any)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filtro === f.key ? "#0F2A3D" : "#ffffff",
                color: filtro === f.key ? "#ffffff" : "#6B7280",
                border: filtro === f.key ? "none" : "1px solid #E5E7EB",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <IonSpinner name="crescent" />
          </div>
        ) : otsFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3" style={{ color: "#9CA3AF" }}>
            <CheckCircle2 size={48} className="opacity-30" />
            <p className="font-semibold">
              {filtro === "activas" ? "No tienes OT activas" : "No tienes OT asignadas"}
            </p>
          </div>
        ) : (
          <div className="px-4 py-4 pb-24 space-y-3">
            {otsFiltradas.map((ot, i) => {
              const cfg = estadoConfig[ot.estado] ?? estadoConfig.recepcion;
              const atrasada = ot.fecha_estimada_entrega &&
                new Date(ot.fecha_estimada_entrega) < new Date() &&
                ot.estado !== "entregada";

              return (
                <motion.div
                  key={ot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => history.push(`/ordenes-trabajo/${ot.id}`)}
                  className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-all active:scale-[0.99]"
                  style={{ borderLeft: `4px solid ${cfg.dot}` }}
                >
                  {/* Número y estado */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <p className="font-bold" style={{ color: "#1F2937" }}>{ot.numero_ot}</p>
                      {atrasada && (
                        <div className="flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={11} style={{ color: "#DC2626" }} />
                          <span className="text-xs font-semibold" style={{ color: "#DC2626" }}>Atrasada</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                        style={{ color: prioridadColor[ot.prioridad] ?? "#6B7280", background: `${prioridadColor[ot.prioridad]}15` }}>
                        {ot.prioridad}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Cliente y moto */}
                  <p className="text-sm font-medium mb-1" style={{ color: "#374151" }}>
                    {ot.cliente?.nombre} {ot.cliente?.apellido}
                  </p>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Bike size={13} style={{ color: "#9CA3AF" }} />
                    <p className="text-sm" style={{ color: "#6B7280" }}>
                      {ot.motocicleta?.marca} {ot.motocicleta?.modelo} — {ot.motocicleta?.placa}
                    </p>
                  </div>

                  {/* Fechas */}
                  <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid #F3F4F6" }}>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} style={{ color: "#9CA3AF" }} />
                      <span className="text-xs" style={{ color: "#9CA3AF" }}>
                        Ingreso: {new Date(ot.fecha_ingreso).toLocaleDateString("es-CR")}
                      </span>
                    </div>
                    {ot.fecha_estimada_entrega && (
                      <span className="text-xs font-medium" style={{ color: atrasada ? "#DC2626" : "#9CA3AF" }}>
                        Entrega: {new Date(ot.fecha_estimada_entrega).toLocaleDateString("es-CR")}
                      </span>
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

export default MisOrdenesTrabajo;