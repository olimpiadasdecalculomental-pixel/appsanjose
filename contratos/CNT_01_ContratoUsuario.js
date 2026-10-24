// Archivo: contratos/CNT_01_ContratoUsuario.js (Max 75 lineas)
export const CNT_ContratoUsuario = {
  crearPlantillaVacia(deviceId = '') {
    return {
      id_usuario: null,
      numero_cuenta: 'SJ-PENDIENTE',
      device_id: deviceId,
      foto_url: '',
      nombres: '',
      apellidos: '',
      ci: '',
      empresa: '',
      cod_pais_cel: '+591',
      celular: '',
      ciudad_depto: 'ORURO',
      pais: 'BOLIVIA',
      plan_actual: 'GRATIS',
      total_aportes_bs: 0,
      tickets_fidelidad_6am: 1,
      qr_usuario_token: 'QR-LOCAL-TEMP',
      rol: 'HINCHA',
      estado_cuenta: 'ACTIVO',
    };
  },

  validarDatosCompletos(form) {
    const limpios = {
      nombres: (form.nombres || '').trim(),
      apellidos: (form.apellidos || '').trim(),
      ci: (form.ci || '').trim(),
      celular: (form.celular || '').trim(),
      ciudad_depto: (form.ciudad_depto || 'ORURO').trim().toUpperCase(),
      pais: (form.pais || 'BOLIVIA').trim().toUpperCase(),
    };
    const esValido = limpios.nombres.length >= 2 && limpios.apellidos.length >= 2 && limpios.ci.length >= 4 && limpios.celular.length >= 6;
    return { esValido, datosLimpios: { ...form, ...limpios, datos_completos: esValido } };
  },
};