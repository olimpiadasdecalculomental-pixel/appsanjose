-- =========================================================================
-- PROYECTO: APPSANJOSE (ESCALA 10 MILLONES DE USUARIOS)
-- ESQUEMA: esquema_dos | PREFIJO DE TABLAS: esq2_
-- SEGURIDAD: Transacciones Bancarias ACID + 1 Sola Fila por Usuario/Ciudad
-- =========================================================================

CREATE SCHEMA IF NOT EXISTS esquema_dos;

-- Permisos de acceso al esquema_dos para el cliente de Supabase
GRANT USAGE ON SCHEMA esquema_dos TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA esquema_dos GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA esquema_dos GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA esquema_dos GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Secuencia correlativa para Número Único de Cuenta (Ej: SJ-00000001)
CREATE SEQUENCE IF NOT EXISTS esquema_dos.esq2_seq_num_cuenta START 10001;

-- =========================================================================
-- 1. TABLA GLOBAL DE CONTROL SUPERADMIN (COLORES, % PANTALLA, PLANES, OTA)
-- =========================================================================
CREATE TABLE IF NOT EXISTS esquema_dos.esq2_config_global (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    version_catalogo INT NOT NULL DEFAULT 1,
    version_apk_minima TEXT NOT NULL DEFAULT '1.0.0',
    url_descarga_apk TEXT NOT NULL DEFAULT 'https://tusitio-hetzner-o-github.com/appsanjose.apk',
    ota_activo BOOLEAN NOT NULL DEFAULT true,
    -- Control de tamaño de pantalla en Porcentajes (%) Arriba, Abajo, Izq, Der
    encuadre_porcentaje_json JSONB NOT NULL DEFAULT '{
        "arriba_pct": 4,
        "abajo_pct": 6,
        "izquierda_pct": 3,
        "derecha_pct": 3
    }'::jsonb,
    -- Colores globales y por Plan de Suscripción (Camaleón)
    tema_colores_json JSONB NOT NULL DEFAULT '{
        "forzar_color_global": false,
        "GRATIS": {"fondo": "#FFFFFF", "primario": "#002B5B", "acento": "#00A8E8", "texto": "#0F172A", "boton": "#002B5B"},
        "VOLUNTARIO": {"fondo": "#F8FAFC", "primario": "#003566", "acento": "#38BDF8", "texto": "#0F172A", "boton": "#0284C7"},
        "BASICO": {"fondo": "#0A192F", "primario": "#112240", "acento": "#CD7F32", "texto": "#F8FAFC", "boton": "#CD7F32"},
        "MEDIO": {"fondo": "#020C1B", "primario": "#0F172A", "acento": "#00F5D4", "texto": "#FFFFFF", "boton": "#00BBF9"},
        "PREMIUM": {"fondo": "#050505", "primario": "#141414", "acento": "#D4AF37", "texto": "#FFFBEB", "boton": "#D4AF37"}
    }'::jsonb,
    -- Precios de planes administrables por SuperAdmin / Admin (Blindaje ASFI/AJ: Aportes)
    precios_planes_json JSONB NOT NULL DEFAULT '{
        "VOLUNTARIO": {"nombre": "Aporte Voluntario Hincha", "monto_bs": 10, "tickets_extra": 2},
        "BASICO": {"nombre": "Plan Socio Básico", "monto_bs": 30, "tickets_extra": 10},
        "MEDIO": {"nombre": "Plan Socio Medio", "monto_bs": 60, "tickets_extra": 25},
        "PREMIUM": {"nombre": "Plan Socio Dorado VIP", "monto_bs": 120, "tickets_extra": 60}
    }'::jsonb,
    mensaje_muro_oficial TEXT NOT NULL DEFAULT '¡Bienvenido a la App Oficial de la Hinchada de San José de Oruro! Completa tus datos o comparte nuestros videos para participar cada día a las 06:00 AM.',
    fotos_muro_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO esquema_dos.esq2_config_global (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 2. TABLA DE USUARIOS (REGLA: 1 SOLA FILA POR USUARIO CON CONTADORES)
-- =========================================================================
CREATE TABLE IF NOT EXISTS esquema_dos.esq2_usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_cuenta TEXT UNIQUE NOT NULL DEFAULT ('SJ-' || LPAD(nextval('esquema_dos.esq2_seq_num_cuenta')::TEXT, 8, '0')),
    device_id TEXT UNIQUE NOT NULL,
    foto_url TEXT DEFAULT '',
    nombres TEXT DEFAULT '',
    apellidos TEXT DEFAULT '',
    ci TEXT DEFAULT '',
    empresa TEXT DEFAULT '',
    cod_pais_cel TEXT DEFAULT '+591',
    celular TEXT DEFAULT '',
    ciudad_depto TEXT DEFAULT 'ORURO',
    pais TEXT DEFAULT 'BOLIVIA',
    datos_completos BOOLEAN NOT NULL DEFAULT false,
    -- Membresía y Fidelidad (Normativa ASFI/AJ)
    plan_actual TEXT NOT NULL DEFAULT 'GRATIS' CHECK (plan_actual IN ('GRATIS', 'VOLUNTARIO', 'BASICO', 'MEDIO', 'PREMIUM')),
    total_aportes_bs NUMERIC(12,2) NOT NULL DEFAULT 0,
    tickets_fidelidad_6am INT NOT NULL DEFAULT 1,
    qr_usuario_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    -- Jerarquía de 5 Roles y Seguridad de 5 Toques
    rol TEXT NOT NULL DEFAULT 'HINCHA' CHECK (rol IN ('HINCHA', 'ENTREGADOR', 'RECARGADOR', 'ADMIN', 'SUPERADMIN')),
    usuario_boveda TEXT UNIQUE,
    pin_boveda_hash TEXT,
    aprobado_por_id UUID,
    estado_cuenta TEXT NOT NULL DEFAULT 'ACTIVO' CHECK (estado_cuenta IN ('ACTIVO', 'SUSPENDIDO')),
    -- Contadores Acumulativos en 1 Sola Fila (Cero Basura en Base de Datos)
    fecha_ultima_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
    entradas_hoy INT NOT NULL DEFAULT 1,
    total_entradas_historico INT NOT NULL DEFAULT 1,
    compartidos_whatsapp_total INT NOT NULL DEFAULT 0,
    compartidos_redes_hoy INT NOT NULL DEFAULT 0,
    premios_ganados_total INT NOT NULL DEFAULT 0,
    premios_reclamados_total INT NOT NULL DEFAULT 0,
    ultimo_hash_captura TEXT DEFAULT '',
    fecha_ultimo_cupo_6am DATE,
    ultima_actividad TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esq2_usr_busqueda ON esquema_dos.esq2_usuarios (numero_cuenta, ci, celular);
CREATE INDEX IF NOT EXISTS idx_esq2_usr_ciudad ON esquema_dos.esq2_usuarios (ciudad_depto, estado_cuenta);

-- =========================================================================
-- 3. TABLA DE MÉTRICAS POR CIUDAD (REGLA: 1 SOLA FILA POR CIUDAD/DEPTO)
-- =========================================================================
CREATE TABLE IF NOT EXISTS esquema_dos.esq2_metricas_ciudades (
    ciudad_depto TEXT PRIMARY KEY,
    pais TEXT NOT NULL DEFAULT 'BOLIVIA',
    fecha_dia_actual DATE NOT NULL DEFAULT CURRENT_DATE,
    usuarios_totales_ciudad INT NOT NULL DEFAULT 0,
    usuarios_unicos_hoy INT NOT NULL DEFAULT 0,
    total_entradas_hoy INT NOT NULL DEFAULT 0,
    total_entradas_historico BIGINT NOT NULL DEFAULT 0,
    promedio_entradas_por_usuario NUMERIC(8,2) NOT NULL DEFAULT 1.00,
    total_compartidos_whatsapp BIGINT NOT NULL DEFAULT 0,
    total_compartidos_redes BIGINT NOT NULL DEFAULT 0,
    total_aportes_bs NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_premios_entregados BIGINT NOT NULL DEFAULT 0,
    ultima_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO esquema_dos.esq2_metricas_ciudades (ciudad_depto, pais)
VALUES ('ORURO', 'BOLIVIA'), ('LA PAZ', 'BOLIVIA'), ('COCHABAMBA', 'BOLIVIA'), ('SANTA CRUZ', 'BOLIVIA'), ('EXTERIOR', 'INTERNACIONAL')
ON CONFLICT (ciudad_depto) DO NOTHING;

-- =========================================================================
-- 4. CATÁLOGO MAESTRO DE PREMIOS (CREADO POR SUPERADMIN / ADMIN)
-- =========================================================================
CREATE TABLE IF NOT EXISTS esquema_dos.esq2_catalogo_premios (
    id_catalogo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'OTRO' CHECK (categoria IN ('COMIDA', 'RECARGA', 'POLERA', 'OTRO')),
    descripcion TEXT NOT NULL DEFAULT '',
    foto_url TEXT DEFAULT '',
    stock_inicial INT NOT NULL DEFAULT 0,
    stock_disponible_central INT NOT NULL DEFAULT 0,
    direccion_recojo TEXT NOT NULL,
    ciudad_recojo TEXT NOT NULL DEFAULT 'ORURO',
    whatsapp_coordinacion TEXT NOT NULL DEFAULT '',
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_por UUID,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 5. CADENA DE INVENTARIO (SUPERADMIN -> RECARGADOR -> ENTREGADOR)
-- Consolidado en 1 sola fila por Operador y Premio para saber cuánto entregó
-- =========================================================================
CREATE TABLE IF NOT EXISTS esquema_dos.esq2_inventario_nodos (
    id_inventario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_operador UUID NOT NULL REFERENCES esquema_dos.esq2_usuarios(id_usuario),
    rol_operador TEXT NOT NULL CHECK (rol_operador IN ('RECARGADOR', 'ENTREGADOR')),
    id_catalogo UUID NOT NULL REFERENCES esquema_dos.esq2_catalogo_premios(id_catalogo),
    cantidad_recibida_total INT NOT NULL DEFAULT 0,
    cantidad_entregada_o_repartida INT NOT NULL DEFAULT 0,
    cantidad_disponible_actual INT NOT NULL DEFAULT 0,
    ultima_operacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (id_operador, id_catalogo)
);

-- =========================================================================
-- 6. BILLETERA DE PREMIOS DE LA HINCHADA (QR ÚNICO QUEMABLE Y TRANSFERIBLE)
-- =========================================================================
CREATE TABLE IF NOT EXISTS esquema_dos.esq2_billetera_premios (
    id_premio_unico UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_catalogo UUID NOT NULL REFERENCES esquema_dos.esq2_catalogo_premios(id_catalogo),
    id_usuario_dueno UUID NOT NULL REFERENCES esquema_dos.esq2_usuarios(id_usuario),
    id_entregador_asignado UUID REFERENCES esquema_dos.esq2_usuarios(id_usuario),
    titulo_premio TEXT NOT NULL,
    categoria_premio TEXT NOT NULL,
    direccion_reclamo TEXT NOT NULL,
    whatsapp_entregador TEXT NOT NULL,
    qr_premio_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(20), 'hex'),
    estado TEXT NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'ENTREGADO_QUEMADO')),
    modalidad_entrega TEXT DEFAULT 'EN_TIENDA_QR' CHECK (modalidad_entrega IN ('EN_TIENDA_QR', 'ENVIO_COORDINADO_WHATSAPP')),
    veces_transferido INT NOT NULL DEFAULT 0,
    fecha_ganado TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_entregado TIMESTAMPTZ,
    entregado_por_id UUID REFERENCES esquema_dos.esq2_usuarios(id_usuario)
);

