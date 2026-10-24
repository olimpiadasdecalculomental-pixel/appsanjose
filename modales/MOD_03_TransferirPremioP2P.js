// Archivo: modales/MOD_03_TransferirPremioP2P.js (Max 120 lineas)
import React, { useState } from 'react';
import { Modal, View, StyleSheet, Alert } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ATO_03_InputSeguro from '../atoms/ATO_03_InputSeguro';
import { SER_TransaccionBancariaRpc } from '../servicios/SER_02_TransaccionBancariaRpc';

export default function MOD_03_TransferirPremioP2P({
  visible,
  alCerrar,
  premioSeleccionado,
  idUsuarioActual,
  alCompletarTransferencia,
}) {
  const [destino, setDestino] = useState('');
  const [enviando, setEnviando] = useState(false);

  const ejecutarTransferencia = async () => {
    if (!destino.trim()) {
      return Alert.alert('Transferir Premio', 'Ingresa el Nº de Cuenta (SJ-...), CI o Celular del hincha receptor.');
    }
    setEnviando(true);
    const res = await SER_TransaccionBancariaRpc.transferirPremioP2P(
      idUsuarioActual,
      premioSeleccionado?.id_premio_unico,
      destino
    );
    setEnviando(false);

    if (res?.ok) {
      Alert.alert('¡Transferencia Exitosa!', res.mensaje);
      setDestino('');
      alCompletarTransferencia();
      alCerrar();
    } else {
      Alert.alert('No se pudo transferir', res?.mensaje || 'Verifica los datos del destinatario.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={estilos.fondo}>
        <View style={estilos.caja}>
          <ATO_02_TextoSanto variante="titulo" color="#FFFFFF" centrado>
            🔄 TRANSFERIR PREMIO A OTRO HINCHA
          </ATO_02_TextoSanto>
          <ATO_02_TextoSanto variante="subtitulo" color="#38BDF8" centrado>
            {premioSeleccionado?.titulo_premio}
          </ATO_02_TextoSanto>

          <ATO_03_InputSeguro
            etiqueta="Nº de Cuenta (SJ-...), CI o Celular del Amigo"
            valor={destino}
            alCambiar={setDestino}
            placeholder="Ej: SJ-00010002 o 72400000"
            colorTexto="#FFFFFF"
          />

          <ATO_01_BotonCamaleon
            titulo={enviando ? 'PROCESANDO TRANSACCIÓN...' : 'CONFIRMAR TRANSFERENCIA BANCARIA'}
            colorFondo="#0284C7"
            colorTexto="#FFFFFF"
            alPresionar={ejecutarTransferencia}
          />
          <ATO_01_BotonCamaleon
            compacto
            titulo="CANCELAR"
            colorFondo="#1E293B"
            colorTexto="#CBD5E1"
            alPresionar={alCerrar}
          />
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 18 },
  caja: { backgroundColor: '#0F172A', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: '#38BDF8' },
});