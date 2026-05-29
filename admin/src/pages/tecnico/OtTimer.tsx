import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, Play, Pause, Square, Clock, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(v => String(v).padStart(2, "0")).join(":");
};

const OtTimer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [ot, setOt] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [sessions, setSessions] = useState<{ inicio: Date; fin: Date | null; duracion: number }[]>([]);
  const [guardando, setGuardando] = useState(false);
  const intervalRef = useRef<any>(null);

  useEffect(() => {
    api.get(`/ordenes-trabajo/${id}`).then(({ data }) => setOt(data));
    // Restaurar timer de localStorage si existía
    const saved = localStorage.getItem(`timer_ot_${id}`);
    if (saved) {
      const { start, accum } = JSON.parse(saved);
      if (start) {
        const now = Date.now();
        setElapsed(accum + Math.floor((now - start) / 1000));
        setStartTime(start);
        setRunning(true);
      } else {
        setElapsed(accum);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [id]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const iniciar = () => {
    const now = Date.now();
    setStartTime(now);
    setRunning(true);
    const accum = elapsed;
    localStorage.setItem(`timer_ot_${id}`, JSON.stringify({ start: now, accum }));
  };

  const pausar = () => {
    setRunning(false);
    if (startTime) {
      const duracion = Math.floor((Date.now() - startTime) / 1000);
      setSessions(prev => [...prev, { inicio: new Date(startTime), fin: new Date(), duracion }]);
    }
    localStorage.setItem(`timer_ot_${id}`, JSON.stringify({ start: null, accum: elapsed }));
  };

  const detener = () => {
    pausar();
    setElapsed(0);
    setStartTime(null);
    localStorage.removeItem(`timer_ot_${id}`);
  };

  const guardarAvance = async () => {
    const horas = (elapsed / 3600).toFixed(2);
    const descripcion = `Tiempo de trabajo registrado: ${formatTime(elapsed)} (${horas}h). ${sessions.length} sesion(es) de trabajo.`;
    setGuardando(true);
    try {
      await api.post(`/ordenes-trabajo/${id}/avances`, { descripcion });
      detener();
      history.goBack();
    } finally {
      setGuardando(false);
    }
  };

  const colorTiempo = elapsed < 3600 ? "#22C55E" : elapsed < 7200 ? "#F59E0B" : "#DC2626";

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col min-h-full" style={{ background: "#F1F5F9" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white shadow-sm">
            <button onClick={() => history.goBack()} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#0F2A3D" }}>
              <ChevronLeft size={18} /> Volver
            </button>
            <div className="flex-1 text-center">
              <p className="font-bold text-sm" style={{ color: "#1F2937" }}>Control de Tiempo</p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>{ot?.numero_ot}</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">

            {/* OT info */}
            {ot && (
              <div className="bg-white rounded-2xl p-4 mb-8 w-full shadow-sm text-center" style={{ borderTop: "3px solid #0F2A3D" }}>
                <p className="text-sm font-semibold" style={{ color: "#1F2937" }}>
                  {ot.motocicleta?.marca} {ot.motocicleta?.modelo}
                </p>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  {ot.motocicleta?.placa} — {ot.cliente?.nombre} {ot.cliente?.apellido}
                </p>
              </div>
            )}

            {/* Reloj */}
            <motion.div
              animate={{ scale: running ? [1, 1.01, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-56 h-56 rounded-full flex flex-col items-center justify-center mb-8 shadow-xl"
              style={{
                background: "white",
                border: `6px solid ${colorTiempo}`,
                boxShadow: `0 0 40px ${colorTiempo}30`,
              }}
            >
              <p className="text-5xl font-black tracking-tight" style={{ color: colorTiempo, fontVariantNumeric: "tabular-nums" }}>
                {formatTime(elapsed)}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: "#9CA3AF" }}>
                {running ? "⏱ Trabajando..." : elapsed > 0 ? "⏸ Pausado" : "Listo para iniciar"}
              </p>
            </motion.div>

            {/* Controles */}
            <div className="flex items-center gap-4 mb-8">
              {!running ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={iniciar}
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "#22C55E", boxShadow: "0 8px 24px rgba(34,197,94,0.35)" }}
                >
                  <Play size={28} className="text-white ml-1" />
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={pausar}
                  className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "#F59E0B", boxShadow: "0 8px 24px rgba(245,158,11,0.35)" }}
                >
                  <Pause size={28} className="text-white" />
                </motion.button>
              )}
              {elapsed > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={detener}
                  className="w-14 h-14 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: "#FEF2F2", border: "2px solid #FECACA" }}
                >
                  <Square size={18} style={{ color: "#DC2626" }} />
                </motion.button>
              )}
            </div>

            {/* Sesiones */}
            {sessions.length > 0 && (
              <div className="w-full bg-white rounded-2xl p-4 mb-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>Sesiones de trabajo</p>
                <div className="space-y-2">
                  {sessions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock size={12} style={{ color: "#9CA3AF" }} />
                        <span className="text-xs" style={{ color: "#6B7280" }}>
                          {s.inicio.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })} →{" "}
                          {s.fin?.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: "#0F2A3D" }}>{formatTime(s.duracion)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2" style={{ borderTop: "1px solid #F3F4F6" }}>
                    <span className="text-xs font-bold" style={{ color: "#6B7280" }}>Total</span>
                    <span className="text-sm font-black" style={{ color: "#0F2A3D" }}>{formatTime(elapsed)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Guardar como avance */}
            {elapsed > 0 && !running && (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={guardarAvance}
                disabled={guardando}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #0F2A3D, #163449)", boxShadow: "0 8px 24px rgba(15,42,61,0.25)" }}
              >
                {guardando
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Save size={16} /> Guardar tiempo como avance</>}
              </motion.button>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtTimer;