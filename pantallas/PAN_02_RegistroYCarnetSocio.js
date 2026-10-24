// Archivo: pantallas/PAN_02_RegistroYCarnetSocio.js (Max 150 lineas)
import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import ATO_01_BotonCamaleon from '../atoms/ATO_01_BotonCamaleon';
import ATO_02_TextoSanto from '../atoms/ATO_02_TextoSanto';
import ATO_03_InputSeguro from '../atoms/ATO_03_InputSeguro';
import MOD_02_MostrarQrGigante from '../modales/MOD_02_MostrarQrGigante';
import { CNT_ContratoUsuario } from '../contratos/CNT_01_ContratoUsuario';
import { SER_TransaccionBancariaRpc } from '../servicios/SER_02_TransaccionBancariaRpc';
import { supabaseEsq2 } from '../config/CFG_01_ClienteSupabaseEsq2';

const PLANES_LISTA = [
  { clave: 'VOLUNTARIO', titulo: 'Aporte Voluntario', bsDefault: 10 },
  { clave: 'BASICO', titulo: 'Plan Básico (Bronce)', bsDefault: 30 },
  { clave: 'MEDIO', titulo: 'Plan Medio (Plata/Cian)', bsDefault: 60 },
  { clave: 'PREMIUM', titulo: 'Plan Premium (Dorado VIP)', bsDefault: 120 },
];

