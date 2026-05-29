import {
  IonBackButton, IonBadge, IonButtons, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem,
  IonLabel, IonList, IonListHeader, IonPage, IonSpinner, IonTitle, IonToolbar,
} from "@ionic/react";
import { receiptOutline, clipboardOutline, personOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const estadoColor: Record<string, string> = {
  pendiente: "warning", pagada: "success", anulada: "danger",
};

const FacturaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [factura, setFactura] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    api.get("/facturas/" + id).then(({ data }) => { setFactura(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <IonPage>
      <IonContent className="ion-text-center ion-padding"><IonSpinner name="crescent" /></IonContent>
    </IonPage>
  );

  const fmt = (n: number) => n.toLocaleString("es-CR", { style: "currency", currency: "CRC" });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton defaultHref="/facturacion" /></IonButtons>
          <IonTitle>{factura.numero_factura}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonIcon icon={receiptOutline} color="primary" style={{ fontSize: 32 }} />
            <IonCardTitle>{factura.numero_factura}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel><p>Fecha</p><h3>{new Date(factura.fecha).toLocaleString()}</h3></IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel><p>Metodo de pago</p><h3>{factura.metodo_pago}</h3></IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel><p>Estado</p></IonLabel>
              <IonBadge color={estadoColor[factura.estado]} slot="end">{factura.estado}</IonBadge>
            </IonItem>
          </IonCardContent>
        </IonCard>

        <IonList inset>
          <IonListHeader><IonIcon icon={personOutline} style={{ marginRight: 8 }} />Cliente</IonListHeader>
          <IonItem button detail onClick={() => history.push("/clientes/" + factura.cliente?.id)}>
            <IonLabel><h2>{factura.cliente?.nombre} {factura.cliente?.apellido}</h2></IonLabel>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonListHeader><IonIcon icon={clipboardOutline} style={{ marginRight: 8 }} />OT relacionada</IonListHeader>
          <IonItem button detail onClick={() => history.push("/ordenes-trabajo/" + factura.orden_trabajo?.id)}>
            <IonLabel>
              <h2>{factura.orden_trabajo?.numero_ot}</h2>
              <p>{factura.orden_trabajo?.motocicleta?.marca} {factura.orden_trabajo?.motocicleta?.modelo} — {factura.orden_trabajo?.motocicleta?.placa}</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <IonList inset>
          <IonListHeader>Detalle de items</IonListHeader>
          {factura.items?.map((item: any) => (
            <IonItem key={item.id}>
              <IonLabel>
                <h3>{item.descripcion}</h3>
                <p>{item.tipo} — {item.cantidad} x {fmt(Number(item.precio_unitario))}</p>
              </IonLabel>
              <IonLabel slot="end" className="ion-text-right">
                <h3>{fmt(Number(item.subtotal))}</h3>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonCard>
          <IonCardContent>
            {[["Subtotal", factura.subtotal], ["Descuento", factura.descuento], ["IVA (13%)", factura.impuesto]].map(([label, val]) => (
              <div key={label as string} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span style={{ color: "var(--ion-color-medium)" }}>{label}</span>
                <span>{fmt(Number(val))}</span>
              </div>
            ))}
            <hr />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem", marginTop: 8 }}>
              <span>TOTAL</span>
              <span style={{ color: "var(--ion-color-success)" }}>{fmt(Number(factura.total))}</span>
            </div>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default FacturaDetalle;