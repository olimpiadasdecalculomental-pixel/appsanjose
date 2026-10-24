// Archivo: estilos/EST_01_MargenesPorcentaje.js (Max 75 lineas)
import { Dimensions } from 'react-native';
import { CFG_CONSTANTES_DEFAULT } from '../config/CFG_02_ConstantesApp';

export const EST_MargenesPorcentaje = {
  calcularPaddingSeguro(encuadreJson = null) {
    const { width, height } = Dimensions.get('window');
    const cfg = encuadreJson || CFG_CONSTANTES_DEFAULT.ENCUADRE_PANTALLA_PCT;

    const arribaPct = Number(cfg.arriba_pct ?? 4);
    const abajoPct = Number(cfg.abajo_pct ?? 6);
    const izqPct = Number(cfg.izquierda_pct ?? 3);
    const derPct = Number(cfg.derecha_pct ?? 3);

    return {
      paddingTop: Math.round((height * arribaPct) / 100),
      paddingBottom: Math.round((height * abajoPct) / 100),
      paddingLeft: Math.round((width * izqPct) / 100),
      paddingRight: Math.round((width * derPct) / 100),
    };
  },
};