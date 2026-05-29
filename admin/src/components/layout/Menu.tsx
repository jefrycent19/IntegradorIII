import {
  IonContent, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonMenu, IonMenuToggle, IonTitle, IonToolbar, IonFooter,
  IonButton, IonAvatar, IonText,
} from '@ionic/react';
import {
  homeOutline, peopleOutline, bicycleOutline, calendarOutline,
  clipboardOutline, cubeOutline, receiptOutline, personOutline,
  logOutOutline, constructOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  title: string;
  path: string;
  icon: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard',         path: '/dashboard',        icon: homeOutline },
  { title: 'Clientes',          path: '/clientes',         icon: peopleOutline },
  { title: 'Motocicletas',      path: '/motocicletas',     icon: bicycleOutline },
  { title: 'Citas',             path: '/citas',            icon: calendarOutline },
  { title: 'Órdenes de Trabajo',path: '/ordenes-trabajo',  icon: clipboardOutline },
  { title: 'Inventario',        path: '/inventario',       icon: cubeOutline },
  { title: 'Facturación',  path: '/facturacion', icon: receiptOutline, roles: ['Administrador', 'Gerente'] },
  { title: 'Usuarios',    path: '/usuarios',    icon: personOutline,  roles: ['Administrador'] },
];

const Menu: React.FC = () => {
  const { user, logout, tieneRol } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    await logout();
    history.replace('/login');
  };

  const itemsVisibles = menuItems.filter(
    (item) => !item.roles || tieneRol(...item.roles)
  );

  return (
    <IonMenu contentId="main-content" type="overlay">
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>
            <IonIcon icon={constructOutline} /> Taller Motos
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div className="ion-padding ion-text-center">
          <IonAvatar style={{ margin: '0 auto', width: 64, height: 64, background: 'var(--ion-color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
            <IonIcon icon={personOutline} style={{ fontSize: 32, color: 'white' }} />
          </IonAvatar>
          <IonText>
            <h3 style={{ margin: '8px 0 2px' }}>{user?.nombre} {user?.apellido}</h3>
            <p style={{ margin: 0, color: 'var(--ion-color-medium)', fontSize: '0.85rem' }}>{user?.rol}</p>
          </IonText>
        </div>

        <IonList lines="none">
          {itemsVisibles.map((item) => (
            <IonMenuToggle key={item.path} autoHide={false}>
              <IonItem
                button
                routerLink={item.path}
                routerDirection="root"
                detail={false}
              >
                <IonIcon icon={item.icon} slot="start" />
                <IonLabel>{item.title}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
        </IonList>
      </IonContent>

      <IonFooter>
        <IonButton expand="block" fill="clear" color="danger" onClick={handleLogout}>
          <IonIcon icon={logOutOutline} slot="start" />
          Cerrar sesión
        </IonButton>
      </IonFooter>
    </IonMenu>
  );
};

export default Menu;