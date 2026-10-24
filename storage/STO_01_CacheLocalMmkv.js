// Archivo: storage/STO_01_CacheLocalMmkv.js (Max 75 lineas)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CFG_CONSTANTES_DEFAULT } from '../config/CFG_02_ConstantesApp';

const CLAVES = {
  DEVICE_ID: '@sanjose_device_id',
  PERFIL_USUARIO: '@sanjose_perfil_unico',
  CONFIG_GLOBAL: '@sanjose_config_superadmin',
  BILLETERA_PREMIOS: '@sanjose_billetera_qr',
  VIDEOS_Y_GANADORES: '@sanjose_muro_cache',
};

export const STO_CacheLocal = {
  async obtenerDeviceId() {
    let id = await AsyncStorage.getItem(CLAVES.DEVICE_ID);
    if (!id) {
      id = 'DEV-SJ-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      await AsyncStorage.setItem(CLAVES.DEVICE_ID, id);
    }
    return id;
  },

  async guardarEstadoInicio(datosRpc) {
    if (datosRpc?.config_global) {
      await AsyncStorage.setItem(CLAVES.CONFIG_GLOBAL, JSON.stringify(datosRpc.config_global));
    }
    if (datosRpc?.usuario) {
      await AsyncStorage.setItem(CLAVES.PERFIL_USUARIO, JSON.stringify(datosRpc.usuario));
    }
    if (datosRpc?.videos || datosRpc?.ganadores_6am) {
      await AsyncStorage.setItem(
        CLAVES.VIDEOS_Y_GANADORES,
        JSON.stringify({ videos: datosRpc.videos || [], ganadores: datosRpc.ganadores_6am || [] })
      );
    }
  },

  async leerCacheCompletaOffline() {
    const [cfgRaw, usrRaw, bilRaw, muroRaw] = await Promise.all([
      AsyncStorage.getItem(CLAVES.CONFIG_GLOBAL),
      AsyncStorage.getItem(CLAVES.PERFIL_USUARIO),
      AsyncStorage.getItem(CLAVES.BILLETERA_PREMIOS),
      AsyncStorage.getItem(CLAVES.VIDEOS_Y_GANADORES),
    ]);
    return {
      config: cfgRaw ? JSON.parse(cfgRaw) : { version_catalogo: 0, encuadre_porcentaje_json: CFG_CONSTANTES_DEFAULT.ENCUADRE_PANTALLA_PCT },
      usuario: usrRaw ? JSON.parse(usrRaw) : null,
      billetera: bilRaw ? JSON.parse(bilRaw) : [],
      muro: muroRaw ? JSON.parse(muroRaw) : { videos: [], ganadores: [] },
    };
  },

  async guardarBilleteraOffline(listaPremios) {
    await AsyncStorage.setItem(CLAVES.BILLETERA_PREMIOS, JSON.stringify(listaPremios || []));
  },
};