import {
  IonBackButton, IonBadge, IonButton, IonButtons, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem,
  IonLabel, IonList, IonListHeader, IonPage, IonSpinner, IonTitle,
  IonToolbar, useIonAlert, useIonToast,
} from "@ionic/react";
import { createOutline, bicycleOutline, clipboardOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const estadoColor: Record<string, string> = {
  recepcion: "medium", diagnostico: "warning",
  reparacion: "primary", lista: "success", entregada: "dark",
};

const MotocicletaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [moto, setMoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [toast] = useIonToast();

  useEffect(() => {
    api.get(`/motocicletas/${id}`)
      .then(({ data }) => { setMoto(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const desactivar = () => {
    presentAlert({
      header: "Desactivar motocicleta",
      message: "La moto no aparecera en busquedas ni nuevas OT.",
      buttons: [
        { text: "Cancelar", role: "cancel" },
        {
          text: "Desactivar", role: "destructive",
          handler: async () => {
            await api.delete(`/motocicletas/${id}`);
            toast({ message: "Motocicleta desactivada.", duration: 3000, color: "warning" });
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

  // Guard null: la ruta /motocicletas/nueva monta esta vista en segundo plano
  // (id="nueva"); sin esto reventaría y tumbaría toda la app.
  if (!moto) return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="flex h-full items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
          Motocicleta no encontrada.
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton defaultHref="/motocicletas" /></IonButtons>
          <IonTitle>{moto.marca} {moto.modelo}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push(`/motocicletas/${id}/editar`)}>
              <IonIcon icon={createOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonIcon icon={bicycleOutline} color="primary" style={{ fontSize: 32, marginBottom: 8 }} />
            <IonCardTitle>{moto.marca} {moto.modelo} {moto.anio}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel><p>Placa</p><h3>{moto.placa}</h3></IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel><p>Color</p><h3>{moto.color}</h3></IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel><p>Kilometraje actual</p><h3>{moto.kilometraje_actual?.toLocaleString()} km</h3></IonLabel>
            </IonItem>
            {moto.numero_chasis && (
              <IonItem lines="none">
                <IonLabel><p>N. Chasis</p><h3>{moto.numero_chasis}</h3></IonLabel>
              </IonItem>
            )}
            {moto.numero_motor && (
              <IonItem lines="none">
                <IonLabel><p>N. Motor</p><h3>{moto.numero_motor}</h3></IonLabel>
              </IonItem>
            )}
            <IonItem lines="none" button detail onClick={() => history.push(`/clientes/${moto.cliente?.id}`)}>
              <IonLabel><p>Propietario</p><h3>{moto.cliente?.nombre} {moto.cliente?.apellido}</h3></IonLabel>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonListHeader>
          <IonIcon icon={clipboardOutline} style={{ marginRight: 8 }} />
          Historial de OT ({moto.ordenes_trabajo?.length ?? 0})
        </IonListHeader>
        <IonList inset>
          {moto.ordenes_trabajo?.length === 0 && (
            <IonItem><IonLabel color="medium">Sin ordenes de trabajo.</IonLabel></IonItem>
          )}
          {moto.ordenes_trabajo?.map((ot: any) => (
            <IonItem key={ot.id} button detail onClick={() => history.push(`/ordenes-trabajo/${ot.id}`)}>
              <IonLabel>
                <h2>{ot.numero_ot}</h2>
                <p>{new Date(ot.fecha_ingreso).toLocaleDateString()}</p>
                <p>{ot.problema_reportado?.slice(0, 60)}...</p>
              </IonLabel>
              <IonBadge color={estadoColor[ot.estado]} slot="end">{ot.estado}</IonBadge>
            </IonItem>
          ))}
        </IonList>

        <IonButton expand="block" fill="outline" color="danger" className="ion-margin-top" onClick={desactivar}>
          Desactivar motocicleta
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default MotocicletaDetalle;
