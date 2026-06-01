import React from "react";
import { Redirect, Route } from "react-router-dom";
import {
  IonApp, IonMenu, IonMenuButton, IonRouterOutlet,
  IonSplitPane, setupIonicReact,
} from "@ionic/react";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ padding: 32, fontFamily: "monospace", background: "#070B18", color: "#F97316", minHeight: "100vh" }}>
          <h2 style={{ color: "#EF4444" }}>Error en la aplicación</h2>
          <pre style={{ color: "#F8FAFC", whiteSpace: "pre-wrap", fontSize: 13 }}>{err.message}</pre>
          <pre style={{ color: "#475569", fontSize: 11 }}>{err.stack}</pre>
          <button onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
            style={{ marginTop: 24, padding: "10px 24px", background: "#F97316", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
            Limpiar sesión y reiniciar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { IonReactRouter } from "@ionic/react-router";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/layout/Sidebar";

import Login              from "./pages/login/Login";
import Dashboard          from "./pages/dashboard/Dashboard";
import Clientes           from "./pages/clientes/Clientes";
import ClienteDetalle     from "./pages/clientes/ClienteDetalle";
import ClienteForm        from "./pages/clientes/ClienteForm";
import OrdenesTrabajo     from "./pages/ordenes-trabajo/OrdenesTrabajo";
import OrdenTrabajoDetalle from "./pages/ordenes-trabajo/OrdenTrabajoDetalle";
import OrdenTrabajoForm   from "./pages/ordenes-trabajo/OrdenTrabajoForm";
import OtAvanceForm       from "./pages/ordenes-trabajo/OtAvanceForm";
import OtRepuestoForm     from "./pages/ordenes-trabajo/OtRepuestoForm";
import OtDiagnosticoForm  from "./pages/ordenes-trabajo/OtDiagnosticoForm";
import OtChecklistForm    from "./pages/ordenes-trabajo/OtChecklistForm";
import OtFacturaForm       from "./pages/ordenes-trabajo/OtFacturaForm";
import OtGarantiaForm      from "./pages/ordenes-trabajo/OtGarantiaForm";
import OtReasignarTecnico  from "./pages/ordenes-trabajo/OtReasignarTecnico";
import OtNotificarCliente  from "./pages/ordenes-trabajo/OtNotificarCliente";
import ComprobanteRecepcion from "./pages/ordenes-trabajo/ComprobanteRecepcion";
import OtEvidenciaForm     from "./pages/ordenes-trabajo/OtEvidenciaForm";
import CargaTecnicos       from "./pages/tecnicos/CargaTecnicos";
import MisOrdenesTrabajo   from "./pages/tecnico/MisOrdenesTrabajo";
import OtTimer             from "./pages/tecnico/OtTimer";
import AgendaDia           from "./pages/agenda/AgendaDia";
import SolicitudesCitaWeb  from "./pages/solicitudes/SolicitudesCitaWeb";
import Motocicletas       from "./pages/motocicletas/Motocicletas";
import MotocicletaDetalle from "./pages/motocicletas/MotocicletaDetalle";
import MotocicletaForm    from "./pages/motocicletas/MotocicletaForm";
import Citas              from "./pages/citas/Citas";
import CitaForm           from "./pages/citas/CitaForm";
import Inventario         from "./pages/inventario/Inventario";
import RepuestoDetalle    from "./pages/inventario/RepuestoDetalle";
import RepuestoForm       from "./pages/inventario/RepuestoForm";
import Facturacion        from "./pages/facturacion/Facturacion";
import FacturaDetalle     from "./pages/facturacion/FacturaDetalle";
import Usuarios           from "./pages/usuarios/Usuarios";
import UsuarioForm        from "./pages/usuarios/UsuarioForm";
import Reportes              from "./pages/reportes/Reportes";

setupIonicReact();

// Ruta privada simple — redirige al login si no hay token
const Private: React.FC<{ path: string; exact?: boolean; children: React.ReactNode }> = ({
  path, exact, children,
}) => {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  return (
    <Route path={path} exact={exact}>
      {token ? <>{children}</> : <Redirect to="/login" />}
    </Route>
  );
};

const AppRoutes: React.FC = () => {
  const { token } = useAuth();
  return (
    <IonSplitPane contentId="main-content" when="lg">
      {/* Menu lateral — solo visible cuando hay sesion */}
      {token && (
        <IonMenu contentId="main-content" menuId="main-menu" type="overlay"
          style={{ "--side-max-width": "240px", "--background": "linear-gradient(180deg, #0F2A3D 0%, #163449 100%)" } as any}>
          <Sidebar open={false} onClose={() => {}} />
        </IonMenu>
      )}

      {/* Contenido principal */}
      <IonRouterOutlet id="main-content">
        <Route exact path="/login"><Login /></Route>

        <Private exact path="/dashboard"><Dashboard /></Private>
        <Private exact path="/reportes"><Reportes /></Private>

        <Private exact path="/clientes/nuevo"><ClienteForm /></Private>
        <Private exact path="/clientes/:id(\d+)/editar"><ClienteForm /></Private>
        <Private exact path="/clientes/:id(\d+)"><ClienteDetalle /></Private>
        <Private exact path="/clientes"><Clientes /></Private>

        <Private exact path="/ordenes-trabajo/nueva"><OrdenTrabajoForm /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/avance"><OtAvanceForm /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/repuesto"><OtRepuestoForm /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/diagnostico"><OtDiagnosticoForm /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/checklist"><OtChecklistForm /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/factura"><OtFacturaForm /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/garantia"><OtGarantiaForm /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/reasignar"><OtReasignarTecnico /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/notificar"><OtNotificarCliente /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/comprobante"><ComprobanteRecepcion /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/evidencia"><OtEvidenciaForm /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)/timer"><OtTimer /></Private>
        <Private exact path="/ordenes-trabajo/:id(\d+)"><OrdenTrabajoDetalle /></Private>
        <Private exact path="/ordenes-trabajo"><OrdenesTrabajo /></Private>

        <Private exact path="/agenda-dia"><AgendaDia /></Private>
        <Private exact path="/mis-ordenes"><MisOrdenesTrabajo /></Private>

        <Private exact path="/motocicletas/nueva"><MotocicletaForm /></Private>
        <Private exact path="/motocicletas/:id(\d+)/editar"><MotocicletaForm /></Private>
        <Private exact path="/motocicletas/:id(\d+)"><MotocicletaDetalle /></Private>
        <Private exact path="/motocicletas"><Motocicletas /></Private>

        <Private exact path="/citas/nueva"><CitaForm /></Private>
        <Private exact path="/citas"><Citas /></Private>

        <Private exact path="/inventario/nuevo"><RepuestoForm /></Private>
        <Private exact path="/inventario/:id(\d+)/editar"><RepuestoForm /></Private>
        <Private exact path="/inventario/:id(\d+)"><RepuestoDetalle /></Private>
        <Private exact path="/inventario"><Inventario /></Private>

        <Private exact path="/facturacion/:id(\d+)"><FacturaDetalle /></Private>
        <Private exact path="/facturacion"><Facturacion /></Private>

        <Private exact path="/carga-tecnicos"><CargaTecnicos /></Private>

        <Private exact path="/usuarios/nuevo"><UsuarioForm /></Private>
        <Private exact path="/usuarios/:id(\d+)/editar"><UsuarioForm /></Private>
        <Private exact path="/usuarios"><Usuarios /></Private>

        <Private exact path="/solicitudes-web"><SolicitudesCitaWeb /></Private>

        <Route exact path="/">
          <Redirect to={token ? "/dashboard" : "/login"} />
        </Route>
      </IonRouterOutlet>
    </IonSplitPane>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <IonApp>
      <IonReactRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </IonReactRouter>
    </IonApp>
  </ErrorBoundary>
);

export default App;