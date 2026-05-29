import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput,
  IonItem, IonLabel, IonList, IonListHeader, IonPage, IonSelect,
  IonSelectOption, IonSpinner, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const UsuarioForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const esEdicion = !!id && id !== "nuevo";
  const history = useHistory();
  const [toast] = useIonToast();
  const [guardando, setGuardando] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    rol_id: "", nombre: "", apellido: "", email: "", password: "", telefono: "",
  });

  useEffect(() => {
    api.get("/usuarios").then(({ data }) => {
      const rolesUnicos = Array.from(new Map(data.map((u: any) => [u.rol?.id, u.rol])).values());
      setRoles(rolesUnicos.filter(Boolean));
    });
    if (!esEdicion) return;
    api.get("/usuarios").then(({ data }) => {
      const u = data.find((x: any) => String(x.id) === id);
      if (u) setForm({
        rol_id: String(u.rol_id ?? ""), nombre: u.nombre ?? "",
        apellido: u.apellido ?? "", email: u.email ?? "",
        password: "", telefono: u.telefono ?? "",
      });
    });
  }, [id]);

  const set = (campo: string) => (e: any) =>
    setForm((prev) => ({ ...prev, [campo]: e.detail.value ?? "" }));

  const guardar = async () => {
    const err: Record<string, string> = {};
    if (!form.rol_id) err.rol_id = "Requerido";
    if (!form.nombre.trim()) err.nombre = "Requerido";
    if (!form.apellido.trim()) err.apellido = "Requerido";
    if (!form.email.trim()) err.email = "Requerido";
    if (!esEdicion && !form.password) err.password = "Requerido";
    if (Object.keys(err).length) { setErrores(err); return; }

    setGuardando(true);
    try {
      const payload: any = { ...form, rol_id: Number(form.rol_id) };
      if (!payload.password) delete payload.password;
      if (esEdicion) {
        await api.patch("/usuarios/" + id, payload);
        toast({ message: "Usuario actualizado.", duration: 3000, color: "success" });
      } else {
        await api.post("/usuarios", payload);
        toast({ message: "Usuario creado.", duration: 3000, color: "success" });
      }
      history.replace("/usuarios");
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
          <IonButtons slot="start"><IonBackButton defaultHref="/usuarios" /></IonButtons>
          <IonTitle>{esEdicion ? "Editar usuario" : "Nuevo usuario"}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={guardar} disabled={guardando}>
              {guardando ? <IonSpinner name="crescent" /> : "Guardar"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonListHeader>Rol y datos personales</IonListHeader>
          <IonItem className={errores.rol_id ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Rol *</IonLabel>
            <IonSelect value={form.rol_id} onIonChange={set("rol_id")} placeholder="Seleccionar rol">
              {roles.map((r) => (
                <IonSelectOption key={r.id} value={String(r.id)}>{r.nombre}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          {[
            ["Nombre *", "nombre", "text"],
            ["Apellido *", "apellido", "text"],
            ["Telefono", "telefono", "tel"],
          ].map(([label, key, type]) => (
            <IonItem key={key} className={errores[key] ? "ion-invalid" : ""}>
              <IonLabel position="stacked">{label}</IonLabel>
              <IonInput type={type as any} value={form[key as keyof typeof form]} onIonInput={set(key)} />
            </IonItem>
          ))}

          <IonListHeader>Acceso al sistema</IonListHeader>
          <IonItem className={errores.email ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Correo electronico *</IonLabel>
            <IonInput type="email" value={form.email} onIonInput={set("email")} />
          </IonItem>
          <IonItem className={errores.password ? "ion-invalid" : ""}>
            <IonLabel position="stacked">{esEdicion ? "Nueva contrasena (dejar vacio para no cambiar)" : "Contrasena *"}</IonLabel>
            <IonInput type="password" value={form.password} onIonInput={set("password")} placeholder="Min. 8 caracteres" />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default UsuarioForm;