CREATE INDEX IF NOT EXISTS idx_esq2_billetera_dueno ON esquema_dos.esq2_billetera_premios (id_usuario_dueno, estado);
CREATE INDEX IF NOT EXISTS idx_esq2_billetera_entregador ON esquema_dos.esq2_billetera_premios (id_entregador_asignado, estado);

-- =========================================================================
-- 7. MOTOR PROGRAMADOR DE PREMIOS 06:00 AM (CONTROL TOTAL SUPERADMIN)
-- =========================================================================
CREATE TABLE IF NOT EXISTS esquema_dos.esq2_programacion_6am (
    id_programacion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_objetivo DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_objetivo TIME NOT NULL DEFAULT '06:00:00',
    modo_programacion TEXT NOT NULL DEFAULT 'DIARIO' CHECK (modo_programacion IN ('UNICA_FECHA', 'RANGO_FECHAS', 'DIARIO')),
    filtro_ciudad_depto TEXT NOT NULL DEFAULT 'TODOS',
    id_catalogo UUID NOT NULL REFERENCES esquema_dos.esq2_catalogo_premios(id_catalogo),
    id_entregador_asignado UUID REFERENCES esquema_dos.esq2_usuarios(id_usuario),
    cantidad_ganadores_max INT NOT NULL DEFAULT 5,
    cuentas_forzadas_superadmin JSONB NOT NULL DEFAULT '[]'::jsonb,
    ejecutado_hoy BOOLEAN NOT NULL DEFAULT false,
    ultima_ejecucion TIMESTAMPTZ
);

