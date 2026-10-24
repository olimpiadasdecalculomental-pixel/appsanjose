// Archivo: cerebros/CER_03_DetectorCincoToques.js (Max 75 lineas)
import { CFG_CONSTANTES_DEFAULT } from '../config/CFG_02_ConstantesApp';

let contadorToques = 0;
let primerToqueTimestamp = 0;

export const CER_DetectorCincoToques = {
  registrarToque(alDesbloquearBoveda) {
    const ahora = Date.now();
    if (ahora - primerToqueTimestamp > CFG_CONSTANTES_DEFAULT.TIEMPO_MAX_TOQUES_MS) {
      contadorToques = 1;
      primerToqueTimestamp = ahora;
      return;
    }

    contadorToques += 1;
    if (contadorToques >= CFG_CONSTANTES_DEFAULT.TOQUES_SECRETOS_BOVEDA) {
      contadorToques = 0;
      primerToqueTimestamp = 0;
      if (typeof alDesbloquearBoveda === 'function') {
        alDesbloquearBoveda();
      }
    }
  },
};