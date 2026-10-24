// Archivo: App.js (Max 150 lineas - Raiz de APPSANJOSE en Expo SDK 57)
import React, { useState, useEffect } from 'react';
import LEG_01_MarcoSeguroGlobal from './legos/LEG_01_MarcoSeguroGlobal';
import MOL_02_CabeceraSanJose from './molecules/MOL_02_CabeceraSanJose';
import TEM_01_PlantillaCamaleon from './templates/TEM_01_PlantillaCamaleon';
import MOD_01_Boveda5ToquesLogin from './modales/MOD_01_Boveda5ToquesLogin';
import PAN_01_InicioMuroYVideos from './pantallas/PAN_01_InicioMuroYVideos';
import PAN_02_RegistroYCarnetSocio from './pantallas/PAN_02_RegistroYCarnetSocio';
import PAN_03_BilleteraMisPremios from './pantallas/PAN_03_BilleteraMisPremios';
import PAN_04_PanelRecargadorMayorista from './pantallas/PAN_04_PanelRecargadorMayorista';
import PAN_05_PanelEntregadorTienda from './pantallas/PAN_05_PanelEntregadorTienda';
import PAN_06_PanelSuperAdminTotal from './pantallas/PAN_06_PanelSuperAdminTotal';
import { SER_SyncInicioDelta } from './servicios/SER_01_SyncInicioDelta';
import { THE_ColoresSanJose } from './theme/THE_01_ColoresSanJosePlanes';
import { CNT_ContratoUsuario } from './contratos/CNT_01_ContratoUsuario';

export default function App() {
  const [pestana, setPestana] = useState('MURO');
  const [usuario, setUsuario] = useState(CNT_ContratoUsuario.crearPlantillaVacia());
  const [configGlobal, setConfigGlobal] = useState(null);
  const [billetera, setBilletera] = useState([]);
  const [muro, setMuro] = useState({ videos: [], ganadores: [] });
  const [boveda5ToquesVisible, setBoveda5ToquesVisible] = useState(false);
  const [operadorBoveda, setOperadorBoveda] = useState(null);

  const sincronizarSoloAlIniciar = async () => {
    const estado = await SER_SyncInicioDelta.inicializarAppUnaSolaVez();
    if (estado.config) setConfigGlobal(estado.config);
    if (estado.usuario) setUsuario(estado.usuario);
    if (estado.billetera) setBilletera(estado.billetera);
    if (estado.muro) setMuro(estado.muro);
  };

  useEffect(() => {
    sincronizarSoloAlIniciar();
  }, []);

  const temaActivo = THE_ColoresSanJose.obtenerTemaActivo(usuario?.plan_actual, configGlobal);

  const alDesbloquearRolCon5Toques = (datosOperador) => {
    setOperadorBoveda(datosOperador);
    if (datosOperador.rol === 'SUPERADMIN' || datosOperador.rol === 'ADMIN') {
      setPestana('SUPERADMIN');
    } else if (datosOperador.rol === 'RECARGADOR') {
      setPestana('RECARGADOR');
    } else {
      setPestana('ENTREGADOR');
    }
  };

  return (
    <LEG_01_MarcoSeguroGlobal usuario={usuario} configGlobal={configGlobal}>
      <MOL_02_CabeceraSanJose
        usuario={usuario}
        tema={temaActivo}
        alActivarBoveda5Toques={() => setBoveda5ToquesVisible(true)}
      />

      <TEM_01_PlantillaCamaleon
        pestanaActiva={pestana}
        alCambiarPestana={setPestana}
        operadorBoveda={operadorBoveda}
        tema={temaActivo}
      >
        {pestana === 'MURO' ? (
          <PAN_01_InicioMuroYVideos
            usuario={usuario}
            configGlobal={configGlobal}
            muro={muro}
            tema={temaActivo}
            alRefrescarUsuario={sincronizarSoloAlIniciar}
            irARegistroSocio={() => setPestana('SOCIO')}
          />
        ) : null}

        {pestana === 'SOCIO' ? (
          <PAN_02_RegistroYCarnetSocio
            usuario={usuario}
            configGlobal={configGlobal}
            tema={temaActivo}
            alActualizarUsuarioLocal={setUsuario}
          />
        ) : null}

        {pestana === 'PREMIOS' ? (
          <PAN_03_BilleteraMisPremios
            usuario={usuario}
            billeteraInicial={billetera}
            tema={temaActivo}
          />
        ) : null}

        {pestana === 'RECARGADOR' ? (
          <PAN_04_PanelRecargadorMayorista usuarioOperador={operadorBoveda || usuario} />
        ) : null}

        {pestana === 'ENTREGADOR' ? (
          <PAN_05_PanelEntregadorTienda usuarioOperador={operadorBoveda || usuario} />
        ) : null}

        {pestana === 'SUPERADMIN' ? (
          <PAN_06_PanelSuperAdminTotal
            usuarioOperador={operadorBoveda || usuario}
            configGlobal={configGlobal}
            alActualizarConfigLocal={setConfigGlobal}
          />
        ) : null}
      </TEM_01_PlantillaCamaleon>

      <MOD_01_Boveda5ToquesLogin
        visible={boveda5ToquesVisible}
        alCerrar={() => setBoveda5ToquesVisible(false)}
        alAutenticarOperador={alDesbloquearRolCon5Toques}
      />
    </LEG_01_MarcoSeguroGlobal>
  );
}