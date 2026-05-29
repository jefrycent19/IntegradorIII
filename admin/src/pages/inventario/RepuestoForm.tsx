import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput,
  IonItem, IonLabel, IonList, IonListHeader, IonPage, IonSelect,
  IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";

const RepuestoForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const esEdicion = !!id && id !== "nuevo";
  const history = useHistory();
  const [toast] = useIonToast();
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    codigo: "", nombre: "", descripcion: "", categoria: "",
    precio_costo: "", precio_venta: "", stock_actual: "0",
    stock_minimo: "5", unidad: "unidad", proveedor: "",
  });

  useEffect(() => {
    if (!esEdicion) return;
    api.get(`/repuestos/${id}`).then(({ data }) => {
      setForm({
        codigo: data.codigo ?? "", nombre: data.nombre ?? "",
        descripcion: data.descripcion ?? "", categoria: data.categoria ?? "",
        precio_costo: String(data.precio_costo ?? ""), precio_venta: String(data.precio_venta ?? ""),
        stock_actual: String(data.stock_actual ?? 0), stock_minimo: String(data.stock_minimo ?? 5),
        unidad: data.unidad ?? "unidad", proveedor: data.proveedor ?? "",
      });
    });
  }, [id]);

  const set = (campo: string) => (e: any) =>
    setForm((prev) => ({ ...prev, [campo]: e.detail.value ?? "" }));

  const guardar = async () => {
    const err: Record<string, string> = {};
    if (!form.codigo.trim()) err.codigo = "Requerido";
    if (!form.nombre.trim()) err.nombre = "Requerido";
    if (!form.categoria.trim()) err.categoria = "Requerido";
    if (!form.precio_venta) err.precio_venta = "Requerido";
    if (Object.keys(err).length) { setErrores(err); return; }

    setGuardando(true);
    try {
      const payload = {
        ...form,
        precio_costo: Number(form.precio_costo),
        precio_venta: Number(form.precio_venta),
        stock_actual: Number(form.stock_actual),
        stock_minimo: Number(form.stock_minimo),
      };
      if (esEdicion) {
        await api.put(`/repuestos/${id}`, payload);
        toast({ message: "Repuesto actualizado.", duration: 3000, color: "success" });
        history.replace(`/inventario/${id}`);
      } else {
        const { data } = await api.post("/repuestos", payload);
        toast({ message: "Repuesto creado.", duration: 3000, color: "success" });
        history.replace(`/inventario/${data.id}`);
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
          <IonTitle>{esEdicion ? "Editar repuesto" : "Nuevo repuesto"}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={guardar} disabled={guardando}>
              {guardando ? <IonSpinner name="crescent" /> : "Guardar"}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonListHeader>Identificacion</IonListHeader>
          <IonItem className={errores.codigo ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Codigo *</IonLabel>
            <IonInput value={form.codigo} onIonInput={set("codigo")} placeholder="Ej: REP-001" disabled={esEdicion} />
          </IonItem>
          <IonItem className={errores.nombre ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Nombre *</IonLabel>
            <IonInput value={form.nombre} onIonInput={set("nombre")} />
          </IonItem>
          <IonItem className={errores.categoria ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Categoria *</IonLabel>
            <IonInput value={form.categoria} onIonInput={set("categoria")} placeholder="Ej: Filtros, Frenos, Motor..." />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Descripcion</IonLabel>
            <IonTextarea rows={2} value={form.descripcion} onIonInput={set("descripcion")} />
          </IonItem>

          <IonListHeader>Precios</IonListHeader>
          <IonItem>
            <IonLabel position="stacked">Precio costo (CRC)</IonLabel>
            <IonInput type="number" value={form.precio_costo} onIonInput={set("precio_costo")} min="0" />
          </IonItem>
          <IonItem className={errores.precio_venta ? "ion-invalid" : ""}>
            <IonLabel position="stacked">Precio venta (CRC) *</IonLabel>
            <IonInput type="number" value={form.precio_venta} onIonInput={set("precio_venta")} min="0" />
          </IonItem>

          <IonListHeader>Stock</IonListHeader>
          <IonItem>
            <IonLabel position="stacked">Unidad de medida</IonLabel>
            <IonSelect value={form.unidad} onIonChange={set("unidad")}>
              {["unidad","par","litro","kit","metro","juego"].map((u) => (
                <IonSelectOption key={u} value={u}>{u}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          {!esEdicion && (
            <IonItem>
              <IonLabel position="stacked">Stock inicial</IonLabel>
              <IonInput type="number" value={form.stock_actual} onIonInput={set("stock_actual")} min="0" />
            </IonItem>
          )}
          <IonItem>
            <IonLabel position="stacked">Stock minimo (alerta)</IonLabel>
            <IonInput type="number" value={form.stock_minimo} onIonInput={set("stock_minimo")} min="0" />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Proveedor</IonLabel>
            <IonInput value={form.proveedor} onIonInput={set("proveedor")} />
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default RepuestoForm;
