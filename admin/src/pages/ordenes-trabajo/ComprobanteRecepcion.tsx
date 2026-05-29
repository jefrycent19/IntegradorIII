import { IonContent, IonPage } from "@ionic/react";
import { motion } from "framer-motion";
import { ChevronLeft, Printer, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const ComprobanteRecepcion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [ot, setOt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/ordenes-trabajo/${id}`).then(({ data }) => {
      setOt(data);
      setLoading(false);
    });
  }, [id]);

  const imprimir = () => window.print();

  if (loading) return (
    <IonPage>
      <IonContent>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#0F2A3D", borderTopColor: "transparent" }} />
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-full" style={{ background: "#F1F5F9" }}>

          {/* Toolbar — se oculta al imprimir */}
          <div className="flex items-center justify-between px-5 pt-12 pb-4 bg-white shadow-sm no-print">
            <button onClick={() => history.goBack()} className="flex items-center gap-2 text-sm font-medium" style={{ color: "#0F2A3D" }}>
              <ChevronLeft size={18} /> Volver
            </button>
            <button onClick={imprimir}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold"
              style={{ background: "#0F2A3D" }}>
              <Printer size={16} /> Imprimir
            </button>
          </div>

          {/* Comprobante */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto px-4 py-6 pb-16 print-area"
          >
            {/* Encabezado */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-4" style={{ borderTop: "4px solid #0F2A3D" }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-black text-xl" style={{ color: "#0F2A3D" }}>COMPROBANTE DE RECEPCIÓN</h1>
                  <p className="text-sm font-bold mt-1" style={{ color: "#6B7280" }}>Taller de Motos</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-lg" style={{ color: "#0F2A3D" }}>{ot.numero_ot}</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>
                    {new Date(ot.fecha_ingreso).toLocaleDateString("es-CR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>
                    {new Date(ot.fecha_ingreso).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {/* Línea divisora */}
              <div className="h-px mb-4" style={{ background: "#E5E7EB" }} />

              {/* Datos del cliente */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9CA3AF" }}>Cliente</p>
                <p className="font-bold" style={{ color: "#1F2937" }}>{ot.cliente?.nombre} {ot.cliente?.apellido}</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>Cédula: {ot.cliente?.cedula}</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>Tel: {ot.cliente?.telefono}</p>
              </div>

              {/* Datos de la moto */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9CA3AF" }}>Motocicleta</p>
                <p className="font-bold" style={{ color: "#1F2937" }}>
                  {ot.motocicleta?.marca} {ot.motocicleta?.modelo} {ot.motocicleta?.anio}
                </p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {[
                    ["Placa", ot.motocicleta?.placa],
                    ["Color", ot.motocicleta?.color],
                    ["Kilometraje", `${ot.kilometraje_ingreso?.toLocaleString()} km`],
                    ["Combustible", ot.nivel_combustible],
                  ].map(([label, val]) => (
                    <p key={label} className="text-sm" style={{ color: "#6B7280" }}>
                      <span className="font-medium" style={{ color: "#374151" }}>{label}:</span> {val}
                    </p>
                  ))}
                </div>
              </div>

              {/* Estado físico */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9CA3AF" }}>Estado físico al ingreso</p>
                <p className="text-sm p-3 rounded-xl" style={{ background: "#F9FAFB", color: "#374151" }}>
                  {ot.estado_fisico || "Sin observaciones registradas."}
                </p>
              </div>

              {/* Accesorios */}
              {ot.accesorios_entregados && (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9CA3AF" }}>Accesorios entregados</p>
                  <p className="text-sm p-3 rounded-xl" style={{ background: "#F9FAFB", color: "#374151" }}>
                    {ot.accesorios_entregados}
                  </p>
                </div>
              )}

              {/* Problema reportado */}
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9CA3AF" }}>Problema reportado</p>
                <p className="text-sm p-3 rounded-xl" style={{ background: "#F9FAFB", color: "#374151" }}>
                  {ot.problema_reportado}
                </p>
              </div>

              {/* Prioridad y fecha estimada */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl" style={{ background: "#F9FAFB" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#9CA3AF" }}>Prioridad</p>
                  <p className="font-bold capitalize" style={{ color: "#0F2A3D" }}>{ot.prioridad}</p>
                </div>
                {ot.fecha_estimada_entrega && (
                  <div className="p-3 rounded-xl" style={{ background: "#F9FAFB" }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#9CA3AF" }}>Entrega estimada</p>
                    <p className="font-bold" style={{ color: "#0F2A3D" }}>
                      {new Date(ot.fecha_estimada_entrega).toLocaleDateString("es-CR")}
                    </p>
                  </div>
                )}
              </div>

              {/* Recepcionista */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#9CA3AF" }}>Recibido por</p>
                <p className="font-semibold" style={{ color: "#1F2937" }}>
                  {ot.recepcionista?.nombre} {ot.recepcionista?.apellido}
                </p>
              </div>

              {/* Línea divisora */}
              <div className="h-px mb-6" style={{ background: "#E5E7EB" }} />

              {/* Firmas */}
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="h-16 mb-2" style={{ borderBottom: "2px solid #1F2937" }} />
                  <p className="text-xs font-semibold" style={{ color: "#6B7280" }}>Firma del cliente</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{ot.cliente?.nombre} {ot.cliente?.apellido}</p>
                </div>
                <div className="text-center">
                  <div className="h-16 mb-2" style={{ borderBottom: "2px solid #1F2937" }} />
                  <p className="text-xs font-semibold" style={{ color: "#6B7280" }}>Firma del taller</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{ot.recepcionista?.nombre} {ot.recepcionista?.apellido}</p>
                </div>
              </div>

              {/* Nota legal */}
              <p className="text-xs text-center mt-6 leading-relaxed" style={{ color: "#9CA3AF" }}>
                Al firmar este comprobante, el cliente declara que los datos registrados son correctos
                y autoriza al taller a realizar el diagnóstico del vehículo.
              </p>
            </div>

            {/* Confirmación visual */}
            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm no-print">
              <CheckCircle2 size={20} style={{ color: "#22C55E" }} />
              <p className="text-sm font-medium" style={{ color: "#1F2937" }}>
                Moto registrada correctamente. OT <strong>{ot.numero_ot}</strong> activa.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Estilos de impresión */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            .print-area { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            ion-header, ion-toolbar { display: none !important; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default ComprobanteRecepcion;