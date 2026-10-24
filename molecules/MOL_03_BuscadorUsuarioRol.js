// Archivo: molecules/MOL_03_BuscadorUsuarioRol.js (Max 100 lineas)
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ATO_03_InputSeguro from '../atoms/ATO_03_InputSeguro';
import { SER_TransaccionBancariaRpc } from '../servicios/SER_02_TransaccionBancariaRpc';

const ROLES = ['HINCHA', 'ENTREGADOR', 'RECARGADOR', 'ADMIN', 'SUPERADMIN'];

export default function MOL_03_BuscadorUsuarioRol({ idAdminEjecutor }) {
  const [busqueda, setBusqueda] = useState('');
  const [rolElegido, setRolElegido] = useState('ENTREGADOR');
  const [usrBoveda, setUsrBoveda] = useState('');
  const [pinBoveda, setPinBoveda] = useState('');

  const aplicarCambioRol = async (nuevoEstado = 'ACTIVO') => {
    if (!busqueda.trim()) {
      return Alert.alert('Buscador', 'Ingresa el Nº de Cuenta (SJ-...), CI o Celular.');
    }
    const res = await SER_TransaccionBancariaRpc.aprobarRolYEstado(
      idAdminEjecutor,
      busqueda,
      rolElegido,
      nuevoEstado,
      usrBoveda,
      pinBoveda
    );
    Alert.alert(res?.ok ? 'Rol Actualizado' : 'Error', res?.mensaje || '');
  };

  return (
    <View style={estilos.caja}>
      <ATO_02_TextoSanto variante="subtitulo" color="#D4AF37">
        👮 APROBAR ROL (ENTREGADOR / RECARGADOR / ADMIN) O DAR DE BAJA
      </ATO_02_TextoSanto>
      <ATO_03_InputSeguro
        etiqueta="Buscar por Nº Cuenta (SJ-...), CI o Celular"
        valor={busqueda}
        alCambiar={setBusqueda}
        placeholder="Ej: SJ-00010001 o CI"
        colorTexto="#FFFFFF"
      />

      <View style={estilos.filaRoles}>
        {ROLES.map((r) => (
          <ATO_01_BotonCamaleon
            key={r}
            compacto
            titulo={r}
            colorFondo={rolElegido === r ? '#D4AF37' : '#1E293B'}
            colorTexto={rolElegido === r ? '#050505' : '#FFFFFF'}
            alPresionar={() => setRolElegido(r)}
          />
        ))}
      </View>

      <ATO_03_InputSeguro
        etiqueta="Asignar Usuario Secreto (5 Toques)"
        valor={usrBoveda}
        alCambiar={setUsrBoveda}
        placeholder="Ej: tienda_bolivar1"
        colorTexto="#FFFFFF"
      />
      <ATO_03_InputSeguro
        etiqueta="Asignar Contraseña / PIN Secreto"
        valor={pinBoveda}
        alCambiar={setPinBoveda}
        placeholder="Ej: 123456"
        colorTexto="#FFFFFF"
      />

      <View style={estilos.filaAccion}>
        <ATO_01_BotonCamaleon
          compacto
          titulo="✅ DAR DE ALTA / APROBAR ROL"
          colorFondo="#16A34A"
          alPresionar={() => aplicarCambioRol('ACTIVO')}
        />
        <ATO_01_BotonCamaleon
          compacto
          titulo="🚫 DAR DE BAJA (SUSPENDER)"
          colorFondo="#DC2626"
          alPresionar={() => aplicarCambioRol('SUSPENDIDO')}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginVertical: 8, borderWidth: 1, borderColor: '#334155' },
  filaRoles: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  filaAccion: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 6 },
});