import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader,
  IonInput, IonItem, IonLabel, IonList, IonListHeader, IonPage,
  IonSelect, IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";

const OrdenTrabajoForm: React.FC = () => {
  const history = useHistory();
  const [toast] = useIonToast();
  const [guardando, setGuardando] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [motos, setMotos] = useState<any[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    cliente_id: "", motocicleta_id: "", prioridad: "preventivo",
    kilometraje_ingreso: "", nivel_combustible: "medio",
    estado_fisico: "", accesorios_entregados: "",
    problema_reportado: "", observaciones_generales: "",
    fecha_estimada_entrega: "",
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
    if (!form.kilometraje_ingreso) err.kilometraje_ingreso = "Requerido";
    if (!form.estado_fisico.trim()) err.estado_fisico = "Requerido";
    if (!form.problema_reportado.trim()) err.problema_reportado = "Requerido";
    if (Object.keys(err).length) { setErrores(err); return; }
    setGuardando(true);
    try {
      const { data } = await api.post("/ordenes-trabajo", {
        ...form, kilometraje_ingreso: Number(form.kilometraje_ingreso),
      });
      toast({ message: "OT " + data.numero_ot + " creada.", duration: 3000, color: "success" });
      history.replace("/ordenes-trabajo/" + data.id);
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
          <IonButtons slot="start"><IonBackButton defaultHref="/ordenes-trabajo" /></IonButtons>
          <IonTitle>Nueva Orden de Trabajo</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={guardar} disabled={guardando}>
              {guardando ? <IonSpinner name="crescent" /> : "Crear OT"}
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
                  {m.marca} {m.modelo} {m.anio} — {m.placa}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonListHeader>Condiciones de ingreso</IonListHeader>
          <IonItem className={errores.kilometraje_ingreso ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Kilometraje *</IonLabel>
            <IonInput type="number" value={form.kilometraje_ingreso} onIonInput={set("kilometraje_ingreso")} placeholder="Ej: 15000" />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Nivel de combustible</IonLabel>
            <IonSelect value={form.nivel_combustible} onIonChange={set("nivel_combustible")}>
              {["vacio","reserva","cuarto","medio","tres_cuartos","lleno"].map((n) => (
                <IonSelectOption key={n} value={n}>{n}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem className={errores.estado_fisico ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Estado fisico de la moto *</IonLabel>
            <IonTextarea rows={2} value={form.estado_fisico} onIonInput={set("estado_fisico")} placeholder="Rayones, golpes..." />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Accesorios entregados</IonLabel>
            <IonTextarea rows={2} value={form.accesorios_entregados} onIonInput={set("accesorios_entregados")} placeholder="Casco, documentos, llaves..." />
          </IonItem>
          <IonListHeader>Trabajo solicitado</IonListHeader>
          <IonItem>
            <IonLabel position="stacked">Prioridad</IonLabel>
            <IonSelect value={form.prioridad} onIonChange={set("prioridad")}>
              {["rapido","garantia","emergencia","preventivo","mayor"].map((p) => (
                <IonSelectOption key={p} value={p}>{p}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem className={errores.problema_reportado ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Problema reportado *</IonLabel>
            <IonTextarea rows={3} value={form.problema_reportado} onIonInput={set("problema_reportado")} placeholder="Descripcion del problema..." />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Fecha estimada de entrega</IonLabel>
            <IonInput type="datetime-local" value={form.fecha_estimada_entrega} onIonInput={set("fecha_estimada_entrega")} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Observaciones generales</IonLabel>
            <IonTextarea rows={2} value={form.observaciones_generales} onIonInput={set("observaciones_generales")} />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default OrdenTrabajoForm;