-- =========================================================================
-- 8. VIDEOS MULTIMEDIA CON CRISTALES (YOUTUBE, TIKTOK, DRIVE, HETZNER)
-- =========================================================================
CREATE TABLE IF NOT EXISTS esquema_dos.esq2_videos_multimedia (
    id_video UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    origen_red TEXT NOT NULL CHECK (origen_red IN ('TIKTOK', 'YOUTUBE', 'FACEBOOK', 'DRIVE', 'HETZNER')),
    url_reproduccion_embed TEXT NOT NULL,
    url_ir_a_red_social TEXT NOT NULL,
    tickets_recompensa_6am INT NOT NULL DEFAULT 1,
    total_clics_compartir BIGINT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 9. LIBRO MAYOR BANCARIO INMUTABLE (AUDITORÍA DE TRANSACCIONES)
-- =========================================================================
CREATE TABLE IF NOT EXISTS esquema_dos.esq2_libro_transacciones (
    id_tx UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_tx TEXT NOT NULL CHECK (tipo_tx IN (
        'ALTA_ROL', 'BAJA_USUARIO', 'REPARTO_MAYORISTA', 'PREMIO_6AM',
        'TRANSFERENCIA_HINCHA_P2P', 'QUEMA_QR_ENTREGADO', 'CAMBIO_PLAN_SOCIO'
    )),
    id_origen UUID,
    id_destino UUID,
    id_referencia_objeto UUID,
    detalle_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    firma_hash TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    fecha_tx TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- FUNCIONES RPC BANCARIAS (PETICIONES SOLO EN INICIO Y EN TRANSACCIÓN)
-- =========================================================================

-- A. RPC 1: SINCRONIZACIÓN DE INICIO (1 SOLA LLAMADA AL ABRIR LA APP)
CREATE OR REPLACE FUNCTION esquema_dos.esq2_rpc_sync_inicio(
    p_device_id TEXT,
    p_ciudad_depto TEXT DEFAULT 'ORURO',
    p_version_local INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usuario esquema_dos.esq2_usuarios%ROWTYPE;
    v_config esquema_dos.esq2_config_global%ROWTYPE;
    v_ciudad TEXT := UPPER(COALESCE(NULLIF(TRIM(p_ciudad_depto), ''), 'ORURO'));
    v_nuevo_dia BOOLEAN := false;
    v_videos JSONB := '[]'::jsonb;
    v_ganadores_hoy JSONB := '[]'::jsonb;
BEGIN
    SELECT * INTO v_config FROM esquema_dos.esq2_config_global WHERE id = 1;

    -- Crear o actualizar la ÚNICA fila del usuario
    INSERT INTO esquema_dos.esq2_usuarios (device_id, ciudad_depto)
    VALUES (p_device_id, v_ciudad)
    ON CONFLICT (device_id) DO UPDATE SET
        entradas_hoy = CASE WHEN esquema_dos.esq2_usuarios.fecha_ultima_entrada < CURRENT_DATE THEN 1 ELSE esquema_dos.esq2_usuarios.entradas_hoy + 1 END,
        compartidos_redes_hoy = CASE WHEN esquema_dos.esq2_usuarios.fecha_ultima_entrada < CURRENT_DATE THEN 0 ELSE esquema_dos.esq2_usuarios.compartidos_redes_hoy END,
        fecha_ultima_entrada = CURRENT_DATE,
        total_entradas_historico = esquema_dos.esq2_usuarios.total_entradas_historico + 1,
        ultima_actividad = NOW()
    RETURNING * INTO v_usuario;

    v_nuevo_dia := (v_usuario.entradas_hoy = 1);

    -- Actualizar la ÚNICA fila de la Ciudad/Departamento con promedios en vivo
    INSERT INTO esquema_dos.esq2_metricas_ciudades (
        ciudad_depto, usuarios_totales_ciudad, usuarios_unicos_hoy, total_entradas_hoy, total_entradas_historico
    ) VALUES (v_ciudad, 1, 1, 1, 1)
    ON CONFLICT (ciudad_depto) DO UPDATE SET
        usuarios_unicos_hoy = CASE
            WHEN esquema_dos.esq2_metricas_ciudades.fecha_dia_actual < CURRENT_DATE THEN 1
            WHEN v_nuevo_dia THEN esquema_dos.esq2_metricas_ciudades.usuarios_unicos_hoy + 1
            ELSE esquema_dos.esq2_metricas_ciudades.usuarios_unicos_hoy
        END,
        total_entradas_hoy = CASE
            WHEN esquema_dos.esq2_metricas_ciudades.fecha_dia_actual < CURRENT_DATE THEN 1
            ELSE esquema_dos.esq2_metricas_ciudades.total_entradas_hoy + 1
        END,
        fecha_dia_actual = CURRENT_DATE,
        total_entradas_historico = esquema_dos.esq2_metricas_ciudades.total_entradas_historico + 1,
        promedio_entradas_por_usuario = ROUND(
            (esquema_dos.esq2_metricas_ciudades.total_entradas_hoy + 1)::NUMERIC /
            GREATEST(esquema_dos.esq2_metricas_ciudades.usuarios_unicos_hoy, 1), 2
        ),
        ultima_actualizacion = NOW();

    -- Si la versión local es menor, enviamos Delta de Videos y Ganadores 6:00 AM
    SELECT COALESCE(jsonb_agg(v), '[]'::jsonb) INTO v_videos
    FROM (SELECT * FROM esquema_dos.esq2_videos_multimedia WHERE activo = true ORDER BY creado_en DESC LIMIT 20) v;

    SELECT COALESCE(jsonb_agg(g), '[]'::jsonb) INTO v_ganadores_hoy
    FROM (
        SELECT b.titulo_premio, b.categoria_premio, u.numero_cuenta, u.nombres, u.ciudad_depto, b.fecha_ganado
        FROM esquema_dos.esq2_billetera_premios b
        JOIN esquema_dos.esq2_usuarios u ON u.id_usuario = b.id_usuario_dueno
        ORDER BY b.fecha_ganado DESC LIMIT 15
    ) g;

    RETURN jsonb_build_object(
        'ok', true,
        'sin_cambios_config', (p_version_local = v_config.version_catalogo),
        'config_global', CASE WHEN p_version_local = v_config.version_catalogo THEN NULL ELSE to_jsonb(v_config) END,
        'usuario', to_jsonb(v_usuario),
        'videos', v_videos,
        'ganadores_6am', v_ganadores_hoy
    );
END;
$$;

-- B. RPC 2: QUEMAR QR DE PREMIO EN TIENDA O POR WHATSAPP (BLOQUEO BANCARIO ACID)
CREATE OR REPLACE FUNCTION esquema_dos.esq2_rpc_quemar_qr_premio(
    p_id_entregador UUID,
    p_qr_premio_token TEXT,
    p_modalidad TEXT DEFAULT 'EN_TIENDA_QR'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_premio esquema_dos.esq2_billetera_premios%ROWTYPE;
    v_entregador esquema_dos.esq2_usuarios%ROWTYPE;
BEGIN
    SELECT * INTO v_entregador FROM esquema_dos.esq2_usuarios
    WHERE id_usuario = p_id_entregador AND rol IN ('ENTREGADOR', 'RECARGADOR', 'ADMIN', 'SUPERADMIN') AND estado_cuenta = 'ACTIVO';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'Entregador no autorizado o suspendido.');
    END IF;

    -- Bloqueo FOR UPDATE: Imposible cobrar dos veces al mismo milisegundo
    SELECT * INTO v_premio FROM esquema_dos.esq2_billetera_premios
    WHERE qr_premio_token = p_qr_premio_token FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'Código QR inexistente o inválido.');
    END IF;

    IF v_premio.estado = 'ENTREGADO_QUEMADO' THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'ALERTA: Este premio YA FUE ENTREGADO el ' || v_premio.fecha_entregado::TEXT);
    END IF;

    -- Quemar el QR y eliminar validez anterior
    UPDATE esquema_dos.esq2_billetera_premios SET
        estado = 'ENTREGADO_QUEMADO',
        modalidad_entrega = p_modalidad,
        fecha_entregado = NOW(),
        entregado_por_id = p_id_entregador,
        qr_premio_token = 'QUEMADO-' || encode(gen_random_bytes(8), 'hex')
    WHERE id_premio_unico = v_premio.id_premio_unico;

    -- Actualizar contador de la fila única del hincha y del inventario del entregador
    UPDATE esquema_dos.esq2_usuarios SET premios_reclamados_total = premios_reclamados_total + 1
    WHERE id_usuario = v_premio.id_usuario_dueno;

    UPDATE esquema_dos.esq2_inventario_nodos SET
        cantidad_entregada_o_repartida = cantidad_entregada_o_repartida + 1,
        cantidad_disponible_actual = GREATEST(cantidad_disponible_actual - 1, 0),
        ultima_operacion = NOW()
    WHERE id_operador = p_id_entregador AND id_catalogo = v_premio.id_catalogo;

    INSERT INTO esquema_dos.esq2_libro_transacciones (tipo_tx, id_origen, id_destino, id_referencia_objeto, detalle_json)
    VALUES ('QUEMA_QR_ENTREGADO', p_id_entregador, v_premio.id_usuario_dueno, v_premio.id_premio_unico,
            jsonb_build_object('premio', v_premio.titulo_premio, 'modalidad', p_modalidad));

    RETURN jsonb_build_object('ok', true, 'mensaje', 'Premio ENTREGADO y QR quemado con éxito.', 'premio', v_premio.titulo_premio);
END;
$$;

-- C. RPC 3: TRANSFERIR PREMIO DE UN HINCHA A OTRO HINCHA (REGENERA QR)
CREATE OR REPLACE FUNCTION esquema_dos.esq2_rpc_transferir_premio_p2p(
    p_id_dueno_actual UUID,
    p_id_premio_unico UUID,
    p_identificador_destino TEXT -- Puede ser numero_cuenta (SJ-...), CI o Celular
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_premio esquema_dos.esq2_billetera_premios%ROWTYPE;
    v_destino esquema_dos.esq2_usuarios%ROWTYPE;
    v_nuevo_qr TEXT := encode(gen_random_bytes(20), 'hex');
BEGIN
    SELECT * INTO v_premio FROM esquema_dos.esq2_billetera_premios
    WHERE id_premio_unico = p_id_premio_unico AND id_usuario_dueno = p_id_dueno_actual FOR UPDATE;

    IF NOT FOUND OR v_premio.estado <> 'DISPONIBLE' THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'El premio no está disponible para transferir.');
    END IF;

    SELECT * INTO v_destino FROM esquema_dos.esq2_usuarios
    WHERE (UPPER(numero_cuenta) = UPPER(TRIM(p_identificador_destino))
        OR ci = TRIM(p_identificador_destino)
        OR celular = TRIM(p_identificador_destino))
      AND estado_cuenta = 'ACTIVO'
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'No se encontró al hincha destino con ese Nº de Cuenta, CI o Celular.');
    END IF;

    UPDATE esquema_dos.esq2_billetera_premios SET
        id_usuario_dueno = v_destino.id_usuario,
        qr_premio_token = v_nuevo_qr,
        veces_transferido = veces_transferido + 1
    WHERE id_premio_unico = p_id_premio_unico;

    INSERT INTO esquema_dos.esq2_libro_transacciones (tipo_tx, id_origen, id_destino, id_referencia_objeto, detalle_json)
    VALUES ('TRANSFERENCIA_HINCHA_P2P', p_id_dueno_actual, v_destino.id_usuario, p_id_premio_unico,
            jsonb_build_object('cuenta_destino', v_destino.numero_cuenta));

    RETURN jsonb_build_object('ok', true, 'mensaje', 'Premio transferido a ' || v_destino.nombres || ' (' || v_destino.numero_cuenta || ')');
