// Archivo: pantallas/PAN_06_PanelSuperAdminTotal.js (Max 150 lineas)
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ATO_03_InputSeguro from '../atoms/ATO_03_InputSeguro';
import ORG_03_TableroControlSuperAdmin from '../organisms/ORG_03_TableroControlSuperAdmin';
import MOL_03_BuscadorUsuarioRol from '../molecules/MOL_03_BuscadorUsuarioRol';
import { supabaseEsq2 } from '../config/CFG_01_ClienteSupabaseEsq2';
import { SER_ActualizadorOtaYApk } from '../servicios/SER_03_ActualizadorOtaYApk';

export default function PAN_06_PanelSuperAdminTotal({
  usuarioOperador,
  configGlobal,
  alActualizarConfigLocal,
}) {
  const [metricasCiudades, setMetricasCiudades] = useState([]);
  const [tituloPremio, setTituloPremio] = useState('');
  const [categoriaPremio, setCategoriaPremio] = useState('POLERA');
  const [stockPremio, setStockPremio] = useState('100');
  const [direccionRecojo, setDireccionRecojo] = useState('Calle Bolívar #373, Oruro');
  const [whatsappTienda, setWhatsappTienda] = useState('+59170000000');
  const [cantGanadores6Am, setCantGanadores6Am] = useState('5');
  const [fechaSorteo6Am, setFechaSorteo6Am] = useState('2026-10-24');

  const cargarMetricas1FilaPorCiudad = async () => {
    const { data } = await supabaseEsq2
      .from('esq2_metricas_ciudades')
      .select('*')
      .order('total_entradas_hoy', { ascending: false });
    if (data) setMetricasCiudades(data);
  };

  useEffect(() => {
    cargarMetricas1FilaPorCiudad();
  }, []);

  const crearPremioYProgramar6Am = async () => {
    if (!tituloPremio.trim()) {
      return Alert.alert('SuperAdmin', 'Ingresa el nombre del premio (Ej: Polera Oficial, Pollo, Recarga).');
    }
    const { data: cat, error } = await supabaseEsq2
      .from('esq2_catalogo_premios')
      .insert({
        titulo: tituloPremio.trim(),
        categoria: categoriaPremio,
        stock_inicial: Number(stockPremio),
        stock_disponible_central: Number(stockPremio),
        direccion_recojo: direccionRecojo,
        whatsapp_coordinacion: whatsappTienda,
        creado_por: usuarioOperador?.id_usuario,
      })
      .select()
      .single();

    if (error) return Alert.alert('Error', error.message);

    await supabaseEsq2.from('esq2_programacion_6am').insert({
      fecha_objetivo: fechaSorteo6Am,
      id_catalogo: cat.id_catalogo,
      cantidad_ganadores_max: Number(cantGanadores6Am),
    });

    Alert.alert('👑 Premio y Sorteo 06:00 AM Creado', `Se registró "${cat.titulo}" con ${cantGanadores6Am} ganadores programados.`);
    setTituloPremio('');
  };

  return (
    <ScrollView style={estilos.scroll} showsVerticalScrollIndicator={false}>
      <ATO_02_TextoSanto variante="titulo" color="#D4AF37">
        👑 GOBIERNO TOTAL SUPERADMIN • ESQUEMA 2
      </ATO_02_TextoSanto>

      {/* 1. Métricas en Vivo: 1 Sola Fila por Ciudad/Departamento */}
      <View style={estilos.caja}>
        <ATO_02_TextoSanto variante="subtitulo" color="#38BDF8">
          📊 MONITOR EN VIVO (1 SOLA FILA POR CIUDAD / PROMEDIOS DIARIOS)
        </ATO_02_TextoSanto>
        {metricasCiudades.map((m) => (
          <ATO_02_TextoSanto key={m.ciudad_depto} variante="etiqueta" color="#FFFFFF">
            📍 {m.ciudad_depto}: Hoy {m.usuarios_unicos_hoy} hinchas | {m.total_entradas_hoy} vistas (Prom: {m.promedio_entradas_por_usuario}x) | WhatsApp: {m.total_compartidos_whatsapp}
          </ATO_02_TextoSanto>
        ))}
        <ATO_01_BotonCamaleon compacto titulo="🔄 REFRESCAR CONECTADOS POR CIUDAD" alPresionar={cargarMetricas1FilaPorCiudad} />
      </View>

      {/* 2. Control de Tamaño de Pantalla (%) y Colores */}
      <ORG_03_TableroControlSuperAdmin
        configGlobal={configGlobal}
        alActualizarConfigLocal={alActualizarConfigLocal}
      />

      {/* 3. Aprobación de Roles (Entregador, Recargador, Admin) y Bajas */}
      <MOL_03_BuscadorUsuarioRol idAdminEjecutor={usuarioOperador?.id_usuario} />

      {/* 4. Crear Premios y Programar Sorteo 06:00 AM por Fecha y Cantidad */}
      <View style={estilos.caja}>
        <ATO_02_TextoSanto variante="subtitulo" color="#D4AF37">
          🎁 CREAR PREMIO + PROGRAMAR GANADORES 06:00 AM
        </ATO_02_TextoSanto>
        <ATO_03_InputSeguro etiqueta="Nombre del Premio (Comida, Polera, Recarga)" valor={tituloPremio} alCambiar={setTituloPremio} colorTexto="#FFFFFF" />
        <ATO_03_InputSeguro etiqueta="Categoría (COMIDA, POLERA, RECARGA, OTRO)" valor={categoriaPremio} alCambiar={setCategoriaPremio} colorTexto="#FFFFFF" />
        <ATO_03_InputSeguro etiqueta="Stock Total Unidades" valor={stockPremio} alCambiar={setStockPremio} teclado="numeric" colorTexto="#FFFFFF" />
        <ATO_03_InputSeguro etiqueta="Dirección Exacta de Recojo para el QR" valor={direccionRecojo} alCambiar={setDireccionRecojo} colorTexto="#FFFFFF" />
        <ATO_03_InputSeguro etiqueta="WhatsApp del Entregador" valor={whatsappTienda} alCambiar={setWhatsappTienda} colorTexto="#FFFFFF" />
        <ATO_03_InputSeguro etiqueta="¿Cuántos Ganarán a las 06:00 AM?" valor={cantGanadores6Am} alCambiar={setCantGanadores6Am} teclado="numeric" colorTexto="#FFFFFF" />
        <ATO_03_InputSeguro etiqueta="Fecha Programada (AAAA-MM-DD)" valor={fechaSorteo6Am} alCambiar={setFechaSorteo6Am} colorTexto="#FFFFFF" />
        <ATO_01_BotonCamaleon
          titulo="🚀 CREAR PREMIO Y PROGRAMAR 06:00 AM"
          colorFondo="#16A34A"
          alPresionar={crearPremioYProgramar6Am}
        />
        <ATO_01_BotonCamaleon
          compacto
          titulo="⚡ BUSCAR ACTUALIZACIÓN OTA"
          colorFondo="#0284C7"
          alPresionar={() => SER_ActualizadorOtaYApk.buscarYAplicarOta()}
        />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flex: 1 },
  caja: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginVertical: 6, borderWidth: 1, borderColor: '#38BDF8' },
});