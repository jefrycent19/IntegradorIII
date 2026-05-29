import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, Send, Clock } from "lucide-react";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const OtAvanceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    if (!descripcion.trim()) { setError("Describe el avance realizado."); return; }
    setGuardando(true);
    try {
      await api.post(`/ordenes-trabajo/${id}/avances`, { descripcion });
      history.goBack();
    } catch {
      setError("Error al registrar el avance.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY={false}>
        <div className="flex flex-col h-full" style={{ background: "#080808" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-14 pb-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
            <button onClick={() => history.goBack()} className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: "#888" }}>
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Registrar Avance</h1>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>OT #{id}</p>
            </div>
          </div>

          <div className="flex-1 px-5 py-6 space-y-5 overflow-y-auto">
            {/* Timestamp */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }}>
              <Clock size={14} style={{ color: "#3b82f6" }} />
              <span className="text-sm" style={{ color: "#888" }}>
                {new Date().toLocaleString("es-CR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
            </motion.div>

            {/* Textarea */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>
                Descripción del avance *
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => { setDescripcion(e.target.value); setError(""); }}
                placeholder="Describe detalladamente el trabajo realizado, piezas revisadas, resultados encontrados..."
                rows={8}
                autoFocus
                className="w-full text-sm text-white placeholder-white/20 rounded-2xl p-4 outline-none resize-none transition-all"
                style={{
                  background: "#0f0f0f",
                  border: error ? "1px solid rgba(239,68,68,0.5)" : "1px solid #1a1a1a",
                }}
                onFocus={e => e.currentTarget.style.border = "1px solid rgba(59,130,246,0.5)"}
                onBlur={e => e.currentTarget.style.border = error ? "1px solid rgba(239,68,68,0.5)" : "1px solid #1a1a1a"}
              />
              <div className="flex items-center justify-between mt-2">
                {error ? <p className="text-xs" style={{ color: "#ef4444" }}>{error}</p> : <span />}
                <p className="text-xs" style={{ color: "#444" }}>{descripcion.length} caracteres</p>
              </div>
            </motion.div>
          </div>

          {/* Botón */}
          <div className="px-5 pb-10 pt-4" style={{ borderTop: "1px solid #1a1a1a" }}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={guardar}
              disabled={guardando || !descripcion.trim()}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: guardando || !descripcion.trim() ? "#1a1a1a" : "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: guardando || !descripcion.trim() ? "#444" : "#fff",
                boxShadow: descripcion.trim() ? "0 8px 24px rgba(59,130,246,0.25)" : "none",
              }}
            >
              {guardando
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send size={16} /> Registrar avance</>}
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtAvanceForm;
