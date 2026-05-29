import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader,
  IonInput, IonItem, IonLabel, IonList, IonListHeader,
  IonPage, IonSpinner, IonTextarea, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const ClienteForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const esEdicion = !!id;
  const history = useHistory();
  const [toast] = useIonToast();
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [form, setForm] = useState({
    nombre: "", apellido: "", cedula: "", telefono: "",
    telefono_alt: "", email: "", direccion: "", notas: "",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!esEdicion) return;
    setLoading(true);
    api.get(`/clientes/${id}`).then(({ data }) => {
      setForm({
        nombre: data.nombre ?? "", apellido: data.apellido ?? "",
        cedula: data.cedula ?? "", telefono: data.telefono ?? "",
        telefono_alt: data.telefono_alt ?? "", email: data.email ?? "",
        direccion: data.direccion ?? "", notas: data.notas ?? "",
      });
      setLoading(false);
    });
  }, [id]);

  const set = (campo: string) => (e: any) =>
    setForm((prev) => ({ ...prev, [campo]: e.detail.value ?? "" }));

  const guardar = async () => {
    const err: Record<string, string> = {};
    if (!form.nombre.trim()) err.nombre = "Requerido";
    if (!form.apellido.trim()) err.apellido = "Requerido";
    if (!form.cedula.trim()) err.cedula = "Requerido";
    if (!form.telefono.trim()) err.telefono = "Requerido";
    if (Object.keys(err).length) { setErrores(err); return; }

    setGuardando(true);
    try {
      if (esEdicion) {
        await api.put(`/clientes/${id}`, form);
        toast({ message: "Cliente actualizado.", duration: 3000, color: "success" });
        history.replace(`/clientes/${id}`);
      } else {
        const { data } = await api.post("/clientes", form);
        toast({ message: "Cliente creado.", duration: 3000, color: "success" });
        history.replace(`/clientes/${data.id}`);
      }
    } catch (e: any) {
      const apiErr = e.response?.data?.errors ?? {};
      const mapped: Record<string, string> = {};
      Object.entries(apiErr).forEach(([k, v]: any) => (mapped[k] = v[0]));
      setErrores(mapped);
      toast({ message: "Revisa los campos.", duration: 3000, color: "danger" });
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return (
    <IonPage>
      <IonContent className="ion-text-center ion-padding"><IonSpinner name="crescent" /></IonContent>
    </IonPage>
  );

  const campo = (label: string, key: keyof typeof form, type: any = "text", required = false) => (
    <IonItem className={errores[key] ? "ion-invalid" : ""}>
      <IonLabel position="stacked">{label}{required && " *"}</IonLabel>
      <IonInput type={type} value={form[key]} onIonInput={set(key)} />
      {errores[key] && <p style={{ color: "var(--ion-color-danger)", fontSize: "0.8rem", paddingLeft: 16 }}>{errores[key]}</p>}
    </IonItem>
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton /></IonButtons>
          <IonTitle>{esEdicion ? "Editar cliente" : "Nuevo cliente"}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={guardar} disabled={guardando}>
              {guardando ? <IonSpinner name="crescent" /> : "Guardar"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonListHeader>Datos personales</IonListHeader>
          {campo("Nombre", "nombre", "text", true)}
          {campo("Apellido", "apellido", "text", true)}
          {campo("Cédula", "cedula", "text", true)}

          <IonListHeader>Contacto</IonListHeader>
          {campo("Teléfono", "telefono", "tel", true)}
          {campo("Teléfono alternativo", "telefono_alt", "tel")}
          {campo("Correo electrónico", "email", "email")}
          {campo("Dirección", "direccion")}

          <IonListHeader>Notas</IonListHeader>
          <IonItem>
            <IonLabel position="stacked">Notas internas</IonLabel>
            <IonTextarea rows={3} value={form.notas} onIonInput={set("notas")} />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ClienteForm;