END;
$$;

-- D. RPC 4: APROBAR ROLES (ENTREGADOR / RECARGADOR / ADMIN) Y DAR DE BAJA EN VIVO
CREATE OR REPLACE FUNCTION esquema_dos.esq2_rpc_aprobar_rol_y_estado(
    p_id_admin_ejecutor UUID,
    p_busqueda_usuario TEXT, -- numero_cuenta, CI o Celular
    p_nuevo_rol TEXT,
    p_nuevo_estado TEXT,
    p_usuario_boveda TEXT DEFAULT NULL,
    p_pin_boveda TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ejecutor esquema_dos.esq2_usuarios%ROWTYPE;
    v_objetivo esquema_dos.esq2_usuarios%ROWTYPE;
BEGIN
    SELECT * INTO v_ejecutor FROM esquema_dos.esq2_usuarios
    WHERE id_usuario = p_id_admin_ejecutor AND rol IN ('ADMIN', 'SUPERADMIN') AND estado_cuenta = 'ACTIVO';

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'Solo Admin o SuperAdmin pueden aprobar roles.');
    END IF;

    SELECT * INTO v_objetivo FROM esquema_dos.esq2_usuarios
    WHERE UPPER(numero_cuenta) = UPPER(TRIM(p_busqueda_usuario))
       OR ci = TRIM(p_busqueda_usuario)
       OR celular = TRIM(p_busqueda_usuario)
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'Usuario no encontrado.');
    END IF;

    UPDATE esquema_dos.esq2_usuarios SET
        rol = COALESCE(p_nuevo_rol, rol),
        estado_cuenta = COALESCE(p_nuevo_estado, estado_cuenta),
        usuario_boveda = COALESCE(NULLIF(TRIM(p_usuario_boveda), ''), usuario_boveda),
        pin_boveda_hash = CASE WHEN p_pin_boveda IS NOT NULL AND p_pin_boveda <> '' THEN crypt(p_pin_boveda, gen_salt('bf')) ELSE pin_boveda_hash END,
        aprobado_por_id = p_id_admin_ejecutor
    WHERE id_usuario = v_objetivo.id_usuario;

    INSERT INTO esquema_dos.esq2_libro_transacciones (tipo_tx, id_origen, id_destino, detalle_json)
    VALUES ('ALTA_ROL', p_id_admin_ejecutor, v_objetivo.id_usuario,
            jsonb_build_object('rol', p_nuevo_rol, 'estado', p_nuevo_estado, 'cuenta', v_objetivo.numero_cuenta));

    RETURN jsonb_build_object('ok', true, 'mensaje', 'Usuario ' || v_objetivo.numero_cuenta || ' actualizado a ' || p_nuevo_rol || ' (' || p_nuevo_estado || ').');
