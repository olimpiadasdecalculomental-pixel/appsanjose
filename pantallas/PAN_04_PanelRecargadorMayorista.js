// Archivo: pantallas/PAN_04_PanelRecargadorMayorista.js (Max 150 lineas)
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ATO_03_InputSeguro from '../atoms/ATO_03_InputSeguro';
import { supabaseEsq2 } from '../config/CFG_01_ClienteSupabaseEsq2';
import { SER_TransaccionBancariaRpc } from '../servicios/SER_02_TransaccionBancariaRpc';

export default function PAN_04_PanelRecargadorMayorista({ usuarioOperador }) {
  const [inventario, setInventario] = useState([]);
  const [cuentaEntregador, setCuentaEntregador] = useState('');
  const [idCatalogoSel, setIdCatalogoSel] = useState('');
  const [cantidadReparto, setCantidadReparto] = useState('10');

  const cargarStockMayorista = async () => {
    if (!usuarioOperador?.id_usuario) return;
    const { data } = await supabaseEsq2
      .from('esq2_inventario_nodos')
      .select('*, esq2_catalogo_premios(titulo, categoria)')
      .eq('id_operador', usuarioOperador.id_usuario);
    if (data) setInventario(data);
  };

  useEffect(() => {
    cargarStockMayorista();
  }, [usuarioOperador?.id_usuario]);

  const transferirLoteAEntregador = async () => {
    if (!cuentaEntregador.trim() || !idCatalogoSel) {
      return Alert.alert('Recargador', 'Selecciona un premio de tu stock e ingresa la cuenta SJ-... del Entregador.');
    }
    const res = await SER_TransaccionBancariaRpc.repartirStockCadena(
      usuarioOperador.id_usuario,
      cuentaEntregador,
      idCatalogoSel,
      cantidadReparto
    );
    Alert.alert(res?.ok ? '✅ Lote Transferido' : 'Error', res?.mensaje || '');
    if (res?.ok) cargarStockMayorista();
  };

  return (
    <ScrollView style={estilos.scroll}>
      <View style={estilos.caja}>
        <ATO_02_TextoSanto variante="titulo" color="#D4AF37">
          📦 PANEL RECARGADOR MAYORISTA ({usuarioOperador?.numero_cuenta})
        </ATO_02_TextoSanto>
        <ATO_02_TextoSanto variante="etiqueta" color="#E2E8F0">
          Recibe lotes del SuperAdmin y repártelos a los Entregadores de tu zona.
        </ATO_02_TextoSanto>

        {inventario.map((inv) => (
          <View key={inv.id_inventario} style={estilos.itemStock}>
            <ATO_02_TextoSanto variante="subtitulo" color="#FFFFFF">
              {inv.esq2_catalogo_premios?.titulo} ({inv.esq2_catalogo_premios?.categoria})
            </ATO_02_TextoSanto>
            <ATO_02_TextoSanto variante="etiqueta" color="#38BDF8">
              Recibido: {inv.cantidad_recibida_total} | Repartido: {inv.cantidad_entregada_o_repartida} | Disponible: {inv.cantidad_disponible_actual}
            </ATO_02_TextoSanto>
            <ATO_01_BotonCamaleon
              compacto
              titulo={idCatalogoSel === inv.id_catalogo ? '✓ PREMIO SELECCIONADO' : 'SELECCIONAR PARA REPARTIR'}
              colorFondo={idCatalogoSel === inv.id_catalogo ? '#D4AF37' : '#1E293B'}
              colorTexto={idCatalogoSel === inv.id_catalogo ? '#050505' : '#FFFFFF'}
              alPresionar={() => setIdCatalogoSel(inv.id_catalogo)}
            />
          </View>
        ))}

        <ATO_03_InputSeguro
          etiqueta="Nº Cuenta del Entregador Destino (Ej: SJ-00010005)"
          valor={cuentaEntregador}
          alCambiar={setCuentaEntregador}
          colorTexto="#FFFFFF"
        />
        <ATO_03_InputSeguro
          etiqueta="Cantidad de Unidades a Entregar"
          valor={cantidadReparto}
          alCambiar={setCantidadReparto}
          teclado="numeric"
          colorTexto="#FFFFFF"
        />
        <ATO_01_BotonCamaleon
          titulo="🚚 ENVIAR STOCK AL ENTREGADOR"
          colorFondo="#9333EA"
          alPresionar={transferirLoteAEntregador}
        />
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flex: 1 },
  caja: { backgroundColor: '#0F172A', padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#9333EA' },
  itemStock: { padding: 10, borderRadius: 10, backgroundColor: '#1E293B', marginVertical: 5 },
});