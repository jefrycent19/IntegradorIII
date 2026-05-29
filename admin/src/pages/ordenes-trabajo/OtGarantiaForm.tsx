import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const OtGarantiaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [form, setForm] = useState({
    descripcion: "", fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: "", cubre_repuestos: true, cubre_mano_obra: true, notas: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const set = (campo: string) => (e: any) =>
    setForm(prev => ({ ...prev, [campo]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const guardar = async () => {
    if (!form.descripcion.trim()) { setError("Describe la garantia."); return; }
    if (!form.fecha_fin) { setError("Selecciona la fecha de vencimiento."); return; }
    setGuardando(true);
    try {
      await api.post(`/ordenes-trabajo/${id}/garantia`, form);
      history.goBack();
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al registrar la garantia.");
    } finally {
      setGuardando(false);
    }
  };

  const inputStyle = { background: "#0f0f0f", border: "1px solid #1a1a1a" };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col min-h-full" style={{ background: "#080808" }}>
          <div className="flex items-center gap-3 px-5 pt-14 pb-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
            <button onClick={() => history.goBack()} className="p-2 rounded-xl hover:bg-white/5" style={{ color: "#888" }}>
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: "#8b5cf6" }} />
              <div>
                <h1 className="text-white font-bold text-lg leading-none">Registrar Garantia</h1>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>OT #{id}</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 space-y-5 pb-32">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Descripcion de la garantia *</label>
              <textarea value={form.descripcion} onChange={set("descripcion")}
                placeholder="Describe que cubre la garantia: trabajos realizados, repuestos instalados, condiciones..." rows={4}
                className="w-full text-sm text-white placeholder-white/20 rounded-2xl p-4 outline-none resize-none"
                style={inputStyle} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Fecha inicio</label>
                <input type="date" value={form.fecha_inicio} onChange={set("fecha_inicio")}
                  className="w-full px-4 py-3.5 text-sm text-white rounded-2xl outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Fecha vencimiento *</label>
                <input type="date" value={form.fecha_fin} onChange={set("fecha_fin")}
                  min={form.fecha_inicio}
                  className="w-full px-4 py-3.5 text-sm text-white rounded-2xl outline-none" style={inputStyle} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Cobertura</label>
              <div className="space-y-2">
                {[
                  { key: "cubre_repuestos", label: "Cubre repuestos instalados", color: "#10b981" },
                  { key: "cubre_mano_obra", label: "Cubre mano de obra", color: "#3b82f6" },
                ].map((opt) => {
                  const checked = form[opt.key as keyof typeof form] as boolean;
                  return (
                    <button key={opt.key} onClick={() => setForm(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof form] }))}
                      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all"
                      style={{ background: checked ? opt.color + "10" : "#0f0f0f", border: checked ? "1px solid " + opt.color + "30" : "1px solid #1a1a1a" }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                        style={{ background: checked ? opt.color : "#1a1a1a", border: checked ? "none" : "1px solid #333" }}>
                        {checked && <span className="text-white text-xs font-black">✓</span>}
                      </div>
                      <span className="text-sm font-medium" style={{ color: checked ? "#fff" : "#888" }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Condiciones adicionales</label>
              <textarea value={form.notas} onChange={set("notas")}
                placeholder="Exclusiones, condiciones especiales..." rows={3}
                className="w-full text-sm text-white placeholder-white/20 rounded-2xl p-4 outline-none resize-none"
                style={inputStyle} />
            </div>

            {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 lg:left-60" style={{ background: "#080808", borderTop: "1px solid #1a1a1a" }}>
            <motion.button whileTap={{ scale: 0.98 }} onClick={guardar} disabled={guardando}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", boxShadow: "0 8px 24px rgba(139,92,246,0.25)" }}>
              {guardando
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><ShieldCheck size={16} /> Registrar garantia</>}
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtGarantiaForm;