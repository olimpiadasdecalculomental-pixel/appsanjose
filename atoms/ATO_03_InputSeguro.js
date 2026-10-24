// Archivo: atoms/ATO_03_InputSeguro.js (Max 75 lineas)
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export default function ATO_03_InputSeguro({
  etiqueta,
  valor,
  alCambiar,
  placeholder = '',
  teclado = 'default',
  esSecreto = false,
  colorBorde = '#00A8E8',
  colorTexto = '#0F172A',
}) {
  return (
    <View style={estilos.contenedor}>
      {etiqueta ? <Text style={[estilos.label, { color: colorTexto }]}>{etiqueta}</Text> : null}
      <TextInput
        value={String(valor ?? '')}
        onChangeText={alCambiar}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={teclado}
        secureTextEntry={esSecreto}
        style={[estilos.input, { borderColor: colorBorde, color: colorTexto }]}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { marginVertical: 5, width: '100%' },
  label: { fontSize: 11, fontWeight: '700', marginBottom: 3 },
  input: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});