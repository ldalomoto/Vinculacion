const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chokidar = require('chokidar');
const path = require('path');

const DESTINO = '120363300007588061@g.us'; // Grupo principal
// const DESTINO = '120363404278630046@g.us'; // Grupo de pruebas
const CAPTURES_DIR = path.join(__dirname, 'captures');
const METRICAS_DIR = path.join(__dirname, 'metricas');

let metricasEnviadas = false;

// ================= HORAS =================
function horaEnRango(horaActual, inicio, fin) {
    const toMin = h => {
        const [hh, mm] = h.split(':').map(Number);
        return hh * 60 + mm;
    };

    const a = toMin(horaActual);
    const i = toMin(inicio);
    const f = toMin(fin);

    // rango normal
    if (i <= f) return a >= i && a <= f;

    // cruza medianoche
    return a >= i || a <= f;
}

// ================= CONFIG =================
const MONITOREO = {
    responsable: 'Lenin Alomoto',
    lugar: 'G1',
    fecha: 'miercoles 14/01/2026',

    horarios: [
        { inicio: '06:00', fin: '09:00' }
        // puedes agregar más bloques aquí
    ],

    camaras_sin_conexion: [
        'Camera 01_DS-7104HGHI-K1(J61593917)',
        'Ambato y Bolívar_DS-7104HGHI-K1(J61594633)',
        'Camera 01_DS-7104HGHI-K1(J61594700)'
    ]
};

// ================= BLOQUE ACTUAL =================
function obtenerBloqueActual(horaActual) {
    return MONITOREO.horarios.find(
        h => horaEnRango(horaActual, h.inicio, h.fin)
    );
}

// ================= ESTADO =================
function getEstado(horaActual, bloque) {
    if (horaActual === bloque.inicio) return 'inicia';
    if (horaActual === bloque.fin) return 'finaliza';
    return 'continua';
}

// ================= MENSAJE =================
function buildMessage(estado, bloque) {
    return `${MONITOREO.responsable} ${estado} monitoreo ${MONITOREO.lugar}
Hora: ${bloque.inicio} am - ${bloque.fin} am
Fecha: ${MONITOREO.fecha}
Novedades:
Cámaras sin conexión:
${MONITOREO.camaras_sin_conexion.join('\n')}`;
}

function buildMessageMetricas() {
    return `Métricas G1
Hora: 06:00 am - 09:00 am
Fecha: miercoles 14 de enero`;
}

// ================= WHATSAPP =================
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', qr => {
    console.log('📱 Escanea el QR:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp conectado');
    console.log('👀 Esperando capturas nuevas...');

    const watcher = chokidar.watch(CAPTURES_DIR, {
        ignoreInitial: true,
        awaitWriteFinish: true
    });

    watcher.on('add', async filePath => {
        try {
            const horaActual = new Date().toTimeString().slice(0, 5);

            const bloque = obtenerBloqueActual(horaActual);
            if (!bloque) return; // ⛔ fuera de horario

            const estado = getEstado(horaActual, bloque);
            const mensaje = buildMessage(estado, bloque);

            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(DESTINO, media, { caption: mensaje });

            console.log(`📤 Enviado (${estado}) → ${horaActual}`);

            if (estado === 'finaliza' && !metricasEnviadas) {
                metricasEnviadas = true;

                console.log('⏳ Esperando 20 segundos para enviar métricas...');
                await new Promise(resolve => setTimeout(resolve, 20_000));

                console.log('📊 Enviando Métricas de Monitoreo...');

                const mensajeMetricas = buildMessageMetricas();
                const mediaMetricas = MessageMedia.fromFilePath(
                    path.join(METRICAS_DIR, 'metricas-14-01-2026-2.png')
                );
            
                await client.sendMessage(DESTINO, mediaMetricas, {
                    caption: mensajeMetricas
                });
            
                console.log('✅ Métricas enviadas (una sola vez).');
            }

        } catch (err) {
            console.error('❌ Error enviando:', err.message);
        }
    });
});

client.initialize();
