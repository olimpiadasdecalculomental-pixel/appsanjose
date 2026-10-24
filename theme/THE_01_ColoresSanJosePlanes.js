// Archivo: theme/THE_01_ColoresSanJosePlanes.js (Max 75 lineas)
import { CFG_CONSTANTES_DEFAULT } from '../config/CFG_02_ConstantesApp';

export const THE_ColoresSanJose = {
  obtenerTemaActivo(planUsuario = 'GRATIS', configGlobalSuperAdmin = null) {
    const mapaRemoto = configGlobalSuperAdmin?.tema_colores_json;
    const mapaBase = CFG_CONSTANTES_DEFAULT.TEMAS_SUSCRIPCION;

    if (mapaRemoto?.forzar_color_global && mapaRemoto?.GLOBAL) {
      return mapaRemoto.GLOBAL;
    }

    const clavePlan = (planUsuario || 'GRATIS').toUpperCase();
    if (mapaRemoto && mapaRemoto[clavePlan]) {
      return { ...mapaBase[clavePlan], ...mapaRemoto[clavePlan] };
    }

    return mapaBase[clavePlan] || mapaBase.GRATIS;
  },
};