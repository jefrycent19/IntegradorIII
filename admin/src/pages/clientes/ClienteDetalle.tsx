import {
  IonBackButton, IonBadge, IonButton, IonButtons, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonChip, IonContent, IonHeader, IonIcon,
  IonItem, IonLabel, IonList, IonListHeader, IonPage, IonSpinner,
  IonTitle, IonToolbar, useIonAlert, useIonToast,
} from "@ionic/react";
import {
  bicycleOutline, callOutline, cardOutline, createOutline,
  locationOutline, mailOutline, clipboardOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";
import { useCanEditClientes } from "../../hooks/useCanEdit";

const estadoColor: Record<string, string> = {
  recepcion: "medium", diagnostico: "warning",
  reparacion: "primary", lista: "success", entregada: "dark",
};

const ClienteDetalle: React.FC = () => {
  const canEdit = useCanEditClientes();
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [toast] = useIonToast();

  useEffect(() => {
    api.get(`/clientes/${id}`)
      .then(({ data }) => { setCliente(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const desactivar = () => {
    presentAlert({
      header: "¿Desactivar cliente?",
      message: "El cliente no aparecerá en las búsquedas.",
      buttons: [
        { text: "Cancelar", role: "cancel" },
        {
          text: "Desactivar",
          role: "destructive",
          handler: async () => {
            await api.delete(`/clientes/${id}`);
            toast({ message: "Cliente desactivado.", duration: 3000, color: "warning" });
            history.goBack();
          },
        },
      ],
    });
  };

  if (loading) return (
    <IonPage>
      <IonContent className="ion-text-center ion-padding"><IonSpinner name="crescent" /></IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton defaultHref="/clientes" /></IonButtons>
          <IonTitle>{cliente.nombre} {cliente.apellido}</IonTitle>
          {canEdit && (
            <IonButtons slot="end">
              <IonButton onClick={() => history.push(`/clientes/${id}/editar`)}>
                <IonIcon icon={createOutline} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Información del cliente</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonIcon icon={cardOutline} slot="start" color="primary" />
              <IonLabel><p>Cédula</p><h3>{cliente.cedula}</h3></IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonIcon icon={callOutline} slot="start" color="primary" />
              <IonLabel><p>Teléfono</p><h3>{cliente.telefono}{cliente.telefono_alt ? ` / ${cliente.telefono_alt}` : ""}</h3></IonLabel>
            </IonItem>
            {cliente.email && (
              <IonItem lines="none">
                <IonIcon icon={mailOutline} slot="start" color="primary" />
                <IonLabel><p>Correo</p><h3>{cliente.email}</h3></IonLabel>
              </IonItem>
            )}
            {cliente.direccion && (
              <IonItem lines="none">
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonLabel><p>Dirección</p><h3>{cliente.direccion}</h3></IonLabel>
              </IonItem>
            )}
          </IonCardContent>
        </IonCard>

        <IonListHeader>
          <IonIcon icon={bicycleOutline} style={{ marginRight: 8 }} />
          Motocicletas ({cliente.motocicletas?.length ?? 0})
        </IonListHeader>
        <IonList inset>
          {cliente.motocicletas?.map((m: any) => (
            <IonItem key={m.id} button detail onClick={() => history.push(`/motocicletas/${m.id}`)}>
              <IonLabel>
                <h2>{m.marca} {m.modelo} {m.anio}</h2>
                <p>Placa: {m.placa} — Color: {m.color}</p>
                <p>{m.kilometraje_actual?.toLocaleString()} km</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonListHeader>
          <IonIcon icon={clipboardOutline} style={{ marginRight: 8 }} />
          Historial de OT ({cliente.ordenes_trabajo?.length ?? 0})
        </IonListHeader>
        <IonList inset>
          {cliente.ordenes_trabajo?.map((ot: any) => (
            <IonItem key={ot.id} button detail onClick={() => history.push(`/ordenes-trabajo/${ot.id}`)}>
              <IonLabel>
                <h2>{ot.numero_ot}</h2>
                <p>{new Date(ot.fecha_ingreso).toLocaleDateString()}</p>
              </IonLabel>
              <IonBadge color={estadoColor[ot.estado]} slot="end">{ot.estado}</IonBadge>
            </IonItem>
          ))}
        </IonList>

        {canEdit && (
          <IonButton expand="block" fill="outline" color="danger" className="ion-margin-top" onClick={desactivar}>
            Desactivar cliente
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ClienteDetalle;