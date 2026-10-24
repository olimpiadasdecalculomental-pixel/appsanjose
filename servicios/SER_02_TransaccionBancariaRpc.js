// Archivo: servicios/SER_02_TransaccionBancariaRpc.js (Max 75 lineas)
import { supabaseEsq2 } from '../config/CFG_01_ClienteSupabaseEsq2';

export const SER_TransaccionBancariaRpc = {
  async guardarPerfilHincha(idUsuario, datosPerfil) {
    const { data, error } = await supabaseEsq2
      .from('esq2_usuarios')
      .update({
        foto_url: datosPerfil.foto_url,
        nombres: datosPerfil.nombres,
        apellidos: datosPerfil.apellidos,
        ci: datosPerfil.ci,
        empresa: datosPerfil.empresa,
        cod_pais_cel: datosPerfil.cod_pais_cel,
        celular: datosPerfil.celular,
        ciudad_depto: datosPerfil.ciudad_depto,
        pais: datosPerfil.pais,
        datos_completos: true,
      })
      .eq('id_usuario', idUsuario)
      .select()
      .single();
    return { ok: !error, usuario: data, mensaje: error ? error.message : 'Carnet Santo actualizado.' };
  },

  async quemarQrPremio(idEntregador, qrToken, modalidad = 'EN_TIENDA_QR') {
    const { data, error } = await supabaseEsq2.rpc('esq2_rpc_quemar_qr_premio', {
      p_id_entregador: idEntregador,
      p_qr_premio_token: qrToken,
      p_modalidad: modalidad,
    });
    return error ? { ok: false, mensaje: error.message } : data;
  },

  async transferirPremioP2P(idDueno, idPremioUnico, cuentaOCiDestino) {
    const { data, error } = await supabaseEsq2.rpc('esq2_rpc_transferir_premio_p2p', {
      p_id_dueno_actual: idDueno,
      p_id_premio_unico: idPremioUnico,
      p_identificador_destino: cuentaOCiDestino,
    });
    return error ? { ok: false, mensaje: error.message } : data;
  },

  async aprobarRolYEstado(idAdmin, busqueda, nuevoRol, nuevoEstado, usrBoveda, pinBoveda) {
    const { data, error } = await supabaseEsq2.rpc('esq2_rpc_aprobar_rol_y_estado', {
      p_id_admin_ejecutor: idAdmin,
      p_busqueda_usuario: busqueda,
      p_nuevo_rol: nuevoRol,
      p_nuevo_estado: nuevoEstado,
      p_usuario_boveda: usrBoveda,
      p_pin_boveda: pinBoveda,
    });
    return error ? { ok: false, mensaje: error.message } : data;
  },

  async repartirStockCadena(idOrigen, cuentaDestino, idCatalogo, cantidad) {
    const { data, error } = await supabaseEsq2.rpc('esq2_rpc_cadena_reparto_stock', {
      p_id_origen: idOrigen,
      p_cuenta_destino: cuentaDestino,
      p_id_catalogo: idCatalogo,
      p_cantidad: Number(cantidad),
    });
    return error ? { ok: false, mensaje: error.message } : data;
  },

  async validarMisionViral6Am(idUsuario, tipoMision, hashCaptura) {
    const { data, error } = await supabaseEsq2.rpc('esq2_rpc_validar_mision_viral', {
      p_id_usuario: idUsuario,
      p_tipo_mision: tipoMision,
      p_hash_captura: hashCaptura,
    });
    return error ? { ok: false, mensaje: error.message } : data;
  },
};