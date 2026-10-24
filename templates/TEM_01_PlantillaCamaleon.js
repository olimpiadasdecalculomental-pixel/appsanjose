// Archivo: templates/TEM_01_PlantillaCamaleon.js (Max 100 lineas)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';

export default function TEM_01_PlantillaCamaleon({
  pestanaActiva,
  alCambiarPestana,
  operadorBoveda,
  tema,
  children,
}) {
  const rolSecreto = operadorBoveda?.rol || 'HINCHA';

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.contenido}>{children}</View>

      <View style={[estilos.barraInferior, { backgroundColor: tema.primario, borderTopColor: tema.acento }]}>
        <View style={estilos.itemNav}>
          <ATO_01_BotonCamaleon
            compacto
            titulo="🏠 Muro/Videos"
            colorFondo={pestanaActiva === 'MURO' ? tema.acento : tema.boton}
            colorTexto={pestanaActiva === 'MURO' ? '#050505' : '#FFFFFF'}
            alPresionar={() => alCambiarPestana('MURO')}
          />
        </View>
        <View style={estilos.itemNav}>
          <ATO_01_BotonCamaleon
            compacto
            titulo="🪪 Socio/Plan"
            colorFondo={pestanaActiva === 'SOCIO' ? tema.acento : tema.boton}
            colorTexto={pestanaActiva === 'SOCIO' ? '#050505' : '#FFFFFF'}
            alPresionar={() => alCambiarPestana('SOCIO')}
          />
        </View>
        <View style={estilos.itemNav}>
          <ATO_01_BotonCamaleon
            compacto
            titulo="🎁 Premios QR"
            colorFondo={pestanaActiva === 'PREMIOS' ? tema.acento : tema.boton}
            colorTexto={pestanaActiva === 'PREMIOS' ? '#050505' : '#FFFFFF'}
            alPresionar={() => alCambiarPestana('PREMIOS')}
          />
        </View>

        {['ENTREGADOR', 'RECARGADOR', 'ADMIN', 'SUPERADMIN'].includes(rolSecreto) ? (
          <View style={estilos.itemNav}>
            <ATO_01_BotonCamaleon
              compacto
              titulo="🏪 Entregar"
              colorFondo={pestanaActiva === 'ENTREGADOR' ? '#16A34A' : '#0F172A'}
              alPresionar={() => alCambiarPestana('ENTREGADOR')}
            />
          </View>
        ) : null}

        {['RECARGADOR', 'SUPERADMIN'].includes(rolSecreto) ? (
          <View style={estilos.itemNav}>
            <ATO_01_BotonCamaleon
              compacto
              titulo="📦 Mayorista"
              colorFondo={pestanaActiva === 'RECARGADOR' ? '#9333EA' : '#0F172A'}
              alPresionar={() => alCambiarPestana('RECARGADOR')}
            />
          </View>
        ) : null}

        {['ADMIN', 'SUPERADMIN'].includes(rolSecreto) ? (
          <View style={estilos.itemNav}>
            <ATO_01_BotonCamaleon
              compacto
              titulo="👑 Admin"
              colorFondo={pestanaActiva === 'SUPERADMIN' ? '#D4AF37' : '#0F172A'}
              colorTexto={pestanaActiva === 'SUPERADMIN' ? '#050505' : '#D4AF37'}
              alPresionar={() => alCambiarPestana('SUPERADMIN')}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1 },
  contenido: { flex: 1, paddingVertical: 4 },
  barraInferior: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 6, paddingVertical: 6, borderTopWidth: 2, borderRadius: 12 },
  itemNav: { flex: 1, marginHorizontal: 2 },
});