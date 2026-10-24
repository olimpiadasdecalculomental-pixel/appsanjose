// Archivo: pantallas/PAN_05_PanelEntregadorTienda.js (Max 150 lineas)
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Linking } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ORG_02_EscanerCamaraQr from '../organisms/ORG_02_EscanerCamaraQr';
import { supabaseEsq2 } from '../config/CFG_01_ClienteSupabaseEsq2';
import { SER_TransaccionBancariaRpc } from '../servicios/SER_02_TransaccionBancariaRpc';

export default function PAN_05_PanelEntregadorTienda({ usuarioOperador }) {
  const [listaPremios, setListaPremios] = useState([]);

  const cargarListaUnicaEntregas = async () => {
    if (!usuarioOperador?.id_usuario) return;
    const { data } = await supabaseEsq2
      .from('esq2_billetera_premios')
      .select('*, esq2_usuarios!esq2_billetera_premios_id_usuario_dueno_fkey(nombres, apellidos, numero_cuenta, celular, cod_pais_cel, ciudad_depto, pais)')
      .order('fecha_ganado', { ascending: false })
      .limit(60);
    if (data) setListaPremios(data);
  };

  useEffect(() => {
    cargarListaUnicaEntregas();
  }, [usuarioOperador?.id_usuario]);

  const totalEntregados = listaPremios.filter((p) => p.estado === 'ENTREGADO_QUEMADO').length;
  const totalPendientes = listaPremios.filter((p) => p.estado === 'DISPONIBLE').length;

  const contactarGanadorWhatsApp = (item) => {
    const usr = item.esq2_usuarios;
    const fono = `${usr?.cod_pais_cel || '+591'}${usr?.celular || ''}`.replace(/\D/g, '');
    const texto = encodeURIComponent(
      `Hola ${usr?.nombres || 'Hincha'}, soy el Entregador Oficial de San José. Coordinemos la entrega/envío de tu premio: ${item.titulo_premio}.`
    );
    Linking.openURL(`https://wa.me/${fono}?text=${texto}`);
  };

  const marcarYaEntregadoManual = async (qrToken) => {
    await SER_TransaccionBancariaRpc.quemarQrPremio(
      usuarioOperador?.id_usuario,
      qrToken,
      'ENVIO_COORDINADO_WHATSAPP'
    );
    cargarListaUnicaEntregas();
  };

  return (
    <ScrollView style={estilos.scroll} showsVerticalScrollIndicator={false}>
      <View style={estilos.resumen}>
        <ATO_02_TextoSanto variante="titulo" color="#16A34A">
          🏪 PANEL DE ENTREGA DE PREMIOS ({usuarioOperador?.numero_cuenta})
        </ATO_02_TextoSanto>
        <ATO_02_TextoSanto variante="subtitulo" color="#FFFFFF">
          ✅ Ya Entregados: {totalEntregados}  |  ⏳ Pendientes por Recoger: {totalPendientes}
        </ATO_02_TextoSanto>
      </View>

      <ORG_02_EscanerCamaraQr
        idEntregador={usuarioOperador?.id_usuario}
        alQuemarQrExitoso={cargarListaUnicaEntregas}
      />

      <ATO_02_TextoSanto variante="subtitulo" color="#D4AF37">
        📋 LISTA ÚNICA DE PREMIADOS (LOCAL Y OTROS PAÍSES / DEPTOS)
      </ATO_02_TextoSanto>

      {listaPremios.map((item) => {
        const usr = item.esq2_usuarios;
        const quemado = item.estado === 'ENTREGADO_QUEMADO';
        return (
          <View key={item.id_premio_unico} style={[estilos.fila, { borderColor: quemado ? '#475569' : '#16A34A' }]}>
            <ATO_02_TextoSanto variante="subtitulo" color="#FFFFFF">
              🎁 {item.titulo_premio} — {quemado ? '✓ YA ENTREGADO' : '● PENDIENTE'}
            </ATO_02_TextoSanto>
            <ATO_02_TextoSanto variante="etiqueta" color="#CBD5E1">
              Ganador: {usr?.nombres} {usr?.apellidos} ({usr?.numero_cuenta}) • {usr?.ciudad_depto}, {usr?.pais}
            </ATO_02_TextoSanto>

            {!quemado ? (
              <View style={estilos.acciones}>
                <ATO_01_BotonCamaleon
                  compacto
                  titulo="💬 WHATSAPP GANADOR"
                  colorFondo="#0284C7"
                  alPresionar={() => contactarGanadorWhatsApp(item)}
                />
                <ATO_01_BotonCamaleon
                  compacto
                  titulo="✓ YA ENTREGADO"
                  colorFondo="#16A34A"
                  alPresionar={() => marcarYaEntregadoManual(item.qr_premio_token)}
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flex: 1 },
  resumen: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginVertical: 4 },
  fila: { backgroundColor: '#0F172A', padding: 10, borderRadius: 10, borderWidth: 1, marginVertical: 4 },
  acciones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, gap: 6 },
});