// Archivo: legos/LEG_01_MarcoSeguroGlobal.js (Max 75 lineas)
import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { EST_MargenesPorcentaje } from '../estilos/EST_01_MargenesPorcentaje';
import { THE_ColoresSanJose } from '../theme/THE_01_ColoresSanJosePlanes';

export default function LEG_01_MarcoSeguroGlobal({
  usuario,
  configGlobal,
  children,
}) {
  const tema = THE_ColoresSanJose.obtenerTemaActivo(usuario?.plan_actual, configGlobal);
  const paddingDinamico = EST_MargenesPorcentaje.calcularPaddingSeguro(
    configGlobal?.encuadre_porcentaje_json
  );

  return (
    <View
      style={[
        estilos.marcoTotal,
        { backgroundColor: tema.fondo },
        paddingDinamico,
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={tema.primario} />
      <View style={estilos.lienzoInterno}>{children}</View>
    </View>
  );
}

const estilos = StyleSheet.create({
  marcoTotal: { flex: 1, width: '100%', height: '100%' },
  lienzoInterno: { flex: 1, width: '100%' },
});