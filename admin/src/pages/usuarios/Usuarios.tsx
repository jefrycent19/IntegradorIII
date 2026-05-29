import {
  IonBadge, IonButton, IonContent, IonFab, IonFabButton, IonHeader,
  IonIcon, IonItem, IonLabel, IonList, IonMenuButton, IonPage,
  IonSelect, IonSelectOption, IonSpinner, IonTitle, IonToolbar, useIonToast,
  IonItemSliding, IonItemOptions, IonItemOption,
} from "@ionic/react";
import { addOutline, personOutline, createOutline, closeCircleOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";

const rolColor: Record<string, string> = {
  Administrador: "danger", Gerente: "warning",
  "Jefe de Taller": "primary", Tecnico: "secondary", Recepcionista: "medium",
};

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [filtroRol, setFiltroRol] = useState("");
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const [toast] = useIonToast();

  const cargar = async () => {
    setLoading(true);
    const { data } = await api.get("/usuarios", { params: { rol: filtroRol || undefined } });
    setUsuarios(data);
    setLoading(false);
  };

  useEffect(() => { cargar(); }, [filtroRol]);

  const toggleActivo = async (u: any) => {
    await api.patch("/usuarios/" + u.id, { activo: !u.activo });
    toast({ message: u.activo ? "Usuario desactivado." : "Usuario activado.", duration: 3000, color: u.activo ? "warning" : "success" });
    cargar();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonMenuButton slot="start" />
          <IonTitle>Usuarios</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSelect value={filtroRol} onIonChange={(e) => setFiltroRol(e.detail.value)}
            placeholder="Filtrar por rol" style={{ paddingLeft: 16 }}>
            <IonSelectOption value="">Todos los roles</IonSelectOption>
            <IonSelectOption value="Administrador">Administrador</IonSelectOption>
            <IonSelectOption value="Gerente">Gerente</IonSelectOption>
            <IonSelectOption value="Jefe de Taller">Jefe de Taller</IonSelectOption>
            <IonSelectOption value="Tecnico">Tecnico</IonSelectOption>
            <IonSelectOption value="Recepcionista">Recepcionista</IonSelectOption>
          </IonSelect>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {loading ? (
          <div className="ion-text-center ion-padding"><IonSpinner name="crescent" /></div>
        ) : (
          <IonList>
            {usuarios.map((u) => (
              <IonItemSliding key={u.id}>
                <IonItem style={{ opacity: u.activo ? 1 : 0.5 }}>
                  <IonIcon icon={personOutline} slot="start" color={u.activo ? "primary" : "medium"} />
                  <IonLabel>
                    <h2>{u.nombre} {u.apellido}</h2>
                    <p>{u.email}</p>
                    <p>{u.telefono}</p>
                  </IonLabel>
                  <div slot="end" className="ion-text-right">
                    <IonBadge color={rolColor[u.rol?.nombre] ?? "medium"}>
                      {u.rol?.nombre}
                    </IonBadge>
                    {!u.activo && (
                      <IonBadge color="medium" style={{ display: "block", marginTop: 4 }}>inactivo</IonBadge>
                    )}
                  </div>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="primary" onClick={() => history.push("/usuarios/" + u.id + "/editar")}>
                    <IonIcon icon={createOutline} />
                  </IonItemOption>
                  <IonItemOption color={u.activo ? "danger" : "success"} onClick={() => toggleActivo(u)}>
                    <IonIcon icon={closeCircleOutline} />
                    {u.activo ? "Desactivar" : "Activar"}
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}
      </IonContent>

      <IonFab slot="fixed" vertical="bottom" horizontal="end">
        <IonFabButton onClick={() => history.push("/usuarios/nuevo")}>
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>
    </IonPage>
  );
};

export default Usuarios;