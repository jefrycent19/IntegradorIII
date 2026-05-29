import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput,
  IonItem, IonLabel, IonList, IonListHeader, IonPage, IonSelect,
  IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const MotocicletaForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const esEdicion = !!id && id !== "nueva";
  const history = useHistory();
  const [toast] = useIonToast();
  const [guardando, setGuardando] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    cliente_id: "", marca: "", modelo: "", anio: String(new Date().getFullYear()),
    placa: "", color: "", numero_chasis: "", numero_motor: "",
    kilometraje_actual: "0", notas: "",
  });

  useEffect(() => {
    api.get("/clientes?per_page=100").then(({ data }) => setClientes(data.data));
    if (!esEdicion) return;
    api.get(`/motocicletas/${id}`).then(({ data }) => {
      setForm({
        cliente_id: String(data.cliente_id ?? ""), marca: data.marca ?? "",
        modelo: data.modelo ?? "", anio: String(data.anio ?? ""),
        placa: data.placa ?? "", color: data.color ?? "",
        numero_chasis: data.numero_chasis ?? "", numero_motor: data.numero_motor ?? "",
        kilometraje_actual: String(data.kilometraje_actual ?? 0), notas: data.notas ?? "",
      });
    });
  }, [id]);

  const set = (campo: string) => (e: any) =>
    setForm((prev) => ({ ...prev, [campo]: e.detail.value ?? "" }));

  const guardar = async () => {
    const err: Record<string, string> = {};
    if (!form.cliente_id) err.cliente_id = "Requerido";
    if (!form.marca.trim()) err.marca = "Requerido";
    if (!form.modelo.trim()) err.modelo = "Requerido";
    if (!form.placa.trim()) err.placa = "Requerido";
    if (!form.color.trim()) err.color = "Requerido";
    if (Object.keys(err).length) { setErrores(err); return; }

    setGuardando(true);
    try {
      const payload = { ...form, anio: Number(form.anio), kilometraje_actual: Number(form.kilometraje_actual) };
      if (esEdicion) {
        await api.put(`/motocicletas/${id}`, payload);
        toast({ message: "Motocicleta actualizada.", duration: 3000, color: "success" });
        history.replace(`/motocicletas/${id}`);
      } else {
        const { data } = await api.post("/motocicletas", payload);
        toast({ message: "Motocicleta registrada.", duration: 3000, color: "success" });
        history.replace(`/motocicletas/${data.id}`);
      }
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
          <IonButtons slot="start"><IonBackButton /></IonButtons>
          <IonTitle>{esEdicion ? "Editar motocicleta" : "Nueva motocicleta"}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={guardar} disabled={guardando}>
              {guardando ? <IonSpinner name="crescent" /> : "Guardar"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonListHeader>Propietario</IonListHeader>
          <IonItem className={errores.cliente_id ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Cliente *</IonLabel>
            <IonSelect value={form.cliente_id} onIonChange={set("cliente_id")} placeholder="Seleccionar cliente">
              {clientes.map((c) => (
                <IonSelectOption key={c.id} value={String(c.id)}>
                  {c.nombre} {c.apellido} — {c.cedula}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonListHeader>Datos de la moto</IonListHeader>
          {[
            ["Marca *", "marca"], ["Modelo *", "modelo"], ["Color *", "color"],
          ].map(([label, key]) => (
            <IonItem key={key} className={errores[key] ? "ion-invalid" : ""}>
              <IonLabel position="stacked">{label}</IonLabel>
              <IonInput value={form[key as keyof typeof form]} onIonInput={set(key)} />
            </IonItem>
          ))}
          <IonItem className={errores.anio ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Año *</IonLabel>
            <IonInput type="number" value={form.anio} onIonInput={set("anio")} min="1950" max={String(new Date().getFullYear() + 1)} />
          </IonItem>
          <IonItem className={errores.placa ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Placa *</IonLabel>
            <IonInput value={form.placa} onIonInput={set("placa")} placeholder="Ej: ABC-123" />
          </IonItem>

          <IonListHeader>Identificacion</IonListHeader>
          <IonItem>
            <IonLabel position="stacked">Numero de chasis</IonLabel>
            <IonInput value={form.numero_chasis} onIonInput={set("numero_chasis")} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Numero de motor</IonLabel>
            <IonInput value={form.numero_motor} onIonInput={set("numero_motor")} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Kilometraje actual</IonLabel>
            <IonInput type="number" value={form.kilometraje_actual} onIonInput={set("kilometraje_actual")} min="0" />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Notas</IonLabel>
            <IonTextarea rows={2} value={form.notas} onIonInput={set("notas")} />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MotocicletaForm;
