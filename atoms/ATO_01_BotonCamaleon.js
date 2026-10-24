// Archivo: atoms/ATO_01_BotonCamaleon.js (Max 75 lineas)
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function ATO_01_BotonCamaleon({
  titulo,
  alPresionar,
  colorFondo = '#002B5B',
  colorTexto = '#FFFFFF',
  bordeColor = '#00A8E8',
  compacto = false,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={alPresionar}
      style={[
         estilos.boton,
        {
          backgroundColor: colorFondo,
          borderColor: bordeColor,
          paddingVertical: compacto ? 8 : 12,
        },
      ]}
    >
      <Text style={[estilos.texto, { color: colorTexto, fontSize: compacto ? 12 : 14 }]}>
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  boton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  texto: { fontWeight: 'bold', letterSpacing: 0.4, textAlign: 'center' },
});