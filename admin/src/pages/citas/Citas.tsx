import {
  IonBadge, IonButton, IonButtons, IonContent, IonFab, IonFabButton,
  IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions,
  IonItemSliding, IonLabel, IonMenuButton, IonPage, IonSelect,
  IonSelectOption, IonSpinner, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import { addOutline, calendarOutline, trashOutline, createOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { useCanEdit } from "../../hooks/useCanEdit";

const estadoColor: Record<string, string> = {
  pendiente: "warning", confirmada: "success",
  cancelada: "danger", completada: "medium",
};

const Citas: React.FC = () => {
  const canEdit = useCanEdit();
  const [citas, setCitas] = useState<any[]>([]);
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [toast] = useIonToast();

  const cargar = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/citas", { params: { estado: estado || undefined, page: 1 } });
      setCitas(data.data);
    } catch {
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [estado]);

  const cancelar = async (id: number) => {
    await api.delete(`/citas/${id}`);
    toast({ message: "Cita cancelada.", duration: 3000, color: "warning" });
    cargar();
  };

  const confirmar = async (id: number) => {
    await api.patch(`/citas/${id}`, { estado: "confirmada" });
    toast({ message: "Cita confirmada.", duration: 3000, color: "success" });
    cargar();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Citas</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSelect
            value={estado}
            onIonChange={(e) => setEstado(e.detail.value)}
            placeholder="Filtrar por estado"
            style={{ paddingLeft: 16 }}
          >
            <IonSelectOption value="">Todas</IonSelectOption>
            <IonSelectOption value="pendiente">Pendientes</IonSelectOption>
            <IonSelectOption value="confirmada">Confirmadas</IonSelectOption>
            <IonSelectOption value="cancelada">Canceladas</IonSelectOption>
            <IonSelectOption value="completada">Completadas</IonSelectOption>
          </IonSelect>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <div className="ion-text-center ion-padding"><IonSpinner name="crescent" /></div>
        ) : (
          <>
            {citas.length === 0 && (
              <div className="ion-text-center ion-padding">
                <IonIcon icon={calendarOutline} style={{ fontSize: 48, color: "var(--ion-color-medium)" }} />
                <p>No hay citas para mostrar.</p>
              </div>
            )}
            {citas.map((c) => (
              <IonItemSliding key={c.id}>
                <IonItem>
                  <IonIcon icon={calendarOutline} slot="start" color={estadoColor[c.estado]} />
                  <IonLabel>
                    <h2>{c.cliente?.nombre} {c.cliente?.apellido}</h2>
                    <p>{c.motocicleta?.marca} {c.motocicleta?.modelo} — {c.motocicleta?.placa}</p>
                    <p>{new Date(c.fecha_hora).toLocaleString()}</p>
                    <p>{c.tipo_servicio} — {c.duracion_estimada_min} min</p>
                  </IonLabel>
                  <IonBadge color={estadoColor[c.estado]} slot="end">{c.estado}</IonBadge>
                </IonItem>
                <IonItemOptions side="end">
                  {c.estado === "pendiente" && (
                    <IonItemOption color="success" onClick={() => confirmar(c.id)}>
                      Confirmar
                    </IonItemOption>
                  )}
                  {c.estado !== "cancelada" && c.estado !== "completada" && (
                    <IonItemOption color="danger" onClick={() => cancelar(c.id)}>
                      <IonIcon icon={trashOutline} />
                    </IonItemOption>
                  )}
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </>
        )}
      </IonContent>

      {canEdit && (
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={() => history.push("/citas/nueva")}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      )}
    </IonPage>
  );
};

export default Citas;
