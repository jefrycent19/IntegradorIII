import {
  IonBadge, IonContent, IonFab, IonFabButton, IonHeader, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel,
  IonList, IonMenuButton, IonPage, IonSearchbar, IonSpinner,
  IonTitle, IonToolbar,
} from "@ionic/react";
import { addOutline, bicycleOutline } from "ionicons/icons";
import { useCanEditClientes } from '../../hooks/useCanEdit';
import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";

const Motocicletas: React.FC = () => {
  const canEdit = useCanEditClientes();
  const [motos, setMotos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const history = useHistory();
  const debounce = useRef<any>(null);

  const cargar = async (reset = false) => {
    const p = reset ? 1 : page;
    try {
      const { data } = await api.get("/motocicletas", { params: { search, page: p } });
      setMotos(reset ? data.data : (prev: any[]) => [...prev, ...data.data]);
      setHasMore(data.current_page < data.last_page);
      setPage(p + 1);
    } catch {
      setMotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => cargar(true), 350);
  }, [search]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Motocicletas</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar value={search} onIonInput={(e) => setSearch(e.detail.value!)}
            placeholder="Buscar por placa, marca o modelo..." debounce={0} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading ? (
          <div className="ion-text-center ion-padding"><IonSpinner name="crescent" /></div>
        ) : (
          <IonList>
            {motos.map((m) => (
              <IonItem key={m.id} button detail onClick={() => history.push(`/motocicletas/${m.id}`)}>
                <IonIcon icon={bicycleOutline} slot="start" color="primary" />
                <IonLabel>
                  <h2>{m.marca} {m.modelo} {m.anio}</h2>
                  <p>Placa: {m.placa} — {m.color}</p>
                  <p>{m.cliente?.nombre} {m.cliente?.apellido}</p>
                </IonLabel>
                <IonBadge color="medium" slot="end">{m.kilometraje_actual?.toLocaleString()} km</IonBadge>
              </IonItem>
            ))}
          </IonList>
        )}
        <IonInfiniteScroll onIonInfinite={async (ev) => { await cargar(); ev.target.complete(); }} disabled={!hasMore}>
          <IonInfiniteScrollContent />
        </IonInfiniteScroll>
      </IonContent>
      {canEdit && (
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton onClick={() => history.push("/motocicletas/nueva")}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      )}
    </IonPage>
  );
};

export default Motocicletas;
