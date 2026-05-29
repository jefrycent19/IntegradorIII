import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, Receipt, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

interface Item { tipo: string; descripcion: string; cantidad: string; precio_unitario: string; }
const emptyItem = (): Item => ({ tipo: "mano_obra", descripcion: "", cantidad: "1", precio_unitario: "" });
const fmt = (n: number) => n.toLocaleString("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 0 });

const OtFacturaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [ot, setOt] = useState<any>(null);
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [metodo, setMetodo] = useState("efectivo");
  const [descuento, setDescuento] = useState("0");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/ordenes-trabajo/${id}`).then(({ data }) => {
      setOt(data);
      const preItems: Item[] = [];
      if (data.diagnostico?.mano_obra_estimada > 0) {
        preItems.push({ tipo: "mano_obra", descripcion: "Mano de obra", cantidad: "1", precio_unitario: String(data.diagnostico.mano_obra_estimada) });
      }
      data.repuestos?.forEach((r: any) => {
        preItems.push({ tipo: "repuesto", descripcion: r.repuesto?.nombre ?? "Repuesto", cantidad: String(r.cantidad), precio_unitario: String(r.precio_unitario) });
      });
      if (preItems.length > 0) setItems(preItems);
    });
  }, [id]);

  const subtotal = items.reduce((acc, i) => acc + (Number(i.cantidad) || 0) * (Number(i.precio_unitario) || 0), 0);
  const desc = Number(descuento) || 0;
  const iva = (subtotal - desc) * 0.13;
  const total = subtotal - desc + iva;

  const setItem = (idx: number, campo: keyof Item, val: string) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [campo]: val } : it));

  const guardar = async () => {
    const valid = items.every(i => i.descripcion.trim() && Number(i.cantidad) > 0 && Number(i.precio_unitario) >= 0);
    if (!valid) { setError("Completa todos los items de la factura."); return; }
    setGuardando(true);
    try {
      await api.post(`/ordenes-trabajo/${id}/factura`, {
        metodo_pago: metodo,
        descuento: desc,
        notas: notas || undefined,
        items: items.map(i => ({ ...i, cantidad: Number(i.cantidad), precio_unitario: Number(i.precio_unitario) })),
      });
      history.goBack();
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al generar la factura.");
    } finally {
      setGuardando(false);
    }
  };

  const inputCls = "w-full text-white text-sm rounded-xl px-3 py-2.5 outline-none";
  const inputStyle = { background: "#111111", border: "1px solid #222222" };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col min-h-full" style={{ background: "#080808" }}>
          <div className="flex items-center gap-3 px-5 pt-14 pb-5" style={{ borderBottom: "1px solid #1a1a1a" }}>
            <button onClick={() => history.goBack()} className="p-2 rounded-xl hover:bg-white/5" style={{ color: "#888" }}>
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Receipt size={18} style={{ color: "#10b981" }} />
              <div>
                <h1 className="text-white font-bold text-lg leading-none">Generar Factura</h1>
                <p className="text-xs mt-0.5" style={{ color: "#555" }}>{ot?.numero_ot} — {ot?.cliente?.nombre} {ot?.cliente?.apellido}</p>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 space-y-5 pb-48">
            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "#555" }}>Items de la factura</label>
                <button onClick={() => setItems(prev => [...prev, emptyItem()])}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: "#3b82f6", background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <Plus size={12} /> Agregar item
                </button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="rounded-2xl p-4 space-y-3" style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }}>
                    <div className="flex items-center justify-between">
                      <select value={item.tipo} onChange={(e) => setItem(idx, "tipo", e.target.value)}
                        className="text-xs font-bold uppercase tracking-widest rounded-lg px-2 py-1.5 outline-none"
                        style={{ background: "#1a1a1a", color: item.tipo === "mano_obra" ? "#3b82f6" : item.tipo === "repuesto" ? "#10b981" : "#8b5cf6", border: "none" }}>
                        <option value="mano_obra">Mano de obra</option>
                        <option value="repuesto">Repuesto</option>
                        <option value="servicio">Servicio</option>
                      </select>
                      {items.length > 1 && (
                        <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: "#444" }}
                          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                          onMouseLeave={e => e.currentTarget.style.color = "#444"}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input type="text" value={item.descripcion} onChange={(e) => setItem(idx, "descripcion", e.target.value)}
                      placeholder="Descripcion del item" className={inputCls} style={inputStyle} />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs mb-1" style={{ color: "#555" }}>Cantidad</p>
                        <input type="number" value={item.cantidad} onChange={(e) => setItem(idx, "cantidad", e.target.value)}
                          min="1" step="1" className={inputCls} style={inputStyle} />
                      </div>
                      <div>
                        <p className="text-xs mb-1" style={{ color: "#555" }}>Precio unitario (CRC)</p>
                        <input type="number" value={item.precio_unitario} onChange={(e) => setItem(idx, "precio_unitario", e.target.value)}
                          min="0" className={inputCls} style={inputStyle} />
                      </div>
                    </div>
                    {item.descripcion && Number(item.cantidad) > 0 && Number(item.precio_unitario) > 0 && (
                      <p className="text-xs text-right" style={{ color: "#555" }}>
                        Subtotal: {fmt(Number(item.cantidad) * Number(item.precio_unitario))}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Metodo de pago */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Metodo de pago</label>
              <div className="grid grid-cols-2 gap-2">
                {[["efectivo","💵 Efectivo"],["tarjeta","💳 Tarjeta"],["transferencia","🏦 Transferencia"],["mixto","🔀 Mixto"]].map(([val, lab]) => (
                  <button key={val} onClick={() => setMetodo(val)}
                    className="py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: metodo === val ? "rgba(59,130,246,0.12)" : "#0f0f0f",
                      border: metodo === val ? "1px solid rgba(59,130,246,0.4)" : "1px solid #1a1a1a",
                      color: metodo === val ? "#3b82f6" : "#666",
                    }}>
                    {lab}
                  </button>
                ))}
              </div>
            </div>

            {/* Descuento */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Descuento (CRC)</label>
              <input type="number" value={descuento} onChange={(e) => setDescuento(e.target.value)} min="0"
                className={inputCls} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }} />
            </div>

            {/* Resumen */}
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #1a1a1a" }}>
              <div className="px-5 py-3 flex items-center gap-2" style={{ background: "#0f0f0f", borderBottom: "1px solid #1a1a1a" }}>
                <Receipt size={14} style={{ color: "#10b981" }} />
                <span className="text-white font-bold text-xs uppercase tracking-widest">Resumen</span>
              </div>
              <div style={{ background: "#0c0c0c" }}>
                {[["Subtotal", subtotal, "#888"],["Descuento", -desc, "#ef4444"],["IVA (13%)", iva, "#888"]].map(([label, val, color]) => (
                  <div key={label as string} className="flex justify-between px-5 py-2.5" style={{ borderBottom: "1px solid #111111" }}>
                    <span className="text-sm" style={{ color: "#666" }}>{label}</span>
                    <span className="text-sm font-semibold" style={{ color: color as string }}>{fmt(Number(val))}</span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-3">
                  <span className="font-black text-white">TOTAL</span>
                  <span className="font-black text-xl" style={{ color: "#10b981" }}>{fmt(total)}</span>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#555" }}>Notas de la factura</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2}
                placeholder="Observaciones adicionales..." className="w-full text-sm text-white placeholder-white/20 rounded-2xl p-4 outline-none resize-none"
                style={{ background: "#0f0f0f", border: "1px solid #1a1a1a" }} />
            </div>

            {error && <p className="text-sm" style={{ color: "#ef4444" }}>{error}</p>}
          </div>

          <div className="fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 lg:left-60" style={{ background: "#080808", borderTop: "1px solid #1a1a1a" }}>
            <motion.button whileTap={{ scale: 0.98 }} onClick={guardar} disabled={guardando}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", boxShadow: "0 8px 24px rgba(16,185,129,0.25)" }}>
              {guardando
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Receipt size={16} /> Generar factura — {fmt(total)}</>}
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtFacturaForm;