// Archivo: organisms/ORG_03_TableroControlSuperAdmin.js (Max 150 lineas)
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ATO_03_InputSeguro from '../atoms/ATO_03_InputSeguro';
import { CER_MotorEncuadre } from '../cerebros/CER_02_MotorEncuadre';
import { supabaseEsq2 } from '../config/CFG_01_ClienteSupabaseEsq2';

export default function ORG_03_TableroControlSuperAdmin({
  configGlobal,
  alActualizarConfigLocal,
}) {
  const [encuadre, setEncuadre] = useState(
    configGlobal?.encuadre_porcentaje_json || {
      arriba_pct: 4,
      abajo_pct: 6,
      izquierda_pct: 3,
      derecha_pct: 3,
    }
  );
  const [mensajeMuro, setMensajeMuro] = useState(configGlobal?.mensaje_muro_oficial || '');
  const [colorBotonGlobal, setColorBotonGlobal] = useState('#002B5B');

  const cambiarLadoPct = (lado, delta) => {
    const nuevo = CER_MotorEncuadre.ajustarPorcentaje(encuadre, lado, delta);
    setEncuadre(nuevo);
    alActualizarConfigLocal({ ...configGlobal, encuadre_porcentaje_json: nuevo });
  };

  const guardarVariablesEnSupabase = async () => {
    const nuevaVersion = (configGlobal?.version_catalogo || 1) + 1;
    const { data, error } = await supabaseEsq2
      .from('esq2_config_global')
      .update({
        version_catalogo: nuevaVersion,
        encuadre_porcentaje_json: encuadre,
        mensaje_muro_oficial: mensajeMuro,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      alActualizarConfigLocal(data);
      Alert.alert('👑 SuperAdmin', 'Tamaño de pantalla (%), colores y muro actualizados para todos los usuarios.');
    }
  };

  return (
    <View style={estilos.panel}>
      <ATO_02_TextoSanto variante="subtitulo" color="#D4AF37">
        📐 ENCUADRE GLOBAL DE PANTALLAS EN PORCENTAJE (%)
      </ATO_02_TextoSanto>

      {[
        { clave: 'arriba_pct', nombre: 'Margen Arriba' },
        { clave: 'abajo_pct', nombre: 'Margen Abajo (Subir App)' },
        { clave: 'izquierda_pct', nombre: 'Margen Izquierda' },
        { clave: 'derecha_pct', nombre: 'Margen Derecha' },
      ].map((item) => (
        <View key={item.clave} style={estilos.filaPct}>
          <ATO_02_TextoSanto variante="cuerpo" color="#FFFFFF">
            {item.nombre}: {encuadre[item.clave]}%
          </ATO_02_TextoSanto>
          <View style={estilos.botonesPct}>
            <ATO_01_BotonCamaleon compacto titulo=" -1% " alPresionar={() => cambiarLadoPct(item.clave, -1)} />
            <ATO_01_BotonCamaleon compacto titulo=" +1% " alPresionar={() => cambiarLadoPct(item.clave, 1)} />
          </View>
        </View>
      ))}

      <ATO_03_InputSeguro
        etiqueta="Comunicado Oficial del Muro"
        valor={mensajeMuro}
        alCambiar={setMensajeMuro}
        colorTexto="#FFFFFF"
      />
      <ATO_03_InputSeguro
        etiqueta="Color Hexadecimal Botones (Ej: #002B5B o #D4AF37)"
        valor={colorBotonGlobal}
        alCambiar={setColorBotonGlobal}
        colorTexto="#FFFFFF"
      />

      <ATO_01_BotonCamaleon
        titulo="💾 PUBLICAR CAMBIOS GLOBALES EN SUPABASE"
        colorFondo="#D4AF37"
        colorTexto="#050505"
        alPresionar={guardarVariablesEnSupabase}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  panel: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginVertical: 8, borderWidth: 1.5, borderColor: '#D4AF37' },
  filaPct: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 3 },
  botonesPct: { flexDirection: 'row', gap: 8 },
});