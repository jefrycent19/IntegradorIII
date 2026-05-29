import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, Camera, FileText, Upload, X, Image } from "lucide-react";
import { useRef, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const etapas = [
  { value: "recepcion",   label: "Recepcion",   icon: "📥" },
  { value: "diagnostico", label: "Diagnostico", icon: "🔍" },
  { value: "reparacion",  label: "Reparacion",  icon: "🔧" },
  { value: "entrega",     label: "Entrega",     icon: "📤" },
  { value: "garantia",    label: "Garantia",    icon: "🛡️" },
];

const OtEvidenciaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const fileRef = useRef<HTMLInputElement>(null);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [etapa, setEtapa] = useState("reparacion");
  const [descripcion, setDescripcion] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const nuevos = [...archivos, ...files].slice(0, 5); // max 5 archivos
    setArchivos(nuevos);

    // Generar previews para imágenes
    nuevos.forEach((file, i) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreviews(prev => {
            const updated = [...prev];
            updated[i] = ev.target?.result as string;
            return updated;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const remover = (i: number) => {
    setArchivos(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const subir = async () => {
    if (!archivos.length) { setError("Selecciona al menos un archivo."); return; }
    setSubiendo(true);
    setProgreso(0);

    try {
      for (let i = 0; i < archivos.length; i++) {
        const file = archivos[i];
        const formData = new FormData();
        formData.append("archivo", file);
        formData.append("etapa", etapa);
        formData.append("descripcion", descripcion);
        formData.append("tipo", file.type.startsWith("image/") ? "foto" :
          file.type.startsWith("video/") ? "video" :
          file.type.startsWith("audio/") ? "audio" : "documento");

        await api.post(`/ordenes-trabajo/${id}/evidencias`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProgreso(Math.round(((i + 1) / archivos.length) * 100));
      }
      history.goBack();
    } catch {
      setError("Error al subir los archivos. Verifica el formato y tamaño (max 50MB).");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="flex flex-col min-h-full" style={{ background: "#F1F5F9" }}>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white shadow-sm">
            <button onClick={() => history.goBack()} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "#0F2A3D" }}>
              <ChevronLeft size={18} /> Volver
            </button>
            <div className="flex-1">
              <p className="font-bold" style={{ color: "#1F2937" }}>Agregar Evidencia</p>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>OT #{id}</p>
            </div>
          </div>

          <div className="px-4 py-5 space-y-5 pb-32">

            {/* Selector de etapa */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>Etapa</p>
              <div className="flex gap-2 flex-wrap">
                {etapas.map((e) => (
                  <button key={e.value} onClick={() => setEtapa(e.value)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: etapa === e.value ? "#0F2A3D" : "#ffffff",
                      color: etapa === e.value ? "#ffffff" : "#6B7280",
                      border: etapa === e.value ? "none" : "1px solid #E5E7EB",
                    }}>
                    <span>{e.icon}</span> {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Zona de carga */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>Archivos (max 5)</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full py-8 rounded-2xl border-2 border-dashed flex flex-col items-center gap-3 transition-all"
                style={{ borderColor: "#D1D5DB", background: "#ffffff" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#0F2A3D"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#D1D5DB"}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#F3F4F6" }}>
                  <Upload size={22} style={{ color: "#6B7280" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: "#374151" }}>Toca para seleccionar archivos</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>Fotos, videos, audios, documentos</p>
                </div>
              </button>
              <input ref={fileRef} type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                className="hidden" onChange={onFileChange} />
            </div>

            {/* Preview de archivos */}
            {archivos.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>
                  {archivos.length} archivo(s) seleccionado(s)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {archivos.map((file, i) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      className="relative bg-white rounded-2xl overflow-hidden shadow-sm"
                      style={{ border: "1px solid #E5E7EB" }}>
                      {previews[i] ? (
                        <img src={previews[i]} alt={file.name} className="w-full h-28 object-cover" />
                      ) : (
                        <div className="w-full h-28 flex flex-col items-center justify-center gap-1"
                          style={{ background: "#F9FAFB" }}>
                          <FileText size={24} style={{ color: "#9CA3AF" }} />
                          <p className="text-xs text-center px-2 truncate w-full text-center" style={{ color: "#6B7280" }}>
                            {file.name}
                          </p>
                        </div>
                      )}
                      <button onClick={() => remover(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <X size={12} className="text-white" />
                      </button>
                      <p className="px-2 py-1.5 text-xs truncate" style={{ color: "#6B7280" }}>
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Descripcion */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#9CA3AF" }}>Descripcion (opcional)</p>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe la evidencia (ej: fuga de aceite en motor, daño en frenos...)"
                rows={3}
                className="w-full text-sm rounded-2xl p-4 outline-none resize-none"
                style={{ background: "#ffffff", border: "1px solid #E5E7EB", color: "#374151" }} />
            </div>

            {/* Barra de progreso */}
            {subiendo && (
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: "#6B7280" }}>Subiendo...</span>
                  <span className="text-xs font-bold" style={{ color: "#0F2A3D" }}>{progreso}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
                  <motion.div animate={{ width: `${progreso}%` }} className="h-full rounded-full"
                    style={{ background: "#0F2A3D" }} />
                </div>
              </div>
            )}

            {error && <p className="text-sm font-medium" style={{ color: "#DC2626" }}>{error}</p>}
          </div>

          {/* Botón fijo */}
          <div className="fixed bottom-0 left-0 right-0 px-4 pb-10 pt-4 bg-white lg:left-60"
            style={{ borderTop: "1px solid #E5E7EB" }}>
            <motion.button whileTap={{ scale: 0.98 }} onClick={subir}
              disabled={subiendo || !archivos.length}
              className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
              style={{
                background: !archivos.length ? "#E5E7EB" : "linear-gradient(135deg, #0F2A3D, #163449)",
                color: !archivos.length ? "#9CA3AF" : "#fff",
                boxShadow: archivos.length ? "0 8px 24px rgba(15,42,61,0.2)" : "none",
              }}>
              {subiendo
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Camera size={16} /> Subir {archivos.length > 1 ? `${archivos.length} archivos` : "archivo"}</>}
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OtEvidenciaForm;