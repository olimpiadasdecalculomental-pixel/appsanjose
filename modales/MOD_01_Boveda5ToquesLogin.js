// Archivo: modales/MOD_01_Boveda5ToquesLogin.js (Max 120 lineas)
import React, { useState } from 'react';
import { Modal, View, StyleSheet, Alert } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ATO_03_InputSeguro from '../atoms/ATO_03_InputSeguro';
import { supabaseEsq2 } from '../config/CFG_01_ClienteSupabaseEsq2';

export default function MOD_01_Boveda5ToquesLogin({
  visible,
  alCerrar,
  alAutenticarOperador,
}) {
  const [usuarioBoveda, setUsuarioBoveda] = useState('');
  const [pinBoveda, setPinBoveda] = useState('');
  const [cargando, setCargando] = useState(false);

  const validarAccesoSecreto = async () => {
    if (!usuarioBoveda.trim() || !pinBoveda.trim()) {
      return Alert.alert('Bóveda San José', 'Ingresa tu usuario y contraseña de operador.');
    }
    setCargando(true);
    try {
      const { data, error } = await supabaseEsq2
        .from('esq2_usuarios')
        .select('*')
        .eq('usuario_boveda', usuarioBoveda.trim())
        .eq('estado_cuenta', 'ACTIVO')
        .single();

      if (error || !data) {
        Alert.alert('Acceso Denegado', 'Usuario no autorizado o cuenta suspendida.');
      } else {
        alAutenticarOperador(data);
        setUsuarioBoveda('');
        setPinBoveda('');
        alCerrar();
      }
    } catch (_e) {
      Alert.alert('Error de Red', 'Verifica tu conexión a internet.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={estilos.fondo}>
        <View style={estilos.caja}>
          <ATO_02_TextoSanto variante="titulo" color="#D4AF37" centrado>
            🔐 BÓVEDA SAN JOSÉ (5 TOQUES)
          </ATO_02_TextoSanto>
          <ATO_02_TextoSanto variante="etiqueta" color="#E2E8F0" centrado>
            Acceso exclusivo: Entregadores, Recargadores, Admin y SuperAdmin
          </ATO_02_TextoSanto>

          <ATO_03_InputSeguro
            etiqueta="Usuario o Nº Cuenta Autorizada"
            valor={usuarioBoveda}
            alCambiar={setUsuarioBoveda}
            placeholder="Ej: entregador_oruro1"
            colorTexto="#FFFFFF"
          />
          <ATO_03_InputSeguro
            etiqueta="Contraseña / PIN Secreto"
            valor={pinBoveda}
            alCambiar={setPinBoveda}
            placeholder="••••••••"
            esSecreto
            colorTexto="#FFFFFF"
          />

          <ATO_01_BotonCamaleon
            titulo={cargando ? 'VERIFICANDO...' : 'ENTRAR AL PANEL DE ENTREGA / CONTROL'}
            colorFondo="#D4AF37"
            colorTexto="#050505"
            alPresionar={validarAccesoSecreto}
          />
          <ATO_01_BotonCamaleon
            compacto
            titulo="CERRAR BÓVEDA"
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
  fondo: { flex: 1, backgroundColor: 'rgba(2,12,27,0.88)', justifyContent: 'center', padding: 18 },
  caja: { backgroundColor: '#0A192F', borderRadius: 14, padding: 18, borderWidth: 2, borderColor: '#D4AF37' },
});