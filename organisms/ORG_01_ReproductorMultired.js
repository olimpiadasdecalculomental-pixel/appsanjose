// Archivo: organisms/ORG_01_ReproductorMultired.js (Max 150 lineas)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import LEG_02_EscudoCristalVideo from '../legos/LEG_02_EscudoCristalVideo';
import { CER_ValidadorCapturaHash } from '../cerebros/CER_04_ValidadorCapturaHash';

export default function ORG_01_ReproductorMultired({
  video,
  alAbrirModalCaptura,
}) {
  const irARedSocialYActivarMision = async () => {
    const urlExterna = video?.url_ir_a_red_social || video?.url_reproduccion_embed;
    await CER_ValidadorCapturaHash.abrirRedSocialYRegistrarSalida(
      urlExterna,
      'RED_SOCIAL_VIDEO'
    );
    alAbrirModalCaptura();
  };

  // Soporta links directos MP4/HLS de Hetzner y Drive o embeds de TikTok/YouTube
  const esStreamDirectoHetznerODrive =
    video?.origen_red === 'HETZNER' ||
    video?.origen_red === 'DRIVE' ||
    (video?.url_reproduccion_embed || '').endsWith('.mp4');

  const htmlHetzner = `
    <html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
      <video src="${video?.url_reproduccion_embed}" controls playsinline style="width:100%;height:100%;object-fit:contain;"></video>
    </body></html>
  `;

  return (
    <LEG_02_EscudoCristalVideo
      tituloVideo={video?.titulo || 'Video Oficial San José'}
      origenRed={video?.origen_red || 'TIKTOK'}
      ticketsRecompensa={video?.tickets_recompensa_6am || 1}
      alIrACompartirYCapturar={irARedSocialYActivarMision}
    >
      <View style={estilos.visor}>
        <WebView
          source={
            esStreamDirectoHetznerODrive
              ? { html: htmlHetzner }
              : { uri: video?.url_reproduccion_embed || 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          }
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          style={estilos.webview}
        />
      </View>
    </LEG_02_EscudoCristalVideo>
  );
}

const estilos = StyleSheet.create({
  visor: { flex: 1, backgroundColor: '#000000' },
  webview: { flex: 1, backgroundColor: '#000000' },
});