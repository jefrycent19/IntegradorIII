import {
  IonBackButton, IonBadge, IonButton, IonButtons, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonContent, IonHeader, IonIcon, IonItem,
  IonLabel, IonList, IonListHeader, IonPage, IonSpinner, IonTitle,
  IonToolbar, IonAlert, useIonToast,
} from "@ionic/react";
import { createOutline, cubeOutline, alertCircleOutline, addOutline, removeOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";
import { useCanEditInventario } from "../../hooks/useCanEdit";

const RepuestoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const canEdit = useCanEditInventario();
  const [repuesto, setRepuesto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAjuste, setShowAjuste] = useState<"entrada" | "salida" | null>(null);
  const history = useHistory();
  const [toast] = useIonToast();

  const cargar = () => {
    api.get(`/repuestos/${id}`)
      .then(({ data }) => { setRepuesto(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [id]);

  const ajustarStock = async (tipo: "entrada" | "salida", cantidad: string, notas: string) => {
    try {
      const { data } = await api.post(`/repuestos/${id}/ajustar-stock`, {
        tipo, cantidad: Number(cantidad), notas,
      });
      toast({ message: "Stock actualizado.", duration: 3000, color: "success" });
      if (data.alerta_stock_bajo) {
        toast({ message: "Alerta: stock por debajo del minimo.", duration: 3000, color: "warning" });
      }
      cargar();
    } catch (e: any) {
      toast({ message: e.response?.data?.message ?? "Error al ajustar stock.", duration: 3000, color: "danger" });
    }
    setShowAjuste(null);
  };

  if (loading) return (
    <IonPage>
      <IonContent className="ion-text-center ion-padding"><IonSpinner name="crescent" /></IonContent>
    </IonPage>
  );

  // Guard null: /inventario/nuevo monta esta vista en segundo plano (id="nuevo").
  if (!repuesto) return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="flex h-full items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
          Repuesto no encontrado.
        </div>
      </IonContent>
    </IonPage>
  );

  const stockBajo = repuesto.stock_actual <= repuesto.stock_minimo;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton defaultHref="/inventario" /></IonButtons>
          <IonTitle>{repuesto.nombre}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push(`/inventario/${id}/editar`)}>
              <IonIcon icon={createOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonIcon icon={stockBajo ? alertCircleOutline : cubeOutline}
              color={stockBajo ? "danger" : "primary"} style={{ fontSize: 36 }} />
            <IonCardTitle>{repuesto.nombre}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem lines="none">
              <IonLabel><p>Codigo</p><h3>{repuesto.codigo}</h3></IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel><p>Categoria</p><h3>{repuesto.categoria}</h3></IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel><p>Unidad</p><h3>{repuesto.unidad}</h3></IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <p>Precio costo</p>
                <h3>{Number(repuesto.precio_costo).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</h3>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <p>Precio venta</p>
                <h3>{Number(repuesto.precio_venta).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</h3>
              </IonLabel>
            </IonItem>
            {repuesto.proveedor && (
              <IonItem lines="none">
                <IonLabel><p>Proveedor</p><h3>{repuesto.proveedor}</h3></IonLabel>
              </IonItem>
            )}
          </IonCardContent>
        </IonCard>

        <IonCard style={{ borderTop: `4px solid var(--ion-color-${stockBajo ? "danger" : "success"})` }}>
          <IonCardContent>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>Stock actual</p>
                <h1 style={{ margin: 0, fontSize: "3rem", color: `var(--ion-color-${stockBajo ? "danger" : "success"})` }}>
                  {repuesto.stock_actual}
                </h1>
                <p style={{ margin: 0, color: "var(--ion-color-medium)" }}>Min: {repuesto.stock_minimo}</p>
              </div>
              {canEdit && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <IonButton color="success" onClick={() => setShowAjuste("entrada")}>
                  <IonIcon icon={addOutline} slot="start" /> Entrada
                </IonButton>
                <IonButton color="danger" fill="outline" onClick={() => setShowAjuste("salida")}>
                  <IonIcon icon={removeOutline} slot="start" /> Salida
                </IonButton>
              </div>}
            </div>
          </IonCardContent>
        </IonCard>

        <IonListHeader>Ultimos movimientos</IonListHeader>
        <IonList inset>
          {repuesto.movimientos?.slice(0, 10).map((m: any) => (
            <IonItem key={m.id}>
              <IonLabel>
                <h3>{m.tipo === "entrada" ? "+" : "-"}{m.cantidad} {repuesto.unidad}</h3>
                <p>{m.notas ?? m.tipo}</p>
                <p>{new Date(m.created_at).toLocaleString()}</p>
              </IonLabel>
              <IonBadge color={m.tipo === "entrada" ? "success" : "danger"} slot="end">
                {m.tipo}
              </IonBadge>
            </IonItem>
          ))}
        </IonList>

        <IonAlert
          isOpen={showAjuste !== null}
          onDidDismiss={() => setShowAjuste(null)}
          header={showAjuste === "entrada" ? "Registrar entrada" : "Registrar salida"}
          inputs={[
            { name: "cantidad", type: "number", placeholder: "Cantidad", min: 0.01 },
            { name: "notas", type: "text", placeholder: "Motivo (opcional)" },
          ]}
          buttons={[
            { text: "Cancelar", role: "cancel" },
            {
              text: showAjuste === "entrada" ? "Agregar" : "Descontar",
              handler: (d) => ajustarStock(showAjuste!, d.cantidad, d.notas),
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default RepuestoDetalle;
