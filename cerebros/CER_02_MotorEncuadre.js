// Archivo: cerebros/CER_02_MotorEncuadre.js (Max 75 lineas)
import { CFG_CONSTANTES_DEFAULT } from '../config/CFG_02_ConstantesApp';

export const CER_MotorEncuadre = {
  ajustarPorcentaje(encuadreActual, lado, delta) {
    const base = {
      ...CFG_CONSTANTES_DEFAULT.ENCUADRE_PANTALLA_PCT,
      ...(encuadreActual || {}),
    };
    const valorActual = Number(base[lado] ?? 4);
    const nuevoValor = Math.max(0, Math.min(25, valorActual + delta));
    return {
      ...base,
      [lado]: nuevoValor,
    };
  },
};