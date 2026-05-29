import {
  IonBadge, IonContent, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonMenuButton, IonNote, IonPage, IonSelect, IonSelectOption,
  IonSpinner, IonTitle, IonToolbar, IonInfiniteScroll, IonInfiniteScrollContent,
} from "@ionic/react";
import { receiptOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";

const estadoColor: Record<string, string> = {
  pendiente: "warning", pagada: "success", anulada: "danger",
};

const Facturacion: React.FC = () => {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [estado, setEstado] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const history = useHistory();

  const cargar = async (reset = false) => {
    const p = reset ? 1 : page;
    const params: any = { page: p };
    if (estado) params.estado = estado;
    if (fechaDesde) params.fecha_desde = fechaDesde;
    try {
      const { data } = await api.get("/facturas", { params });
      setFacturas(reset ? data.data : (prev: any[]) => [...prev, ...data.data]);
      setHasMore(data.current_page < data.last_page);
      setPage(p + 1);
    } catch {
      setFacturas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setLoading(true); cargar(true); }, [estado, fechaDesde]);

  const totalPagadas = facturas
    .filter((f) => f.estado === "pagada")
    .reduce((acc, f) => acc + Number(f.total), 0);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Facturacion</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSelect value={estado} onIonChange={(e) => setEstado(e.detail.value)}
            placeholder="Filtrar por estado" style={{ paddingLeft: 16 }}>
            <IonSelectOption value="">Todas</IonSelectOption>
            <IonSelectOption value="pendiente">Pendientes</IonSelectOption>
            <IonSelectOption value="pagada">Pagadas</IonSelectOption>
            <IonSelectOption value="anulada">Anuladas</IonSelectOption>
          </IonSelect>
        </IonToolbar>
        <IonToolbar>
          <div style={{ padding: "4px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--ion-color-medium)" }}>Desde:</span>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: "0.9rem", flex: 1 }} />
            {fechaDesde && (
              <button onClick={() => setFechaDesde("")}
                style={{ border: "none", background: "transparent", color: "var(--ion-color-primary)", cursor: "pointer" }}>
                Limpiar
              </button>
            )}
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {facturas.length > 0 && (
          <div style={{ padding: "12px 16px", background: "var(--ion-color-success)", color: "white", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.9 }}>Total facturado (pagadas)</p>
            <h2 style={{ margin: 0 }}>
              {totalPagadas.toLocaleString("es-CR", { style: "currency", currency: "CRC" })}
            </h2>
          </div>
        )}
        {loading ? (
          <div className="ion-text-center ion-padding"><IonSpinner name="crescent" /></div>
        ) : (
          <IonList>
            {facturas.length === 0 && (
              <IonItem><IonLabel color="medium">No hay facturas para mostrar.</IonLabel></IonItem>
            )}
            {facturas.map((f) => (
              <IonItem key={f.id} button detail onClick={() => history.push("/facturacion/" + f.id)}>
                <IonIcon icon={receiptOutline} slot="start" color={estadoColor[f.estado]} />
                <IonLabel>
                  <h2>{f.numero_factura}</h2>
                  <p>{f.cliente?.nombre} {f.cliente?.apellido}</p>
                  <p>{new Date(f.fecha).toLocaleDateString()} — {f.metodo_pago}</p>
                </IonLabel>
                <div slot="end" className="ion-text-right">
                  <IonBadge color={estadoColor[f.estado]}>{f.estado}</IonBadge>
                  <IonNote style={{ display: "block", marginTop: 4, fontWeight: 600 }}>
                    {Number(f.total).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}
                  </IonNote>
                </div>
              </IonItem>
            ))}
          </IonList>
        )}
        <IonInfiniteScroll onIonInfinite={async (ev) => { await cargar(); ev.target.complete(); }} disabled={!hasMore}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default Facturacion;