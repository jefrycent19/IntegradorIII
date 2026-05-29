import { useAuth } from '../context/AuthContext';

/**
 * Puede crear/editar registros generales (OT, avances, repuestos en OT).
 * El Gerente y el Técnico tienen restricciones específicas.
 */
export const useCanEdit = () => {
  const { tieneRol } = useAuth();
  return tieneRol('Administrador', 'Jefe de Taller', 'Técnico', 'Recepcionista');
};

/**
 * Puede crear/editar CLIENTES y MOTOCICLETAS.
 * El Técnico NO puede — eso es trabajo de Recepcionista/Admin/Jefe.
 */
export const useCanEditClientes = () => {
  const { tieneRol } = useAuth();
  return tieneRol('Administrador', 'Jefe de Taller', 'Recepcionista');
};

/** Puede aprobar/rechazar diagnósticos y avanzar estados de OT */
export const useCanApprove = () => {
  const { tieneRol } = useAuth();
  return tieneRol('Administrador', 'Jefe de Taller');
};

/** Solo el Administrador puede gestionar usuarios y eliminar registros */
export const useIsAdmin = () => {
  const { tieneRol } = useAuth();
  return tieneRol('Administrador');
};

/**
 * Puede gestionar inventario (crear repuestos, ajustar stock).
 * La Recepcionista solo puede VER el inventario, no modificarlo.
 */
export const useCanEditInventario = () => {
  const { tieneRol } = useAuth();
  return tieneRol('Administrador', 'Jefe de Taller', 'Técnico');
};
