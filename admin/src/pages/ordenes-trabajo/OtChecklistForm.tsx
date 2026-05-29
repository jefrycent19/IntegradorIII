import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, ClipboardCheck, Check } from "lucide-react";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const items = [
  { key: "prueba_realizada",   label: "Prueba de ruta realizada",      desc: "Se verifico el funcionamiento correcto en marcha" },
  { key: "lavado",             label: "Motocicleta lavada",             desc: "Limpieza completa antes de la entrega" },
  { key: "calidad_revisada",   label: "Control de calidad aprobado",   desc: "Revision final de todos los trabajos realizados" },
  { key: "facturacion_lista",  label: "Facturacion lista",              desc: "Factura generada y lista para cobro" },
  { key: "cliente_notificado", label: "Cliente notificado",             desc: "Se informo al cliente que la moto esta lista" },
];

const OtChecklistForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [checks, setChecks] = useState<Record<string, boolean>>({
    prueba_realizada: false, lavado: false, calidad_revisada: false,
    facturacion_lista: false, cliente_notificado: false,
  });
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  const toggle = (key: string) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  const completados = Object.values(checks).filter(Boolean).length;
  const todos = completados === items.length;

  const guardar = async () => {
    setGuardando(true);
    try {
      await api.post(`/ordenes-trabajo/${id}/checklist`, { ...checks, notas });
      history.goBack();
    } catch {
    } finally {
      setGuardando(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col min-h-full" style={{ background: "#080808" }}>
          <div className="flex items-center gap-3 px-5 pt-14 pb-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
            <button onClick={() => history.goBack()} className="p-2 rounded-xl hover:bg-white/5" style={{ color: "#888" }}>
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <ClipboardCheck size={18} style={{ color: "#10b981" }} />
              <div>
                <h1 className="text-white font-bold text-lg leading-none">Checklist de Entrega</h1>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>OT #{id}</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 space-y-4 pb-32">
            {/* Progreso */}
            <div className="rounded-2xl p-4" style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#555" }}>Progreso</span>
                <span className="font-black text-sm" style={{ color: todos ? "#10b981" : "#888" }}>{completados}/{items.length}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "#1a1a1a" }}>
                <motion.div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(completados / items.length) * 100}%`, background: todos ? "#10b981" : "#3b82f6" }} />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {items.map((item) => {
                const checked = checks[item.key];
                return (
                  <motion.button key={item.key} whileTap={{ scale: 0.98 }}
                    onClick={() => toggle(item.key)}
                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                    style={{
                      background: checked ? "rgba(16,185,129,0.08)" : "#0f0f0f",
                      border: checked ? "1px solid rgba(16,185,129,0.25)" : "1px solid #1a1a1a",
                    }}>
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                      style={{ background: checked ? "#10b981" : "#1a1a1a" }}>
                      {checked && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: checked ? "#ffffff" : "#888" }}>{item.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#444" }}>{item.desc}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Notas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Notas de entrega</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)}
                placeholder="Observaciones para la entrega al cliente..." rows={3}
                className="w-full text-sm text-white placeholder-white/20 rounded-2xl p-4 outline-none resize-none"
                style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }} />
            </div>

            {todos && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <ClipboardCheck size={18} style={{ color: "#10b981" }} />
                <p className="text-sm font-medium" style={{ color: "#10b981" }}>
                  Todo listo — la OT pasara a estado <strong>Lista para entregar</strong>.
                </p>
              </motion.div>
            )}
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 lg:left-60" style={{ background: "#080808", borderTop: "1px solid #1a1a1a" }}>
            <motion.button whileTap={{ scale: 0.98 }} onClick={guardar} disabled={guardando}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: todos ? "linear-gradient(135deg, #10b981, #059669)" : "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", boxShadow: "0 8px 24px rgba(16,185,129,0.2)" }}>
              {guardando
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><ClipboardCheck size={16} /> Guardar checklist</>}
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtChecklistForm;