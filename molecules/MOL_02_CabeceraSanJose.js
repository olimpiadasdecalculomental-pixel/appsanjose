// Archivo: molecules/MOL_02_CabeceraSanJose.js (Max 100 lineas)
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ATO_04_InsigniaRol from '../atoms/ATO_04_InsigniaRol';
import { CER_DetectorCincoToques } from '../cerebros/CER_03_DetectorCincoToques';

export default function MOL_02_CabeceraSanJose({
  usuario,
  tema,
  alActivarBoveda5Toques,
}) {
  return (
    <View style={[estilos.header, { backgroundColor: tema.primario, borderBottomColor: tema.acento }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => CER_DetectorCincoToques.registrarToque(alActivarBoveda5Toques)}
        style={estilos.zonaLogo5Toques}
      >
        <View style={[estilos.escudoV, { borderColor: tema.acento }]}>
          <ATO_02_TextoSanto variante="subtitulo" color="#FFFFFF" centrado>
            V
          </ATO_02_TextoSanto>
        </View>
        <View>
          <ATO_02_TextoSanto variante="subtitulo" color="#FFFFFF">
            CLUB SAN JOSÉ • ORURO
          </ATO_02_TextoSanto>
          <ATO_02_TextoSanto variante="etiqueta" color="#E2E8F0">
            Cuenta: {usuario?.numero_cuenta || 'SJ-INVITADO'}
          </ATO_02_TextoSanto>
        </View>
      </TouchableOpacity>

      <View style={estilos.derecha}>
        <ATO_04_InsigniaRol rol={usuario?.rol} plan={usuario?.plan_actual} />
        <ATO_02_TextoSanto variante="etiqueta" color="#D4AF37">
          🎟️ {usuario?.tickets_fidelidad_6am || 1} Cupones 6AM
        </ATO_02_TextoSanto>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 2, borderRadius: 10 },
  zonaLogo5Toques: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  escudoV: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#002B5B', borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  derecha: { alignItems: 'flex-end', gap: 3 },
});