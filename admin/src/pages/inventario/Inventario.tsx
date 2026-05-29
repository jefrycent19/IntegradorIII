import {
  IonBadge, IonContent, IonFab, IonFabButton, IonHeader, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel,
  IonList, IonMenuButton, IonNote, IonPage, IonSearchbar, IonSegment,
  IonSegmentButton, IonSpinner, IonTitle, IonToolbar,
} from "@ionic/react";
import { addOutline, cubeOutline, alertCircleOutline } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { useCanEditInventario } from "../../hooks/useCanEdit";

const Inventario: React.FC = () => {
  const canEdit = useCanEditInventario();
  const [repuestos, setRepuestos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const history = useHistory();
  const debounce = useRef<any>(null);

  const cargar = async (reset = false) => {
    const p = reset ? 1 : page;
    const params: any = { search, page: p };
    if (filtro === "bajo") params.stock_bajo = true;
    try {
      const { data } = await api.get("/repuestos", { params });
      setRepuestos(reset ? data.data : (prev: any[]) => [...prev, ...data.data]);
      setHasMore(data.current_page < data.last_page);
      setPage(p + 1);
    } catch {
      setRepuestos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => cargar(true), 350);
  }, [search, filtro]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Inventario</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar value={search} onIonInput={(e) => setSearch(e.detail.value!)}
            placeholder="Buscar por nombre o codigo..." debounce={0} />
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={filtro} onIonChange={(e) => setFiltro(e.detail.value as string)}>
            <IonSegmentButton value="todos"><IonLabel>Todos</IonLabel></IonSegmentButton>
            <IonSegmentButton value="bajo">
              <IonIcon icon={alertCircleOutline} />
              <IonLabel>Stock bajo</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <div className="ion-text-center ion-padding"><IonSpinner name="crescent" /></div>
        ) : (
          <IonList>
            {repuestos.length === 0 && (
              <IonItem>
                <IonLabel color="medium" className="ion-text-center">No se encontraron repuestos.</IonLabel>
              </IonItem>
            )}
            {repuestos.map((r) => {
              const stockBajo = r.stock_actual <= r.stock_minimo;
              return (
                <IonItem key={r.id} button detail onClick={() => history.push(`/inventario/${r.id}`)}>
                  <IonIcon icon={stockBajo ? alertCircleOutline : cubeOutline}
                    slot="start" color={stockBajo ? "danger" : "primary"} />
                  <IonLabel>
                    <h2>{r.nombre}</h2>
                    <p>Cod: {r.codigo} — {r.categoria}</p>
                    <p>Venta: {Number(r.precio_venta).toLocaleString("es-CR", { style: "currency", currency: "CRC" })}</p>
                  </IonLabel>
                  <div slot="end" className="ion-text-center">
                    <IonBadge color={stockBajo ? "danger" : "success"} style={{ fontSize: "1rem", padding: "6px 10px" }}>
                      {r.stock_actual}
                    </IonBadge>
                    <IonNote style={{ display: "block", fontSize: "0.7rem" }}>min: {r.stock_minimo}</IonNote>
                  </div>
                </IonItem>
              );
            })}
          </IonList>
        )}
        <IonInfiniteScroll onIonInfinite={async (ev) => { await cargar(); ev.target.complete(); }} disabled={!hasMore}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>
      </IonContent>

      {canEdit && <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton onClick={() => history.push("/inventario/nuevo")}>
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>}
    </IonPage>
  );
};

export default Inventario;
