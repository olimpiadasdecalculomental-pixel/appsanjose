// Archivo: pantallas/PAN_03_BilleteraMisPremios.js (Max 150 lineas)
import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import MOL_01_TarjetaPremio from '../molecules/MOL_01_TarjetaPremio';
import MOD_02_MostrarQrGigante from '../modales/MOD_02_MostrarQrGigante';
import MOD_03_TransferirPremioP2P from '../modales/MOD_03_TransferirPremioP2P';
import { supabaseEsq2 } from '../config/CFG_01_ClienteSupabaseEsq2';
import { STO_CacheLocal } from '../storage/STO_01_CacheLocalMmkv';

export default function PAN_03_BilleteraMisPremios({
  usuario,
  billeteraInicial = [],
  tema,
}) {
  const [premios, setPremios] = useState(billeteraInicial);
  const [premioQrActivo, setPremioQrActivo] = useState(null);
  const [premioTransferir, setPremioTransferir] = useState(null);
  const [cargando, setCargando] = useState(false);

  const cargarMisPremiosDesdeSupabase = async () => {
    if (!usuario?.id_usuario) return;
    setCargando(true);
    const { data, error } = await supabaseEsq2
      .from('esq2_billetera_premios')
      .select('*')
      .eq('id_usuario_dueno', usuario.id_usuario)
      .order('fecha_ganado', { ascending: false });
    setCargando(false);

    if (!error && data) {
      setPremios(data);
      await STO_CacheLocal.guardarBilleteraOffline(data);
    }
  };

  useEffect(() => {
    cargarMisPremiosDesdeSupabase();
  }, [usuario?.id_usuario]);

  return (
    <ScrollView style={estilos.scroll} showsVerticalScrollIndicator={false}>
      <View style={estilos.cabecera}>
        <ATO_02_TextoSanto variante="titulo" color={tema.texto}>
          🎁 MIS PREMIOS Y QR DE RECLAMO
        </ATO_02_TextoSanto>
        <ATO_02_TextoSanto variante="etiqueta" color={tema.texto}>
          Presenta el QR en la dirección indicada o transfiérelo a otro hincha. Al ser escaneado se elimina como YA ENTREGADO.
        </ATO_02_TextoSanto>
        <ATO_01_BotonCamaleon
          compacto
          titulo={cargando ? 'SINCRONIZANDO...' : '🔄 ACTUALIZAR BILLETERA DE PREMIOS'}
          colorFondo={tema.boton}
          alPresionar={cargarMisPremiosDesdeSupabase}
        />
      </View>

      {premios.length === 0 ? (
        <View style={estilos.vacio}>
          <ATO_02_TextoSanto variante="subtitulo" color={tema.acento} centrado>
            Aún no tienes premios en tu billetera.
          </ATO_02_TextoSanto>
          <ATO_02_TextoSanto variante="cuerpo" color={tema.texto} centrado>
            Participa todos los días a las 06:00 AM compartiendo nuestros videos o con tu membresía de socio.
          </ATO_02_TextoSanto>
        </View>
      ) : (
        premios.map((item) => (
          <MOL_01_TarjetaPremio
            key={item.id_premio_unico}
            premio={item}
            tema={tema}
            alVerQr={(p) => setPremioQrActivo(p)}
            alTransferir={(p) => setPremioTransferir(p)}
          />
        ))
      )}

      <MOD_02_MostrarQrGigante
        visible={Boolean(premioQrActivo)}
        alCerrar={() => setPremioQrActivo(null)}
        titulo={premioQrActivo?.titulo_premio}
        valorQr={premioQrActivo?.qr_premio_token}
        direccionReclamo={premioQrActivo?.direccion_reclamo}
        whatsappEntregador={premioQrActivo?.whatsapp_entregador}
        esPremio
      />

      <MOD_03_TransferirPremioP2P
        visible={Boolean(premioTransferir)}
        alCerrar={() => setPremioTransferir(null)}
        premioSeleccionado={premioTransferir}
        idUsuarioActual={usuario?.id_usuario}
        alCompletarTransferencia={cargarMisPremiosDesdeSupabase}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flex: 1 },
  cabecera: { marginVertical: 6 },
  vacio: { padding: 24, borderRadius: 12, borderWidth: 1, borderColor: '#334155', marginVertical: 14 },
});