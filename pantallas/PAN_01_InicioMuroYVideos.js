// Archivo: pantallas/PAN_01_InicioMuroYVideos.js (Max 150 lineas)
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ORG_01_ReproductorMultired from '../organisms/ORG_01_ReproductorMultired';
import MOD_04_SubirCapturaMision from '../modales/MOD_04_SubirCapturaMision';
import { CER_ValidadorCapturaHash } from '../cerebros/CER_04_ValidadorCapturaHash';
import { SER_ActualizadorOtaYApk } from '../servicios/SER_03_ActualizadorOtaYApk';

const VIDEOS_BASE = [
  {
    id_video: 'vid-1',
    titulo: 'Hinchada Imperial de San José en Oruro',
    origen_red: 'TIKTOK',
    url_reproduccion_embed: 'https://www.tiktok.com/embed/v2/7200000000000000000',
    url_ir_a_red_social: 'https://www.tiktok.com',
    tickets_recompensa_6am: 1,
  },
  {
    id_video: 'vid-2',
    titulo: ' Canal Oficial Hetzner / YouTube San José',
    origen_red: 'YOUTUBE',
    url_reproduccion_embed: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    url_ir_a_red_social: 'https://www.youtube.com',
    tickets_recompensa_6am: 1,
  },
];

export default function PAN_01_InicioMuroYVideos({
  usuario,
  configGlobal,
  muro,
  tema,
  alRefrescarUsuario,
  irARegistroSocio,
}) {
  const [modalCapturaVisible, setModalCapturaVisible] = useState(false);
  const listaVideos = muro?.videos?.length ? muro.videos : VIDEOS_BASE;
  const listaGanadores = muro?.ganadores || [];

  const compartirWhatsApp5Amigos = async () => {
    await CER_ValidadorCapturaHash.abrirRedSocialYRegistrarSalida('https://wa.me/', 'WHATSAPP_5');
    await SER_ActualizadorOtaYApk.compartirApkCon5AmigosWhatsApp(
      configGlobal?.url_descarga_apk || 'https://sanjoseoruro.com/app.apk',
      usuario?.numero_cuenta
    );
    setModalCapturaVisible(true);
  };

  return (
    <ScrollView style={estilos.scroll} showsVerticalScrollIndicator={false}>
      {!usuario?.datos_completos ? (
        <View style={[estilos.bannerRegistro, { borderColor: tema.acento }]}>
          <ATO_02_TextoSanto variante="subtitulo" color="#D4AF37">
            ⚡ ENTRADA DIRECTA SIN LOGIN • GANA CUPONES 06:00 AM
          </ATO_02_TextoSanto>
          <ATO_02_TextoSanto variante="etiqueta" color="#FFFFFF">
            Completa tus datos de la hinchada para activar tu Carnet QR y reclamar premios.
          </ATO_02_TextoSanto>
          <ATO_01_BotonCamaleon
            compacto
            titulo="📝 COMPLETAR MIS DATOS Y RECIBIR TICKETS"
            colorFondo={tema.acento}
            colorTexto="#050505"
            alPresionar={irARegistroSocio}
          />
        </View>
      ) : null}

      <View style={[estilos.cajaMuro, { backgroundColor: tema.primario, borderColor: tema.acento }]}>
        <ATO_02_TextoSanto variante="subtitulo" color="#D4AF37">
          📢 COMUNICADO OFICIAL DEL CLUB SAN JOSÉ
        </ATO_02_TextoSanto>
        <ATO_02_TextoSanto variante="cuerpo" color="#FFFFFF">
          {configGlobal?.mensaje_muro_oficial}
        </ATO_02_TextoSanto>
        <ATO_01_BotonCamaleon
          titulo="📲 COMPARTIR APK A 5 AMIGOS EN WHATSAPP + SUBIR CAPTURA (SORTEO 6AM)"
          colorFondo="#16A34A"
          colorTexto="#FFFFFF"
          alPresionar={compartirWhatsApp5Amigos}
        />
      </View>

      <View style={estilos.seccionGanadores}>
        <ATO_02_TextoSanto variante="subtitulo" color={tema.texto}>
          🏆 RECONOCIMIENTOS A LA FIDELIDAD (HOY 06:00 AM)
        </ATO_02_TextoSanto>
        <ATO_02_TextoSanto variante="etiqueta" color={tema.texto}>
          Programa gratuito de fidelidad e interacción comunitaria del hincha.
        </ATO_02_TextoSanto>
        {listaGanadores.length === 0 ? (
          <ATO_02_TextoSanto variante="etiqueta" color={tema.acento}>
            • Próxima publicación de premiados: Mañana a las 06:00 AM en punto.
          </ATO_02_TextoSanto>
        ) : (
          listaGanadores.map((g, idx) => (
            <View key={idx} style={estilos.filaGanador}>
              <ATO_02_TextoSanto variante="etiqueta" color="#FFFFFF">
                🎁 {g.titulo_premio} — Socio: {g.numero_cuenta} ({g.ciudad_depto})
              </ATO_02_TextoSanto>
            </View>
          ))
        )}
      </View>

      <ATO_02_TextoSanto variante="titulo" color={tema.texto}>
        🎬 VIDEOS OFICIALES (CRISTAL ACTIVO + HETZNER / REDES)
      </ATO_02_TextoSanto>
      {listaVideos.map((vid) => (
        <ORG_01_ReproductorMultired
          key={vid.id_video}
          video={vid}
          alAbrirModalCaptura={() => setModalCapturaVisible(true)}
        />
      ))}

      <MOD_04_SubirCapturaMision
        visible={modalCapturaVisible}
        alCerrar={() => setModalCapturaVisible(false)}
        idUsuario={usuario?.id_usuario}
        alGanarCupon={alRefrescarUsuario}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flex: 1 },
  bannerRegistro: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, borderWidth: 1.5, marginVertical: 6 },
  cajaMuro: { padding: 12, borderRadius: 12, borderWidth: 1, marginVertical: 6 },
  seccionGanadores: { backgroundColor: 'rgba(15,23,42,0.9)', padding: 12, borderRadius: 12, marginVertical: 6 },
  filaGanador: { paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
});