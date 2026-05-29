import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, Bell, Send } from "lucide-react";
import { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const tiposNotificacion = [
  { value: "moto_recibida",       label: "Moto recibida",            icon: "📥", desc: "Confirmacion de ingreso al taller" },
  { value: "diagnostico_listo",   label: "Diagnostico listo",        icon: "🔍", desc: "El tecnico termino el diagnostico" },
  { value: "aprobacion_requerida",label: "Aprobacion requerida",     icon: "✋", desc: "Se necesita autorizacion del cliente" },
  { value: "moto_lista",          label: "Moto lista para entregar", icon: "✅", desc: "La motocicleta esta lista" },
  { value: "factura_generada",    label: "Factura generada",         icon: "🧾", desc: "Factura disponible para pago" },
  { value: "garantia_aprobada",   label: "Garantia aprobada",        icon: "🛡️", desc: "Reclamo de garantia aprobado" },
];

const canales = [
  { value: "email",    label: "Email",    icon: "📧" },
  { value: "sms",      label: "SMS",      icon: "💬" },
  { value: "whatsapp", label: "WhatsApp", icon: "📱" },
];

const OtNotificarCliente: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [tipo, setTipo] = useState("");
  const [canal, setCanal] = useState("email");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const enviar = async () => {
    if (!tipo) { setError("Selecciona el tipo de notificacion."); return; }
    setEnviando(true);
    try {
      await api.post(`/ordenes-trabajo/${id}/notificaciones`, { tipo, canal });
      setEnviado(true);
      setTimeout(() => history.goBack(), 1800);
    } catch {
      setError("Error al enviar la notificacion.");
    } finally {
      setEnviando(false);
    }
  };

  if (enviado) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div className="flex flex-col items-center justify-center h-full" style={{ background: "#F1F5F9" }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
                style={{ background: "#F0FDF4", border: "2px solid #22C55E" }}>
                ✅
              </div>
            </motion.div>
            <p className="font-bold text-lg" style={{ color: "#1F2937" }}>Notificacion enviada</p>
            <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>El cliente fue notificado correctamente</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

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
              <Bell size={18} style={{ color: "#0F2A3D" }} />
              <div>
                <h1 className="font-bold text-lg leading-none" style={{ color: "#1F2937" }}>Notificar Cliente</h1>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>OT #{id}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 space-y-5 pb-32">

            {/* Canal */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>Canal de envio</p>
              <div className="grid grid-cols-3 gap-2">
                {canales.map((c) => (
                  <button key={c.value} onClick={() => setCanal(c.value)}
                    className="py-3 rounded-2xl font-semibold text-sm transition-all flex flex-col items-center gap-1"
                    style={{
                      background: canal === c.value ? "#0F2A3D" : "#ffffff",
                      color: canal === c.value ? "#ffffff" : "#6B7280",
                      border: canal === c.value ? "2px solid #0F2A3D" : "2px solid #E5E7EB",
                      boxShadow: canal === c.value ? "0 4px 12px rgba(15,42,61,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                    <span className="text-xl">{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>Tipo de notificacion</p>
              <div className="space-y-2">
                {tiposNotificacion.map((t) => (
                  <motion.button key={t.value} whileTap={{ scale: 0.98 }}
                    onClick={() => { setTipo(t.value); setError(""); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white text-left transition-all"
                    style={{
                      border: tipo === t.value ? "2px solid #0F2A3D" : "2px solid transparent",
                      boxShadow: tipo === t.value ? "0 4px 16px rgba(15,42,61,0.1)" : "0 1px 4px rgba(0,0,0,0.06)",
                    }}>
                    <span className="text-2xl flex-shrink-0">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>{t.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{t.desc}</p>
                    </div>
                    {tipo === t.value && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "#0F2A3D" }}>
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm font-medium" style={{ color: "#DC2626" }}>{error}</p>}
          </div>

          {/* Botón */}
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-10 pt-4 bg-white lg:left-60" style={{ borderTop: "1px solid #E5E7EB" }}>
            <motion.button whileTap={{ scale: 0.98 }} onClick={enviar}
              disabled={enviando || !tipo}
              className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{
                background: !tipo ? "#E5E7EB" : "linear-gradient(135deg, #0F2A3D, #163449)",
                color: !tipo ? "#9CA3AF" : "#fff",
                boxShadow: tipo ? "0 8px 24px rgba(15,42,61,0.2)" : "none",
              }}>
              {enviando
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Send size={16} /> Enviar notificacion</>}
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtNotificarCliente;