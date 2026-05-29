import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, Package, Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const estadoOpts = [
  { value: "disponible",     label: "Disponible en stock",  color: "#10b981" },
  { value: "pendiente",      label: "Pendiente de compra",  color: "#f59e0b" },
  { value: "pedido_especial",label: "Pedido especial",      color: "#8b5cf6" },
];

const OtRepuestoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [busqueda, setBusqueda] = useState("");
  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const [cantidad, setCantidad] = useState("1");
  const [estado, setEstado] = useState("disponible");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      if (busqueda.length >= 2) {
        api.get("/repuestos", { params: { search: busqueda, per_page: 8 } })
          .then(({ data }) => setRepuestos(data.data));
      } else {
        setRepuestos([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  const guardar = async () => {
    if (!seleccionado) { setError("Selecciona un repuesto."); return; }
    if (!cantidad || Number(cantidad) <= 0) { setError("Ingresa una cantidad valida."); return; }
    setGuardando(true);
    try {
      await api.post(`/ordenes-trabajo/${id}/repuestos`, {
        repuesto_id: seleccionado.id,
        cantidad: Number(cantidad),
        estado,
        notas: notas || undefined,
      });
      history.goBack();
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al agregar el repuesto.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col min-h-full" style={{ background: "#080808" }}>
          <div className="flex items-center gap-3 px-5 pt-14 pb-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
            <button onClick={() => history.goBack()} className="p-2 rounded-xl hover:bg-white/5 transition-colors" style={{ color: "#888" }}>
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Agregar Repuesto</h1>
              <p className="text-xs mt-0.5" style={{ color: "#555" }}>OT #{id}</p>
            </div>
          </div>

          <div className="px-5 py-6 space-y-5 pb-32">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Buscar repuesto *</label>
              <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#555" }} />
                <input type="text" value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setSeleccionado(null); }}
                  placeholder="Nombre o codigo del repuesto..."
                  className="w-full pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/20 rounded-2xl outline-none"
                  style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }} />
              </div>
              {repuestos.length > 0 && !seleccionado && (
                <div className="mt-2 rounded-2xl overflow-hidden" style={{ border: "1px solid #1a1a1a" }}>
                  {repuestos.map((r, i) => (
                    <button key={r.id}
                      onClick={() => { setSeleccionado(r); setBusqueda(r.nombre); setRepuestos([]); }}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                      style={{ background: "#0c0c0c", borderBottom: i < repuestos.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                      <div>
                        <p className="text-white text-sm font-medium">{r.nombre}</p>
                        <p className="text-xs" style={{ color: "#555" }}>{r.codigo} — {r.categoria}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: "#3b82f6" }}>
                          {Number(r.precio_venta).toLocaleString("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-xs" style={{ color: r.stock_actual <= r.stock_minimo ? "#ef4444" : "#10b981" }}>
                          Stock: {r.stock_actual}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {seleccionado && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center justify-between px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <div className="flex items-center gap-2">
                    <Package size={15} style={{ color: "#3b82f6" }} />
                    <div>
                      <p className="text-white text-sm font-semibold">{seleccionado.nombre}</p>
                      <p className="text-xs" style={{ color: "#3b82f6" }}>
                        {Number(seleccionado.precio_venta).toLocaleString("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 })} por unidad
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { setSeleccionado(null); setBusqueda(""); }}
                    className="text-xs px-2 py-1 rounded-lg" style={{ color: "#555", background: "#1a1a1a" }}>
                    Cambiar
                  </button>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Cantidad *</label>
              <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="0.01" step="0.01"
                className="w-full px-4 py-3.5 text-sm text-white rounded-2xl outline-none"
                style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }} />
              {seleccionado && cantidad && (
                <p className="text-xs mt-1.5" style={{ color: "#555" }}>
                  Total: {(Number(seleccionado.precio_venta) * Number(cantidad)).toLocaleString("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 })}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Estado del repuesto</label>
              <div className="space-y-2">
                {estadoOpts.map((opt) => (
                  <button key={opt.value} onClick={() => setEstado(opt.value)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                    style={{ background: estado === opt.value ? opt.color + "15" : "#0f0f0f", border: estado === opt.value ? "1px solid " + opt.color + "40" : "1px solid #1a1a1a" }}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: estado === opt.value ? opt.color : "#333" }} />
                    <span className="text-sm font-medium" style={{ color: estado === opt.value ? opt.color : "#888" }}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Notas (opcional)</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Observaciones sobre el repuesto..." rows={3}
                className="w-full text-sm text-white placeholder-white/20 rounded-2xl p-4 outline-none resize-none"
                style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }} />
            </div>

            {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 lg:left-60" style={{ background: "#080808", borderTop: "1px solid #1a1a1a" }}>
            <motion.button whileTap={{ scale: 0.98 }} onClick={guardar} disabled={guardando || !seleccionado}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: !seleccionado ? "#1a1a1a" : "linear-gradient(135deg, #3b82f6, #2563eb)", color: !seleccionado ? "#444" : "#fff" }}>
              {guardando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus size={16} /> Agregar repuesto</>}
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtRepuestoForm;