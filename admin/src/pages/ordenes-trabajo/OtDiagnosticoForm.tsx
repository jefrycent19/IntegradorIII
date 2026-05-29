import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, Stethoscope, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const prioridades = [
  { value: "rapido",     label: "Rapido",     color: "#f59e0b" },
  { value: "preventivo", label: "Preventivo", color: "#3b82f6" },
  { value: "mayor",      label: "Mayor",      color: "#8b5cf6" },
  { value: "garantia",   label: "Garantia",   color: "#10b981" },
  { value: "emergencia", label: "Emergencia", color: "#ef4444" },
];

const OtDiagnosticoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [form, setForm] = useState({
    descripcion_fallas: "",
    mano_obra_estimada: "",
    tiempo_estimado_horas: "",
    prioridad_sugerida: "preventivo",
    observaciones: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const set = (campo: string) => (e: any) =>
    setForm(prev => ({ ...prev, [campo]: e.target.value }));

  const guardar = async () => {
    if (!form.descripcion_fallas.trim()) { setError("Describe las fallas detectadas."); return; }
    if (!form.mano_obra_estimada || Number(form.mano_obra_estimada) < 0) { setError("Ingresa la mano de obra estimada."); return; }
    if (!form.tiempo_estimado_horas || Number(form.tiempo_estimado_horas) <= 0) { setError("Ingresa el tiempo estimado."); return; }
    setGuardando(true);
    try {
      await api.post(`/ordenes-trabajo/${id}/diagnostico`, {
        ...form,
        mano_obra_estimada: Number(form.mano_obra_estimada),
        tiempo_estimado_horas: Number(form.tiempo_estimado_horas),
      });
      history.goBack();
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al guardar el diagnostico.");
    } finally {
      setGuardando(false);
    }
  };

  const inputStyle = { background: "#0f0f0f", border: "1px solid #1a1a1a" };
  const focusStyle = "1px solid rgba(59,130,246,0.5)";

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col min-h-full" style={{ background: "#080808" }}>
          <div className="flex items-center gap-3 px-5 pt-14 pb-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
            <button onClick={() => history.goBack()} className="p-2 rounded-xl hover:bg-white/5" style={{ color: "#888" }}>
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Stethoscope size={18} style={{ color: "#3b82f6" }} />
              <div>
                <h1 className="text-white font-bold text-lg leading-none">Registrar Diagnostico</h1>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>OT #{id}</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 space-y-5 pb-32">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Fallas detectadas *</label>
              <textarea value={form.descripcion_fallas} onChange={set("descripcion_fallas")}
                placeholder="Describe detalladamente todas las fallas encontradas en la motocicleta..."
                rows={5} className="w-full text-sm text-white placeholder-white/20 rounded-2xl p-4 outline-none resize-none"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = focusStyle}
                onBlur={e => e.currentTarget.style.border = "1px solid #1a1a1a"} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Mano de obra (CRC) *</label>
                <input type="number" value={form.mano_obra_estimada} onChange={set("mano_obra_estimada")}
                  placeholder="0" min="0" step="500"
                  className="w-full px-4 py-3.5 text-sm text-white rounded-2xl outline-none"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.border = focusStyle}
                  onBlur={e => e.currentTarget.style.border = "1px solid #1a1a1a"} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Tiempo estimado (h) *</label>
                <input type="number" value={form.tiempo_estimado_horas} onChange={set("tiempo_estimado_horas")}
                  placeholder="1" min="0.5" step="0.5"
                  className="w-full px-4 py-3.5 text-sm text-white rounded-2xl outline-none"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.border = focusStyle}
                  onBlur={e => e.currentTarget.style.border = "1px solid #1a1a1a"} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Prioridad sugerida</label>
              <div className="flex flex-wrap gap-2">
                {prioridades.map((p) => (
                  <button key={p.value} onClick={() => setForm(prev => ({ ...prev, prioridad_sugerida: p.value }))}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: form.prioridad_sugerida === p.value ? p.color + "20" : "#0f0f0f",
                      border: form.prioridad_sugerida === p.value ? "1px solid " + p.color + "60" : "1px solid #1a1a1a",
                      color: form.prioridad_sugerida === p.value ? p.color : "#666",
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Observaciones adicionales</label>
              <textarea value={form.observaciones} onChange={set("observaciones")}
                placeholder="Recomendaciones, notas adicionales para el cliente o el jefe de taller..."
                rows={3} className="w-full text-sm text-white placeholder-white/20 rounded-2xl p-4 outline-none resize-none"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = focusStyle}
                onBlur={e => e.currentTarget.style.border = "1px solid #1a1a1a"} />
            </div>

            {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}

            <div className="rounded-2xl p-4" style={{ background: "#0a1628", border: "1px solid rgba(59,130,246,0.15)" }}>
              <p className="text-xs" style={{ color: "#3b82f6" }}>
                Al guardar, la OT cambia al estado <strong>Diagnostico</strong> y queda pendiente de aprobacion del jefe de taller.
              </p>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 lg:left-60" style={{ background: "#080808", borderTop: "1px solid #1a1a1a" }}>
            <motion.button whileTap={{ scale: 0.98 }} onClick={guardar} disabled={guardando}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", boxShadow: "0 8px 24px rgba(59,130,246,0.25)" }}>
              {guardando
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><CheckCircle2 size={16} /> Guardar diagnostico</>}
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtDiagnosticoForm;