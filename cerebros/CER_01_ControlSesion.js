// Archivo: cerebros/CER_01_ControlSesion.js (Max 75 lineas)
export const CER_ControlSesion = {
  esCuentaActiva(usuario) {
    return (usuario?.estado_cuenta || 'ACTIVO') === 'ACTIVO';
  },

  obtenerPermisosPorRol(usuario) {
    const rol = (usuario?.rol || 'HINCHA').toUpperCase();
    const activo = this.esCuentaActiva(usuario);

    return {
      rolActual: rol,
      bloqueado: !activo,
      puedeEscanearQrPremio: activo && ['ENTREGADOR', 'RECARGADOR', 'ADMIN', 'SUPERADMIN'].includes(rol),
      puedeRepartirStockMayorista: activo && ['RECARGADOR', 'SUPERADMIN'].includes(rol),
      puedeGestionarCatalogoYAltas: activo && ['ADMIN', 'SUPERADMIN'].includes(rol),
      esSuperAdminTotal: activo && rol === 'SUPERADMIN',
    };
  },
};