// Archivo: modales/MOD_04_SubirCapturaMision.js (Max 120 lineas)
import React, { useState } from 'react';
import { Modal, View, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import { CER_ValidadorCapturaHash } from '../cerebros/CER_04_ValidadorCapturaHash';
import { SER_TransaccionBancariaRpc } from '../servicios/SER_02_TransaccionBancariaRpc';

export default function MOD_04_SubirCapturaMision({
  visible,
  alCerrar,
  idUsuario,
  alGanarCupon,
}) {
  const [procesando, setProcesando] = useState(false);

  const elegirCapturaYValidar = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      return Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para verificar la captura.');
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (resultado.canceled || !resultado.assets?.length) return;

    setProcesando(true);
    const verificacion = await CER_ValidadorCapturaHash.validarCapturaYGenerarHash(resultado.assets[0]);

    if (!verificacion.ok) {
      setProcesando(false);
      return Alert.alert('Atención', verificacion.mensaje);
    }

    const rpcRes = await SER_TransaccionBancariaRpc.validarMisionViral6Am(
      idUsuario,
      verificacion.tipoMision,
      verificacion.hashCaptura
    );
    setProcesando(false);

    if (rpcRes?.ok) {
      Alert.alert('🎉 ¡CUPÓN 06:00 AM ACTIVADO!', rpcRes.mensaje);
      alGanarCupon();
      alCerrar();
    } else {
      Alert.alert('Captura Rechazada', rpcRes?.mensaje || 'Intenta con una captura nueva.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={estilos.fondo}>
        <View style={estilos.caja}>
          <ATO_02_TextoSanto variante="titulo" color="#D4AF37" centrado>
            📸 VALIDAR CAPTURA PARA SORTEO 06:00 AM
          </ATO_02_TextoSanto>
          <ATO_02_TextoSanto variante="cuerpo" color="#E2E8F0" centrado>
            Sube la captura de pantalla de tu Me Gusta / Compartido en TikTok, YouTube o de los 5 amigos en WhatsApp.
          </ATO_02_TextoSanto>

          <ATO_01_BotonCamaleon
            titulo={procesando ? 'VERIFICANDO CAPTURA...' : '📂 SELECCIONAR CAPTURA DE MI GALERÍA'}
            colorFondo="#D4AF37"
            colorTexto="#050505"
            alPresionar={elegirCapturaYValidar}
          />
          <ATO_01_BotonCamaleon
            compacto
            titulo="CERRAR"
            colorFondo="#1E293B"
            colorTexto="#94A3B8"
            alPresionar={alCerrar}
          />
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 18 },
  caja: { backgroundColor: '#0A192F', borderRadius: 14, padding: 18, borderWidth: 1.5, borderColor: '#D4AF37' },
});