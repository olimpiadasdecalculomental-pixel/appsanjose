// Archivo: molecules/MOL_01_TarjetaPremio.js (Max 100 lineas)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';

export default function MOL_01_TarjetaPremio({
  premio,
  alVerQr,
  alTransferir,
  tema,
}) {
  const disponible = premio?.estado === 'DISPONIBLE';

  return (
    <View style={[estilos.card, { borderColor: disponible ? tema.acento : '#64748B' }]}>
      <View style={estilos.filaSup}>
        <ATO_02_TextoSanto variante="subtitulo" color={tema.texto}>
          🎁 {premio?.titulo_premio} ({premio?.categoria_premio})
        </ATO_02_TextoSanto>
        <ATO_02_TextoSanto
          variante="etiqueta"
          color={disponible ? '#16A34A' : '#EF4444'}
        >
          {disponible ? '● DISPONIBLE' : '✓ YA ENTREGADO'}
        </ATO_02_TextoSanto>
      </View>

      <ATO_02_TextoSanto variante="etiqueta" color={tema.texto}>
        📍 Reclamar en: {premio?.direccion_reclamo}
      </ATO_02_TextoSanto>

      {disponible ? (
        <View style={estilos.botones}>
          <View style={estilos.mitad}>
            <ATO_01_BotonCamaleon
              compacto
              titulo="📲 VER QR RECLAMO"
              colorFondo={tema.boton}
              colorTexto="#FFFFFF"
              alPresionar={() => alVerQr(premio)}
            />
          </View>
          <View style={estilos.mitad}>
            <ATO_01_BotonCamaleon
              compacto
              titulo="🔄 TRANSFERIR"
              colorFondo="#0F172A"
              colorTexto="#38BDF8"
              bordeColor="#38BDF8"
              alPresionar={() => alTransferir(premio)}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  card: { borderWidth: 1.5, borderRadius: 12, padding: 12, marginVertical: 6, backgroundColor: 'rgba(255,255,255,0.05)' },
  filaSup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  botones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  mitad: { flex: 1 },
});