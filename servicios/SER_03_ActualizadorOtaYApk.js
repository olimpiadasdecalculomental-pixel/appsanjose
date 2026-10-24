// Archivo: servicios/SER_03_ActualizadorOtaYApk.js (Max 75 lineas)
import * as Linking from 'expo-linking';
import { Share, Alert } from 'react-native';

export const SER_ActualizadorOtaYApk = {
  async buscarYAplicarOta(urlApkNueva) {
    if (urlApkNueva) {
      await Linking.openURL(urlApkNueva);
      return { actualizado: true };
    }
    Alert.alert('Actualizador San Jose', 'Ya tienes la version mas reciente instalada.');
    return { actualizado: false };
  },

  async descargarApkDirecta(urlApk) {
    if (urlApk) await Linking.openURL(urlApk);
  },

  async compartirApkCon5AmigosWhatsApp(urlApk, numeroCuenta) {
    const texto = '🔵⚪ ¡Unete a la App Oficial de la Hinchada de SAN JOSE! Entra gratis a los sorteos diarios de las 06:00 AM (Poleras, Comida, Recargas). Descarga la APK directa aqui: ' + urlApk + ' | Invitado por Socio: ' + numeroCuenta;
    await Share.share({ message: texto });
  },
};
