import {
  IonBadge, IonContent, IonHeader, IonItem, IonLabel,
  IonMenuButton, IonPage, IonSelect, IonSelectOption,
  IonSpinner, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import { Globe, Calendar, Phone, Bike } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";

const estadoOpts = [
  { value: "pendiente",   label: "Pendiente",   color: "warning" },
  { value: "contactado",  label: "Contactado",  color: "primary" },
  { value: "confirmado",  label: "Confirmado",  color: "success" },
  { value: "descartado",  label: "Descartado",  color: "medium" },
];

const estadoColor: Record<string, string> = {
  pendiente:  "warning",
  contactado: "primary",
  confirmado: "success",
  descartado: "medium",
};

const SolicitudesCitaWeb: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast] = useIonToast();

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get("/solicitudes-cita-web", {
      params: { estado: filtro || undefined },
    });
    setSolicitudes(data.data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [filtro]);

  const cambiarEstado = async (id: number, nuevoEstado: string) => {
    await api.patch(`/solicitudes-cita-web/${id}`, { estado: nuevoEstado });
    toast({ message: "Estado actualizado.", duration: 3000, color: "success" });
    cargar();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonMenuButton slot="start" />
          <IonTitle>Solicitudes Web</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Filtro */}
        <div className="px-4 pt-4">
          <IonSelect
            value={filtro}
            onIonChange={(e) => setFiltro(e.detail.value)}
            placeholder="Filtrar por estado"
            style={{ background: "white", borderRadius: 12, padding: "8px 12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
          >
            <IonSelectOption value="">Todas</IonSelectOption>
            {estadoOpts.map((o) => (
              <IonSelectOption key={o.value} value={o.value}>{o.label}</IonSelectOption>
            ))}
          </IonSelect>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <IonSpinner name="crescent" />
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3" style={{ color: "#9CA3AF" }}>
            <Globe size={40} className="opacity-40" />
            <p className="text-sm font-medium">No hay solicitudes de cita web.</p>
          </div>
        ) : (
          <div className="px-4 pt-4 pb-24 space-y-3">
            {solicitudes.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl shadow-sm overflow-hidden"
                style={{ borderLeft: `4px solid ${s.estado === "confirmado" ? "#22C55E" : s.estado === "descartado" ? "#D1D5DB" : s.estado === "contactado" ? "#0F2A3D" : "#F59E0B"}` }}>

                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-4 pb-2">
                  <div>
                    <p className="font-bold text-base" style={{ color: "#1F2937" }}>{s.nombre}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "#6B7280" }}>
                        <Phone size={11} /> {s.telefono}
                      </span>
                      {s.email && (
                        <span className="text-xs" style={{ color: "#6B7280" }}>{s.email}</span>
                      )}
                    </div>
                  </div>
                  <IonBadge color={estadoColor[s.estado] ?? "medium"}>{s.estado}</IonBadge>
                </div>

                {/* Detalles */}
                <div className="px-5 pb-3 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5">
                    <Bike size={13} style={{ color: "#9CA3AF" }} />
                    <span className="text-xs" style={{ color: "#6B7280" }}>{s.marca_moto} — {s.placa_moto}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} style={{ color: "#9CA3AF" }} />
                    <span className="text-xs" style={{ color: "#6B7280" }}>
                      {new Date(s.fecha_preferida).toLocaleDateString("es-CR")}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="px-5 pb-3">
                  <p className="text-xs p-2.5 rounded-xl" style={{ background: "#F9FAFB", color: "#4B5563" }}>
                    {s.descripcion}
                  </p>
                </div>

                {/* Tipo de servicio */}
                <div className="px-5 pb-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "#EFF6FF", color: "#0F2A3D" }}>
                    {s.tipo_servicio}
                  </span>
                </div>

                {/* Acciones */}
                <div className="px-5 pb-4 pt-2 flex gap-2 flex-wrap" style={{ borderTop: "1px solid #F3F4F6" }}>
                  {estadoOpts.filter((o) => o.value !== s.estado).map((o) => (
                    <button key={o.value}
                      onClick={() => cambiarEstado(s.id, o.value)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: "#F3F4F6", color: "#374151" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#0F2A3D"; e.currentTarget.style.color = "#fff"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#374151"; }}>
                      → {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default SolicitudesCitaWeb;