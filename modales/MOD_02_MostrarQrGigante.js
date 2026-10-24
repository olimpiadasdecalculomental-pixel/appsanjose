// Archivo: modales/MOD_02_MostrarQrGigante.js (Max 120 lineas)
import React from 'react';
import { Modal, View, StyleSheet, Linking } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';

export default function MOD_02_MostrarQrGigante({
  visible,
  alCerrar,
  titulo = 'CÓDIGO QR OFICIAL',
  valorQr = 'SJ-SIN-TOKEN',
  direccionReclamo = '',
  whatsappEntregador = '',
  esPremio = false,
}) {
  const coordinarEnvioWhatsApp = () => {
    const fono = (whatsappEntregador || '').replace(/\D/g, '');
    const msg = encodeURIComponent(
      `Hola, gané el premio "${titulo}" en la App San José (Código: ${valorQr}). Quiero coordinar la entrega/envío.`
    );
    Linking.openURL(`https://wa.me/${fono}?text=${msg}`);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={estilos.fondo}>
        <View style={estilos.tarjeta}>
          <ATO_02_TextoSanto variante="titulo" color="#002B5B" centrado>
            {titulo}
          </ATO_02_TextoSanto>

          <View style={estilos.marcoQr}>
            <QRCode value={valorQr || 'SJ'} size={210} backgroundColor="#FFFFFF" color="#002B5B" />
          </View>

          <ATO_02_TextoSanto variante="etiqueta" color="#334155" centrado>
            TOKEN: {valorQr}
          </ATO_02_TextoSanto>

          {esPremio ? (
            <View style={estilos.cajaDireccion}>
              <ATO_02_TextoSanto variante="subtitulo" color="#002B5B" centrado>
                📍 LUGAR DE RECOJO OFICIAL:
              </ATO_02_TextoSanto>
              <ATO_02_TextoSanto variante="cuerpo" color="#0F172A" centrado>
                {direccionReclamo || 'Calle Bolívar, Punto Autorizado Oruro'}
              </ATO_02_TextoSanto>
              <ATO_02_TextoSanto variante="etiqueta" color="#64748B" centrado>
                *Al escanear este QR en tienda, se eliminará automáticamente como YA ENTREGADO. Si estás en otra ciudad/país, el costo de envío se coordina directamente por WhatsApp entre el entregador y el premiado.
              </ATO_02_TextoSanto>

              {whatsappEntregador ? (
                <ATO_01_BotonCamaleon
                  compacto
                  colorFondo="#16A34A"
                  colorTexto="#FFFFFF"
                  titulo="💬 COORDINAR ENVÍO POR WHATSAPP (OTRO DEPTO/PAÍS)"
                  alPresionar={coordinarEnvioWhatsApp}
                />
              ) : null}
            </View>
          ) : null}

          <ATO_01_BotonCamaleon
            titulo="CERRAR QR"
            colorFondo="#002B5B"
            colorTexto="#FFFFFF"
            alPresionar={alCerrar}
          />
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', justifyContent: 'center', padding: 16 },
  tarjeta: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center' },
  marcoQr: { padding: 14, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 3, borderColor: '#002B5B', marginVertical: 10 },
  cajaDireccion: { width: '100%', backgroundColor: '#F1F5F9', padding: 10, borderRadius: 10, marginVertical: 8 },
});