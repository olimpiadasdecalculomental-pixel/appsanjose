// Archivo: servicios/SER_01_SyncInicioDelta.js (Max 75 lineas)
import { supabaseEsq2 } from '../config/CFG_01_ClienteSupabaseEsq2';
import { STO_CacheLocal } from '../storage/STO_01_CacheLocalMmkv';
import { CNT_ContratoUsuario } from '../contratos/CNT_01_ContratoUsuario';

export const SER_SyncInicioDelta = {
  async inicializarAppUnaSolaVez() {
    const deviceId = await STO_CacheLocal.obtenerDeviceId();
    const cache = await STO_CacheLocal.leerCacheCompletaOffline();
    const versionLocal = cache.config?.version_catalogo || 0;
    const ciudadActual = cache.usuario?.ciudad_depto || 'ORURO';

    try {
      const { data, error } = await supabaseEsq2.rpc('esq2_rpc_sync_inicio', {
        p_device_id: deviceId,
        p_ciudad_depto: ciudadActual,
        p_version_local: versionLocal,
      });

      if (error || !data?.ok) throw new Error(error?.message || 'Modo Offline');

      await STO_CacheLocal.guardarEstadoInicio(data);
      const cacheActualizada = await STO_CacheLocal.leerCacheCompletaOffline();
      return { modoOffline: false, ...cacheActualizada };
    } catch (_err) {
      return {
        modoOffline: true,
        config: cache.config,
        usuario: cache.usuario || CNT_ContratoUsuario.crearPlantillaVacia(deviceId),
        billetera: cache.billetera,
        muro: cache.muro,
      };
    }
  },
};