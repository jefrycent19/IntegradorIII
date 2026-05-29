import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, UserCog, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const OtReasignarTecnico: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [carga, setCarga] = useState<Record<number, number>>({});
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [actual, setActual] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Carga OT actual para saber el técnico actual
    api.get(`/ordenes-trabajo/${id}`).then(({ data }) => {
      setActual(data.tecnico_id);
      setSeleccionado(data.tecnico_id);
    });
    // Carga lista de técnicos y su carga actual
    api.get("/usuarios", { params: { rol: "Técnico", activo: true } }).then(({ data }) => {
      setTecnicos(data);
    });
    api.get("/dashboard").then(({ data }) => {
      const map: Record<number, number> = {};
      data.carga_tecnicos?.forEach((t: any) => { map[t.id] = t.ot_activas; });
      setCarga(map);
    });
  }, [id]);

  const guardar = async () => {
    if (!seleccionado) { setError("Selecciona un técnico."); return; }
    setGuardando(true);
    try {
      await api.patch(`/ordenes-trabajo/${id}`, { tecnico_id: seleccionado });
      history.goBack();
    } catch {
      setError("Error al reasignar el técnico.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col min-h-full" style={{ background: "#F1F5F9" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-14 pb-5 bg-white shadow-sm">
            <button onClick={() => history.goBack()} className="p-2 rounded-xl hover:bg-gray-100 transition-colors" style={{ color: "#6B7280" }}>
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <UserCog size={18} style={{ color: "#0F2A3D" }} />
              <div>
                <h1 className="font-bold text-lg leading-none" style={{ color: "#1F2937" }}>Asignar Técnico</h1>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>OT #{id}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 space-y-3 pb-32">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>
              Selecciona el técnico — la carga indica OT activas asignadas
            </p>

            {tecnicos.map((t) => {
              const otActivas = carga[t.id] ?? 0;
              const esActual = t.id === actual;
              const esSeleccionado = t.id === seleccionado;
              const colorCarga = otActivas === 0 ? "#22C55E" : otActivas <= 2 ? "#F59E0B" : "#DC2626";

              return (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSeleccionado(t.id); setError(""); }}
                  className="w-full text-left rounded-2xl bg-white shadow-sm transition-all"
                  style={{
                    border: esSeleccionado ? "2px solid #0F2A3D" : "2px solid transparent",
                    boxShadow: esSeleccionado ? "0 4px 16px rgba(15,42,61,0.1)" : "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #0F2A3D, #163449)" }}>
                      {t.nombre?.[0]}{t.apellido?.[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold" style={{ color: "#1F2937" }}>{t.nombre} {t.apellido}</p>
                        {esActual && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EFF6FF", color: "#0F2A3D" }}>
                            Actual
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full" style={{ background: colorCarga }} />
                          <span className="text-xs font-medium" style={{ color: colorCarga }}>
                            {otActivas} OT activas
                          </span>
                        </div>
                        {otActivas === 0 && <span className="text-xs" style={{ color: "#9CA3AF" }}>— Disponible</span>}
                        {otActivas >= 3 && <span className="text-xs" style={{ color: "#DC2626" }}>— Carga alta</span>}
                      </div>
                    </div>

                    {/* Check */}
                    {esSeleccionado && (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "#0F2A3D" }}>
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Barra de carga */}
                  <div className="px-5 pb-3">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(otActivas * 20, 100)}%`, background: colorCarga }} />
                    </div>
                  </div>
                </motion.button>
              );
            })}

            {error && <p className="text-sm font-medium" style={{ color: "#DC2626" }}>{error}</p>}
          </div>

          {/* Botón fijo */}
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-10 pt-4 bg-white lg:left-60" style={{ borderTop: "1px solid #E5E7EB" }}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={guardar}
              disabled={guardando || !seleccionado}
              className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: !seleccionado ? "#E5E7EB" : "linear-gradient(135deg, #0F2A3D, #163449)",
                color: !seleccionado ? "#9CA3AF" : "#fff",
                boxShadow: seleccionado ? "0 8px 24px rgba(15,42,61,0.2)" : "none",
              }}
            >
              {guardando
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><UserCog size={16} /> Confirmar asignacion</>}
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtReasignarTecnico;