// Archivo: legos/LEG_02_EscudoCristalVideo.js (Max 75 lineas)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';

export default function LEG_02_EscudoCristalVideo({
  tituloVideo,
  origenRed = 'TIKTOK',
  ticketsRecompensa = 1,
  alIrACompartirYCapturar,
  children,
}) {
  return (
    <View style={estilos.cajaVideo}>
      <View style={estilos.areaReproductor}>
        {children}
        {/* Cristales superiores e inferiores que bloquean fugas accidentales */}
        <View style={estilos.cristalSuperior} pointerEvents="auto">
          <Text style={estilos.textoCristal}>🛡️ {origenRed} OFICIAL SAN JOSÉ • {tituloVideo}</Text>
        </View>
        <View style={estilos.cristalEsquinaDerecha} pointerEvents="auto" />
      </View>

      <View style={estilos.barraMision}>
        <ATO_01_BotonCamaleon
          compacto
          colorFondo="#D4AF37"
          colorTexto="#050505"
          bordeColor="#FFFBEB"
          titulo={`🔥 IR A ${origenRed}, DAR LIKE/COMPARTIR Y SUBIR CAPTURA (+${ticketsRecompensa} CUPÓN 6AM)`}
          alPresionar={alIrACompartirYCapturar}
        />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cajaVideo: { borderRadius: 12, overflow: 'hidden', marginVertical: 8, backgroundColor: '#0F172A', borderWidth: 1, borderColor: '#00A8E8' },
  areaReproductor: { height: 215, width: '100%', position: 'relative' },
  cristalSuperior: { position: 'absolute', top: 0, left: 0, right: 0, height: 38, backgroundColor: 'rgba(0, 43, 91, 0.82)', justifyContent: 'center', paddingHorizontal: 10 },
  cristalEsquinaDerecha: { position: 'absolute', bottom: 0, right: 0, width: 95, height: 42, backgroundColor: 'rgba(0, 43, 91, 0.35)' },
  textoCristal: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  barraMision: { padding: 8, backgroundColor: '#001D3D' },
});