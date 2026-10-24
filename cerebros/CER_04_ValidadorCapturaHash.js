// Archivo: cerebros/CER_04_ValidadorCapturaHash.js (Max 75 lineas)
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';

let timestampSalidaRedSocial = 0;
let ultimaRedVisitada = '';

export const CER_ValidadorCapturaHash = {
  async abrirRedSocialYRegistrarSalida(urlDestino, tipoMision = 'RED_SOCIAL_VIDEO') {
    timestampSalidaRedSocial = Date.now();
    ultimaRedVisitada = tipoMision;
    const soportado = await Linking.canOpenURL(urlDestino);
    if (soportado) {
      await Linking.openURL(urlDestino);
      return { ok: true };
    }
    return { ok: false, mensaje: 'No se pudo abrir el enlace externo.' };
  },

  async validarCapturaYGenerarHash(assetImagen) {
    if (!timestampSalidaRedSocial || Date.now() - timestampSalidaRedSocial < 3000) {
      return {
        ok: false,
        mensaje: 'Primero debes entrar al enlace del video o WhatsApp, compartir/dar Me Gusta y luego subir tu captura.',
      };
    }

    const semillaUnica = `${assetImagen?.fileName || ''}-${assetImagen?.fileSize || 0}-${assetImagen?.width || 0}-${assetImagen?.uri || ''}`;
    const hashSha256 = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, semillaUnica);

    return {
      ok: true,
      hashCaptura: hashSha256,
      tipoMision: ultimaRedVisitada || 'RED_SOCIAL_VIDEO',
    };
  },
};