END;
$$;

-- E. RPC 5: CADENA DE REPARTO (SUPERADMIN -> RECARGADOR -> ENTREGADOR)
CREATE OR REPLACE FUNCTION esquema_dos.esq2_rpc_cadena_reparto_stock(
    p_id_origen UUID,
    p_cuenta_destino TEXT,
    p_id_catalogo UUID,
    p_cantidad INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_origen esquema_dos.esq2_usuarios%ROWTYPE;
    v_destino esquema_dos.esq2_usuarios%ROWTYPE;
    v_stock_origen INT;
BEGIN
    SELECT * INTO v_origen FROM esquema_dos.esq2_usuarios WHERE id_usuario = p_id_origen AND estado_cuenta = 'ACTIVO';
    SELECT * INTO v_destino FROM esquema_dos.esq2_usuarios WHERE UPPER(numero_cuenta) = UPPER(TRIM(p_cuenta_destino)) AND estado_cuenta = 'ACTIVO';

    IF NOT FOUND OR p_cantidad <= 0 THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'Destinatario o cantidad inválida.');
    END IF;

    -- Si el origen es SUPERADMIN, descuenta del catálogo central; si es RECARGADOR, descuenta de su nodo
    IF v_origen.rol = 'SUPERADMIN' THEN
        UPDATE esquema_dos.esq2_catalogo_premios
        SET stock_disponible_central = stock_disponible_central - p_cantidad
        WHERE id_catalogo = p_id_catalogo AND stock_disponible_central >= p_cantidad;
        IF NOT FOUND THEN
            RETURN jsonb_build_object('ok', false, 'mensaje', 'Stock central insuficiente en el catálogo.');
        END IF;
    ELSIF v_origen.rol = 'RECARGADOR' THEN
        UPDATE esquema_dos.esq2_inventario_nodos
        SET cantidad_disponible_actual = cantidad_disponible_actual - p_cantidad,
            cantidad_entregada_o_repartida = cantidad_entregada_o_repartida + p_cantidad
        WHERE id_operador = p_id_origen AND id_catalogo = p_id_catalogo AND cantidad_disponible_actual >= p_cantidad;
        IF NOT FOUND THEN
            RETURN jsonb_build_object('ok', false, 'mensaje', 'Tu stock de Recargador es insuficiente.');
        END IF;
    ELSE
        RETURN jsonb_build_object('ok', false, 'mensaje', 'No tienes rango para repartir lotes.');
    END IF;

    -- Sumar al inventario consolidado (1 sola fila por operador y premio)
    INSERT INTO esquema_dos.esq2_inventario_nodos (
        id_operador, rol_operador, id_catalogo, cantidad_recibida_total, cantidad_disponible_actual
    ) VALUES (
        v_destino.id_usuario,
        CASE WHEN v_destino.rol = 'RECARGADOR' THEN 'RECARGADOR' ELSE 'ENTREGADOR' END,
        p_id_catalogo, p_cantidad, p_cantidad
    )
    ON CONFLICT (id_operador, id_catalogo) DO UPDATE SET
        cantidad_recibida_total = esquema_dos.esq2_inventario_nodos.cantidad_recibida_total + p_cantidad,
        cantidad_disponible_actual = esquema_dos.esq2_inventario_nodos.cantidad_disponible_actual + p_cantidad,
        ultima_operacion = NOW();

    INSERT INTO esquema_dos.esq2_libro_transacciones (tipo_tx, id_origen, id_destino, id_referencia_objeto, detalle_json)
    VALUES ('REPARTO_MAYORISTA', p_id_origen, v_destino.id_usuario, p_id_catalogo, jsonb_build_object('cantidad', p_cantidad));

    RETURN jsonb_build_object('ok', true, 'mensaje', 'Se repartieron ' || p_cantidad || ' unidades a ' || v_destino.numero_cuenta);
