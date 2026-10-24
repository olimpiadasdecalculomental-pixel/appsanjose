// Archivo: atoms/ATO_02_TextoSanto.js (Max 75 lineas)
import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function ATO_02_TextoSanto({
  children,
  variante = 'cuerpo',
  color = '#0F172A',
  centrado = false,
}) {
  return (
    <Text
      style={[
        estilos[variante] || estilos.cuerpo,
        { color, textAlign: centrado ? 'center' : 'left' },
      ]}
    >
      {children}
    </Text>
  );
}

const estilos = StyleSheet.create({
  titulo: { fontSize: 19, fontWeight: '900', letterSpacing: 0.5, marginVertical: 3 },
  subtitulo: { fontSize: 14, fontWeight: '700', marginVertical: 2 },
  cuerpo: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  etiqueta: { fontSize: 11, fontWeight: '600', opacity: 0.85 },
});