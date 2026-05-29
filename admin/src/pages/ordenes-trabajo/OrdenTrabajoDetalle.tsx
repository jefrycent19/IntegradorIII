import {
  IonBackButton, IonBadge, IonButton, IonButtons, IonCard, IonCardContent,
  IonCardHeader, IonCardTitle, IonChip, IonContent, IonHeader, IonIcon,
  IonItem, IonLabel, IonList, IonListHeader, IonPage, IonSegment,
  IonSegmentButton, IonSpinner, IonText, IonTitle, IonToolbar, useIonToast,
} from "@ionic/react";
import {
  timeOutline, personOutline, bicycleOutline, cubeOutline,
  checkmarkCircleOutline, alertCircleOutline, cameraOutline,
  receiptOutline, shieldCheckmarkOutline, chatbubbleOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const estadoColor: Record<string, string> = {
  recepcion: "medium", diagnostico: "warning",
  reparacion: "primary", lista: "success", entregada: "dark",
};
const semaforoColor: Record<string, string> = {
  verde: "success", amarillo: "warning", rojo: "danger",
};

const OrdenTrabajoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ot, setOt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("info");
  const [toast] = useIonToast();
  const history = useHistory();
  const { tieneRol } = useAuth();

  const cargar = () => {
    setLoading(true);
    api.get(`/ordenes-trabajo/${id}`)
      .then(({ data }) => { setOt(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [id]);

  const avanzarEstado = async () => {
    const flujo = ["recepcion", "diagnostico", "reparacion", "lista", "entregada"];
    const idx = flujo.indexOf(ot.estado);
    if (idx >= flujo.length - 1) return;
    await api.patch(`/ordenes-trabajo/${id}`, { estado: flujo[idx + 1] });
    toast({ message: "Estado actualizado.", duration: 3000, color: "success" });
    cargar();
  };

  if (loading) return (
    <IonPage>
      <IonContent className="ion-text-center ion-padding"><IonSpinner name="crescent" /></IonContent>
    </IonPage>
  );

  const etiquetaEstado: Record<string, string> = {
    recepcion: "Recepción", diagnostico: "Diagnóstico",
    reparacion: "En Reparación", lista: "Lista p/Entregar", entregada: "Entregada",
  };
  const siguienteEstado: Record<string, string> = {
    recepcion: "Pasar a Diagnóstico", diagnostico: "Pasar a Reparación",
    reparacion: "Marcar como Lista", lista: "Registrar Entrega",
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton defaultHref="/ordenes-trabajo" /></IonButtons>
          <IonTitle>{ot.numero_ot}</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={tab} onIonChange={(e) => setTab(e.detail.value as string)}>
            <IonSegmentButton value="info"><IonLabel>Info</IonLabel></IonSegmentButton>
            <IonSegmentButton value="avances"><IonLabel>Avances</IonLabel></IonSegmentButton>
            <IonSegmentButton value="repuestos"><IonLabel>Repuestos</IonLabel></IonSegmentButton>
            <IonSegmentButton value="docs"><IonLabel>Docs</IonLabel></IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Cabecera con estado y semáforo */}
        <IonCard style={{ margin: "12px 12px 0" }}>
          <IonCardContent>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <IonBadge color={estadoColor[ot.estado]} style={{ fontSize: "0.9rem", padding: "6px 12px" }}>
                  {etiquetaEstado[ot.estado]}
                </IonBadge>
                <IonChip color={ot.prioridad === "emergencia" ? "danger" : "medium"} style={{ marginLeft: 8 }}>
                  {ot.prioridad}
                </IonChip>
              </div>
              {ot.tiempos_etapa?.slice(-1)[0] && (
                <IonBadge color={semaforoColor[ot.tiempos_etapa.slice(-1)[0].semaforo]}>
                  ⏱ {ot.tiempos_etapa.slice(-1)[0].semaforo}
                </IonBadge>
              )}
            </div>
            {ot.estado !== "entregada" && tieneRol("Administrador", "Jefe de Taller") && (
              <IonButton expand="block" className="ion-margin-top" onClick={avanzarEstado}>
                {siguienteEstado[ot.estado]}
              </IonButton>
            )}
            {tieneRol("Administrador", "Jefe de Taller") && (
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <IonButton expand="block" fill="outline" style={{ flex: 1 }}
                  onClick={() => history.push(`/ordenes-trabajo/${id}/reasignar`)}>
                  👷 Reasignar técnico
                </IonButton>
                <IonButton expand="block" fill="outline" color="secondary" style={{ flex: 1 }}
                  onClick={() => history.push(`/ordenes-trabajo/${id}/notificar`)}>
                  🔔 Notificar cliente
                </IonButton>
              </div>
            )}
            {tieneRol("Administrador", "Recepcionista") && (
              <IonButton expand="block" fill="outline" color="medium" style={{ marginTop: 8 }}
                onClick={() => history.push(`/ordenes-trabajo/${id}/comprobante`)}>
                🖨️ Comprobante de recepción
              </IonButton>
            )}
          </IonCardContent>
        </IonCard>

        {/* TAB: INFO */}
        {tab === "info" && (
          <>
            <IonList inset>
              <IonListHeader><IonIcon icon={personOutline} style={{ marginRight: 8 }} />Cliente</IonListHeader>
              <IonItem button detail onClick={() => history.push(`/clientes/${ot.cliente?.id}`)}>
                <IonLabel>
                  <h2>{ot.cliente?.nombre} {ot.cliente?.apellido}</h2>
                  <p>{ot.cliente?.telefono}</p>
                </IonLabel>
              </IonItem>
            </IonList>

            <IonList inset>
              <IonListHeader><IonIcon icon={bicycleOutline} style={{ marginRight: 8 }} />Motocicleta</IonListHeader>
              <IonItem>
                <IonLabel>
                  <h2>{ot.motocicleta?.marca} {ot.motocicleta?.modelo} {ot.motocicleta?.anio}</h2>
                  <p>Placa: {ot.motocicleta?.placa} — Color: {ot.motocicleta?.color}</p>
                  <p>Km ingreso: {ot.kilometraje_ingreso?.toLocaleString()} km</p>
                  <p>Combustible: {ot.nivel_combustible}</p>
                </IonLabel>
              </IonItem>
            </IonList>

            <IonList inset>
              <IonListHeader><IonIcon icon={chatbubbleOutline} style={{ marginRight: 8 }} />Problema reportado</IonListHeader>
              <IonItem lines="none">
                <IonLabel className="ion-text-wrap">{ot.problema_reportado}</IonLabel>
              </IonItem>
              {ot.estado_fisico && (
                <IonItem lines="none">
                  <IonLabel className="ion-text-wrap"><p>Estado físico:</p>{ot.estado_fisico}</IonLabel>
                </IonItem>
              )}
            </IonList>

            {ot.diagnostico && (
              <IonList inset>
                <IonListHeader>Diagnóstico</IonListHeader>
                <IonItem lines="none">
                  <IonLabel className="ion-text-wrap">
                    <p>Fallas detectadas:</p>
                    <h3>{ot.diagnostico.descripcion_fallas}</h3>
                    <p>Mano de obra est: ₡{Number(ot.diagnostico.mano_obra_estimada).toLocaleString()}</p>
                    <p>Tiempo est: {ot.diagnostico.tiempo_estimado_horas}h</p>
                  </IonLabel>
                  <IonBadge slot="end" color={ot.diagnostico.estado === "aprobado" ? "success" : "warning"}>
                    {ot.diagnostico.estado}
                  </IonBadge>
                </IonItem>
              </IonList>
            )}

            {ot.checklist && (
              <IonList inset>
                <IonListHeader><IonIcon icon={checkmarkCircleOutline} style={{ marginRight: 8 }} />Checklist de entrega</IonListHeader>
                {[
                  ["Prueba realizada", ot.checklist.prueba_realizada],
                  ["Lavado", ot.checklist.lavado],
                  ["Calidad revisada", ot.checklist.calidad_revisada],
                  ["Facturación lista", ot.checklist.facturacion_lista],
                  ["Cliente notificado", ot.checklist.cliente_notificado],
                ].map(([label, val]) => (
                  <IonItem key={label as string} lines="none">
                    <IonIcon
                      icon={val ? checkmarkCircleOutline : alertCircleOutline}
                      color={val ? "success" : "medium"}
                      slot="start"
                    />
                    <IonLabel>{label}</IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        )}

        {/* TAB: AVANCES */}
        {tab === "avances" && (
          <IonList inset>
            <IonListHeader>Avances técnicos</IonListHeader>
            {ot.avances?.length === 0 && (
              <IonItem><IonLabel color="medium">Sin avances registrados.</IonLabel></IonItem>
            )}
            {ot.avances?.map((a: any) => (
              <IonItem key={a.id} lines="full">
                <IonLabel className="ion-text-wrap">
                  <p style={{ fontSize: "0.75rem" }}>
                    {new Date(a.fecha_hora).toLocaleString()} — {a.tecnico?.nombre} {a.tecnico?.apellido}
                  </p>
                  <h3>{a.descripcion}</h3>
                </IonLabel>
              </IonItem>
            ))}
            {tieneRol("Técnico", "Jefe de Taller", "Administrador") && (
              <div className="ion-margin" style={{ display: "flex", gap: 8 }}>
                <IonButton expand="block" fill="outline" style={{ flex: 1 }}
                  onClick={() => history.push(`/ordenes-trabajo/${id}/avance`)}>
                  + Registrar avance
                </IonButton>
                <IonButton expand="block" fill="outline" color="success" style={{ flex: 1 }}
                  onClick={() => history.push(`/ordenes-trabajo/${id}/timer`)}>
                  ⏱ Timer
                </IonButton>
              </div>
            )}
          </IonList>
        )}

        {/* TAB: REPUESTOS */}
        {tab === "repuestos" && (
          <IonList inset>
            <IonListHeader><IonIcon icon={cubeOutline} style={{ marginRight: 8 }} />Repuestos</IonListHeader>
            {ot.repuestos?.length === 0 && (
              <IonItem><IonLabel color="medium">Sin repuestos registrados.</IonLabel></IonItem>
            )}
            {ot.repuestos?.map((r: any) => (
              <IonItem key={r.id}>
                <IonLabel>
                  <h3>{r.repuesto?.nombre}</h3>
                  <p>Cant: {r.cantidad} × ₡{Number(r.precio_unitario).toLocaleString()}</p>
                </IonLabel>
                <IonBadge
                  color={r.estado === "disponible" ? "success" : r.estado === "pedido_especial" ? "danger" : "warning"}
                  slot="end"
                >
                  {r.estado}
                </IonBadge>
              </IonItem>
            ))}
            {tieneRol("Técnico", "Jefe de Taller", "Administrador") && (
              <IonButton expand="block" fill="outline" className="ion-margin"
                onClick={() => history.push(`/ordenes-trabajo/${id}/repuesto`)}>
                + Agregar repuesto
              </IonButton>
            )}
          </IonList>
        )}

        {/* TAB: DOCS */}
        {tab === "docs" && (
          <>
            <IonList inset>
              <IonListHeader><IonIcon icon={cameraOutline} style={{ marginRight: 8 }} />Evidencias ({ot.evidencias?.length ?? 0})</IonListHeader>
              {ot.evidencias?.length === 0 && (
                <IonItem><IonLabel color="medium">Sin evidencias adjuntas.</IonLabel></IonItem>
              )}
              {ot.evidencias?.map((e: any) => (
                <IonItem key={e.id}>
                  <IonLabel><h3>{e.descripcion ?? e.tipo}</h3><p>{e.etapa}</p></IonLabel>
                  <IonBadge slot="end">{e.tipo}</IonBadge>
                </IonItem>
              ))}
              {tieneRol("Técnico", "Jefe de Taller", "Administrador") && (
                <IonButton expand="block" fill="outline" className="ion-margin"
                  onClick={() => history.push(`/ordenes-trabajo/${id}/evidencia`)}>
                  📷 Agregar evidencia
                </IonButton>
              )}
            </IonList>

            {ot.factura && (
              <IonList inset>
                <IonListHeader><IonIcon icon={receiptOutline} style={{ marginRight: 8 }} />Factura</IonListHeader>
                <IonItem button detail onClick={() => history.push(`/facturas/${ot.factura.id}`)}>
                  <IonLabel>
                    <h2>{ot.factura.numero_factura}</h2>
                    <p>Total: ₡{Number(ot.factura.total).toLocaleString()}</p>
                    <p>Método: {ot.factura.metodo_pago}</p>
                  </IonLabel>
                  <IonBadge color={ot.factura.estado === "pagada" ? "success" : "warning"} slot="end">
                    {ot.factura.estado}
                  </IonBadge>
                </IonItem>
              </IonList>
            )}

            {ot.garantia && (
              <IonList inset>
                <IonListHeader><IonIcon icon={shieldCheckmarkOutline} style={{ marginRight: 8 }} />Garantía</IonListHeader>
                <IonItem>
                  <IonLabel>
                    <h3>{ot.garantia.descripcion}</h3>
                    <p>Vigencia: {ot.garantia.fecha_inicio} → {ot.garantia.fecha_fin}</p>
                  </IonLabel>
                  <IonBadge color={ot.garantia.estado === "activa" ? "success" : "warning"} slot="end">
                    {ot.garantia.estado}
                  </IonBadge>
                </IonItem>
              </IonList>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default OrdenTrabajoDetalle;