END;
$$;

-- F. RPC 6: VALIDAR CAPTURA DE TIKTOK / WHATSAPP Y DAR CUPÓN 06:00 AM (1 FILA)
CREATE OR REPLACE FUNCTION esquema_dos.esq2_rpc_validar_mision_viral(
    p_id_usuario UUID,
    p_tipo_mision TEXT, -- 'WHATSAPP_5' o 'RED_SOCIAL_VIDEO'
    p_hash_captura TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_usr esquema_dos.esq2_usuarios%ROWTYPE;
BEGIN
    SELECT * INTO v_usr FROM esquema_dos.esq2_usuarios WHERE id_usuario = p_id_usuario FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'Usuario no registrado.');
    END IF;

    IF v_usr.ultimo_hash_captura = p_hash_captura THEN
        RETURN jsonb_build_object('ok', false, 'mensaje', 'Esta captura ya fue utilizada anteriormente. Toma una captura nueva.');
    END IF;

    UPDATE esquema_dos.esq2_usuarios SET
        tickets_fidelidad_6am = tickets_fidelidad_6am + 1,
        compartidos_whatsapp_total = CASE WHEN p_tipo_mision = 'WHATSAPP_5' THEN compartidos_whatsapp_total + 1 ELSE compartidos_whatsapp_total END,
        compartidos_redes_hoy = compartidos_redes_hoy + 1,
        ultimo_hash_captura = p_hash_captura,
        fecha_ultimo_cupo_6am = CURRENT_DATE
    WHERE id_usuario = p_id_usuario;

    UPDATE esquema_dos.esq2_metricas_ciudades SET
        total_compartidos_whatsapp = CASE WHEN p_tipo_mision = 'WHATSAPP_5' THEN total_compartidos_whatsapp + 1 ELSE total_compartidos_whatsapp END,
        total_compartidos_redes = total_compartidos_redes + 1
    WHERE ciudad_depto = v_usr.ciudad_depto;

    RETURN jsonb_build_object('ok', true, 'mensaje', '¡Cupón activado para el sorteo de mañana a las 06:00 AM!');
END;
$$;

-- G. PUENTE INTER-ESQUEMA PARA COMUNICARSE CON TUS OTROS ESQUEMAS DE SUPABASE
CREATE OR REPLACE FUNCTION esquema_dos.esq2_api_puente_externo(p_numero_cuenta_o_ci TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_u esquema_dos.esq2_usuarios%ROWTYPE;
BEGIN
    SELECT * INTO v_u FROM esquema_dos.esq2_usuarios
    WHERE numero_cuenta = p_numero_cuenta_o_ci OR ci = p_numero_cuenta_o_ci LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('existe', false);
    END IF;

    RETURN jsonb_build_object(
        'existe', true,
        'id_usuario', v_u.id_usuario,
        'numero_cuenta', v_u.numero_cuenta,
        'nombres', v_u.nombres,
        'plan_actual', v_u.plan_actual,
        'tickets_fidelidad_6am', v_u.tickets_fidelidad_6am
    );
END;
$$;