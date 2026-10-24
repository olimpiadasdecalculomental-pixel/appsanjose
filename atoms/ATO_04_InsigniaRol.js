// Archivo: atoms/ATO_04_InsigniaRol.js (Max 75 lineas)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const COLORES_ROL = {
  HINCHA: { bg: '#0284C7', txt: '#FFFFFF' },
  ENTREGADOR: { bg: '#16A34A', txt: '#FFFFFF' },
  RECARGADOR: { bg: '#9333EA', txt: '#FFFFFF' },
  ADMIN: { bg: '#EA580C', txt: '#FFFFFF' },
  SUPERADMIN: { bg: '#D4AF37', txt: '#050505' },
};

export default function ATO_04_InsigniaRol({ rol = 'HINCHA', plan = 'GRATIS' }) {
  const estiloRol = COLORES_ROL[rol] || COLORES_ROL.HINCHA;
  return (
    <View style={[estilos.badge, { backgroundColor: estiloRol.bg }]}>
      <Text style={[estilos.texto, { color: estiloRol.txt }]}>
        {rol} • {plan}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  texto: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
});