export default function PAN_02_RegistroYCarnetSocio({
  usuario,
  configGlobal,
  tema,
  alActualizarUsuarioLocal,
}) {
  const [form, setForm] = useState({ ...usuario });
  const [verQrCarnet, setVerQrCarnet] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cambiarCampo = (campo, valor) => setForm((prev) => ({ ...prev, [campo]: valor }));

  const guardarDatosHinchada = async () => {
    const validacion = CNT_ContratoUsuario.validarDatosCompletos(form);
    if (!validacion.esValido) {
      return Alert.alert('Datos Incompletos', 'Completa Nombres, Apellidos, CI y Celular válidos.');
    }
    setGuardando(true);
    const res = await SER_TransaccionBancariaRpc.guardarPerfilHincha(
      usuario?.id_usuario,
      validacion.datosLimpios
    );
    setGuardando(false);
    if (res.ok && res.usuario) {
      alActualizarUsuarioLocal(res.usuario);
      Alert.alert('✅ Socio Registrado', 'Tus datos y tu QR de hincha están activos.');
    } else {
      alActualizarUsuarioLocal(validacion.datosLimpios);
      Alert.alert('Guardado Local', 'Datos guardados en el dispositivo (se sincronizarán al conectar).');
    }
  };

  const cambiarPlanSuscripcion = async (clavePlan, montoBs) => {
    const actualizado = {
      ...form,
      plan_actual: clavePlan,
      total_aportes_bs: Number(form.total_aportes_bs || 0) + Number(montoBs),
    };
    setForm(actualizado);
    alActualizarUsuarioLocal(actualizado);
    if (usuario?.id_usuario) {
      await supabaseEsq2
        .from('esq2_usuarios')
        .update({ plan_actual: clavePlan, total_aportes_bs: actualizado.total_aportes_bs })
        .eq('id_usuario', usuario.id_usuario);
    }
    Alert.alert('🎨 Tema Camaleón Activado', `Ahora tienes el estilo ${clavePlan} en toda tu aplicación.`);
  };

  return (
    <ScrollView style={estilos.scroll} showsVerticalScrollIndicator={false}>
      <View style={[estilos.carnet, { backgroundColor: tema.primario, borderColor: tema.acento }]}>
        <ATO_02_TextoSanto variante="titulo" color="#FFFFFF">
          🪪 CARNET DE SOCIO: {usuario?.numero_cuenta}
        </ATO_02_TextoSanto>
        <ATO_02_TextoSanto variante="cuerpo" color="#E2E8F0">
          {form.nombres || 'Hincha'} {form.apellidos || 'Santo'} • CI: {form.ci || 'Pendiente'}
        </ATO_02_TextoSanto>
        <ATO_02_TextoSanto variante="etiqueta" color="#D4AF37">
          Aportes Acumulados: {form.total_aportes_bs || 0} Bs • Plan: {form.plan_actual}
        </ATO_02_TextoSanto>
        <ATO_01_BotonCamaleon
          compacto
          titulo="📲 MOSTRAR MI QR OFICIAL DE LA HINCHADA"
          colorFondo={tema.acento}
          colorTexto="#050505"
          alPresionar={() => setVerQrCarnet(true)}
        />
      </View>

      <ATO_02_TextoSanto variante="subtitulo" color={tema.texto}>
        ⭐ PLANES DE SUSCRIPCIÓN Y APORTES (CAMBIA EL COLOR DE TU APP)
      </ATO_02_TextoSanto>
      <View style={estilos.grillaPlanes}>
        {PLANES_LISTA.map((p) => {
          const precioCfg = configGlobal?.precios_planes_json?.[p.clave]?.monto_bs || p.bsDefault;
          return (
            <View key={p.clave} style={estilos.itemPlan}>
              <ATO_01_BotonCamaleon
                compacto
                titulo={`${p.titulo} (${precioCfg} Bs)`}
                colorFondo={form.plan_actual === p.clave ? '#D4AF37' : tema.boton}
                colorTexto={form.plan_actual === p.clave ? '#050505' : '#FFFFFF'}
                alPresionar={() => cambiarPlanSuscripcion(p.clave, precioCfg)}
              />
            </View>
          );
        })}
      </View>

      <View style={estilos.formulario}>
        <ATO_02_TextoSanto variante="subtitulo" color={tema.texto}>
          📋 REGISTRO DE DATOS PERSONALES DE LA HINCHADA
        </ATO_02_TextoSanto>
        <ATO_03_InputSeguro etiqueta="URL Foto de Perfil (Opcional)" valor={form.foto_url} alCambiar={(v) => cambiarCampo('foto_url', v)} colorTexto={tema.texto} />
        <ATO_03_InputSeguro etiqueta="Nombres *" valor={form.nombres} alCambiar={(v) => cambiarCampo('nombres', v)} colorTexto={tema.texto} />
        <ATO_03_InputSeguro etiqueta="Apellidos *" valor={form.apellidos} alCambiar={(v) => cambiarCampo('apellidos', v)} colorTexto={tema.texto} />
        <ATO_03_InputSeguro etiqueta="Cédula de Identidad (CI) *" valor={form.ci} alCambiar={(v) => cambiarCampo('ci', v)} colorTexto={tema.texto} />
        <ATO_03_InputSeguro etiqueta="Empresa / Institución" valor={form.empresa} alCambiar={(v) => cambiarCampo('empresa', v)} colorTexto={tema.texto} />
        <ATO_03_InputSeguro etiqueta="Código de País (Ej: +591, +54, +34)" valor={form.cod_pais_cel} alCambiar={(v) => cambiarCampo('cod_pais_cel', v)} colorTexto={tema.texto} />
        <ATO_03_InputSeguro etiqueta="Número de Celular (WhatsApp) *" valor={form.celular} alCambiar={(v) => cambiarCampo('celular', v)} teclado="phone-pad" colorTexto={tema.texto} />
        <ATO_03_InputSeguro etiqueta="Ciudad o Departamento *" valor={form.ciudad_depto} alCambiar={(v) => cambiarCampo('ciudad_depto', v)} colorTexto={tema.texto} />
        <ATO_03_InputSeguro etiqueta="País *" valor={form.pais} alCambiar={(v) => cambiarCampo('pais', v)} colorTexto={tema.texto} />

        <ATO_01_BotonCamaleon
          titulo={guardando ? 'GUARDANDO EN SUPABASE...' : '💾 GUARDAR DATOS OFICIALES DE SOCIO'}
          colorFondo={tema.boton}
          alPresionar={guardarDatosHinchada}
        />
      </View>

      <MOD_02_MostrarQrGigante
        visible={verQrCarnet}
        alCerrar={() => setVerQrCarnet(false)}
        titulo={`SOCIO: ${usuario?.numero_cuenta}`}
        valorQr={usuario?.qr_usuario_token || usuario?.numero_cuenta}
        esPremio={false}
      />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  scroll: { flex: 1 },
  carnet: { padding: 14, borderRadius: 14, borderWidth: 2, marginVertical: 6 },
  grillaPlanes: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 4 },
  itemPlan: { width: '48%' },
  formulario: { marginTop: 8, paddingBottom: 24 },
});