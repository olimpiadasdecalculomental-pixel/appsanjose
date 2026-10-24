// Archivo: organisms/ORG_02_EscanerCamaraQr.js (Max 150 lineas)
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ATO_03_InputSeguro from '../atoms/ATO_03_InputSeguro';
import { SER_TransaccionBancariaRpc } from '../servicios/SER_02_TransaccionBancariaRpc';

export default function ORG_02_EscanerCamaraQr({
  idEntregador,
  alQuemarQrExitoso,
}) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  const [camaraActiva, setCamaraActiva] = useState(false);
  const [bloqueoLectura, setBloqueoLectura] = useState(false);
  const [tokenManual, setTokenManual] = useState('');

  const procesarQuemaQr = async (tokenQr, modalidad = 'EN_TIENDA_QR') => {
    if (bloqueoLectura || !tokenQr) return;
    setBloqueoLectura(true);
    setCamaraActiva(false);

    const res = await SER_TransaccionBancariaRpc.quemarQrPremio(idEntregador, tokenQr.trim(), modalidad);
    Alert.alert(res?.ok ? '✅ PREMIO ENTREGADO Y QUEMADO' : '⚠️ ALERTA DE SEGURIDAD', res?.mensaje || '');
    if (res?.ok && alQuemarQrExitoso) alQuemarQrExitoso();
    setTokenManual('');
    setBloqueoLectura(false);
  };

  return (
    <View style={estilos.contenedor}>
      <ATO_02_TextoSanto variante="subtitulo" color="#D4AF37">
        📷 ESCÁNER QR BANCARIO (QUEMA INMEDIATA DE PREMIO)
      </ATO_02_TextoSanto>

      {camaraActiva ? (
        <View style={estilos.marcoCamara}>
          <CameraView
            style={estilos.camara}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => procesarQuemaQr(data, 'EN_TIENDA_QR')}
          />
          <ATO_01_BotonCamaleon
            compacto
            titulo="APAGAR CÁMARA"
            colorFondo="#DC2626"
            alPresionar={() => setCamaraActiva(false)}
          />
        </View>
      ) : (
        <ATO_01_BotonCamaleon
          titulo="📸 ABRIR CÁMARA Y ESCANEAR QR DEL HINCHA"
          colorFondo="#16A34A"
          alPresionar={async () => {
            if (!permiso?.granted) await pedirPermiso();
            setCamaraActiva(true);
          }}
        />
      )}

      <ATO_03_InputSeguro
        etiqueta="O pegar Código Token si es entrega coordinada por WhatsApp:"
        valor={tokenManual}
        alCambiar={setTokenManual}
        placeholder="Pegar token QR aquí..."
        colorTexto="#FFFFFF"
      />
      {tokenManual ? (
        <ATO_01_BotonCamaleon
          compacto
          titulo="✓ MARCAR COMO YA ENTREGADO (QUEMAR QR)"
          colorFondo="#D4AF37"
          colorTexto="#050505"
          alPresionar={() => procesarQuemaQr(tokenManual, 'ENVIO_COORDINADO_WHATSAPP')}
        />
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginVertical: 6, borderWidth: 1, borderColor: '#16A34A' },
  marcoCamara: { height: 240, borderRadius: 12, overflow: 'hidden', marginVertical: 8 },
  camara: { flex: 1 },
});