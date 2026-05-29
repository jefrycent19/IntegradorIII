import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput,
  IonItem, IonLabel, IonList, IonListHeader, IonPage, IonSelect,
  IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";

const CitaForm: React.FC = () => {
  const history = useHistory();
  const [toast] = useIonToast();
  const [guardando, setGuardando] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [motos, setMotos] = useState<any[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    cliente_id: "", motocicleta_id: "",
    fecha_hora: "", duracion_estimada_min: "60",
    tipo_servicio: "preventivo", descripcion_problema: "", notas: "",
  });

  useEffect(() => {
    api.get("/clientes?per_page=100").then(({ data }) => setClientes(data.data));
  }, []);

  const onClienteChange = async (clienteId: string) => {
    setForm((prev) => ({ ...prev, cliente_id: clienteId, motocicleta_id: "" }));
    if (!clienteId) { setMotos([]); return; }
    const { data } = await api.get("/motocicletas?cliente_id=" + clienteId + "&per_page=100");
    setMotos(data.data);
  };

  const set = (campo: string) => (e: any) =>
    setForm((prev) => ({ ...prev, [campo]: e.detail.value ?? "" }));

  const guardar = async () => {
    const err: Record<string, string> = {};
    if (!form.cliente_id) err.cliente_id = "Requerido";
    if (!form.motocicleta_id) err.motocicleta_id = "Requerido";
    if (!form.fecha_hora) err.fecha_hora = "Requerido";
    if (!form.descripcion_problema.trim()) err.descripcion_problema = "Requerido";
    if (Object.keys(err).length) { setErrores(err); return; }

    setGuardando(true);
    try {
      await api.post("/citas", {
        ...form,
        duracion_estimada_min: Number(form.duracion_estimada_min),
      });
      toast({ message: "Cita agendada correctamente.", duration: 3000, color: "success" });
      history.replace("/citas");
    } catch (e: any) {
      const apiErr = e.response?.data?.errors ?? {};
      const mapped: Record<string, string> = {};
      Object.entries(apiErr).forEach(([k, v]: any) => (mapped[k] = v[0]));
      setErrores(mapped);
      toast({ message: "Revisa los campos.", duration: 3000, color: "danger" });
    } finally { setGuardando(false); }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton defaultHref="/citas" /></IonButtons>
          <IonTitle>Nueva Cita</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={guardar} disabled={guardando}>
              {guardando ? <IonSpinner name="crescent" /> : "Agendar"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonListHeader>Cliente y Motocicleta</IonListHeader>
          <IonItem className={errores.cliente_id ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Cliente *</IonLabel>
            <IonSelect value={form.cliente_id} onIonChange={(e) => onClienteChange(e.detail.value)} placeholder="Seleccionar cliente">
              {clientes.map((c) => (
                <IonSelectOption key={c.id} value={String(c.id)}>
                  {c.nombre} {c.apellido} — {c.cedula}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem className={errores.motocicleta_id ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Motocicleta *</IonLabel>
            <IonSelect value={form.motocicleta_id} onIonChange={set("motocicleta_id")}
              placeholder={form.cliente_id ? "Seleccionar moto" : "Primero selecciona un cliente"}
              disabled={!form.cliente_id}>
              {motos.map((m) => (
                <IonSelectOption key={m.id} value={String(m.id)}>
                  {m.marca} {m.modelo} — {m.placa}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonListHeader>Fecha y Servicio</IonListHeader>
          <IonItem className={errores.fecha_hora ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Fecha y hora *</IonLabel>
            <IonInput type="datetime-local" value={form.fecha_hora} onIonInput={set("fecha_hora")} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Tipo de servicio</IonLabel>
            <IonSelect value={form.tipo_servicio} onIonChange={set("tipo_servicio")}>
              {["preventivo","reparacion","diagnostico","garantia","emergencia"].map((t) => (
                <IonSelectOption key={t} value={t}>{t}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Duracion estimada (min)</IonLabel>
            <IonInput type="number" value={form.duracion_estimada_min} onIonInput={set("duracion_estimada_min")} min="15" />
          </IonItem>
          <IonItem className={errores.descripcion_problema ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Descripcion del servicio *</IonLabel>
            <IonTextarea rows={3} value={form.descripcion_problema} onIonInput={set("descripcion_problema")} placeholder="Detalle lo que necesita el cliente..." />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Notas internas</IonLabel>
            <IonTextarea rows={2} value={form.notas} onIonInput={set("notas")} />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default CitaForm;
