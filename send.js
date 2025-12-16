const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chokidar = require('chokidar');
const path = require('path');

const DESTINO = '593983084511@c.us';
const CAPTURES_DIR = path.join(__dirname, 'captures');

const MONITOREO = {
    responsable: 'Lenin Alomoto',
    lugar: 'G1',
    fecha: 'lunes 15/12/2025',
    inicio: '19:52',
    fin: '21:52',
    camaras_sin_conexion: [
        'Camera 01_DS-7104HGHI-K1',
        'Ambato y Bolívar_DS-7104HGHI-K1',
        'Camera 01_DS-7104HGHI-K1'
    ]
};

function getEstado(actual, inicio, fin) {
    if (actual === inicio) return 'inicia';
    if (actual === fin) return 'finaliza';
    return 'continua';
}

function buildMessage(estado) {
    return `${MONITOREO.responsable} ${estado} monitoreo ${MONITOREO.lugar}

Hora: ${MONITOREO.inicio} - ${MONITOREO.fin}
Fecha: ${MONITOREO.fecha}

Novedades:
Cámaras sin conexión:
${MONITOREO.camaras_sin_conexion.join('\n')}`;
}

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
        ignoreInitial: true,       // 👈 CLAVE
        awaitWriteFinish: true
    });

    watcher.on('add', async filePath => {
        try {
            const hora = new Date().toTimeString().slice(0, 5);

            // validar horario
            if (hora < MONITOREO.inicio || hora > MONITOREO.fin) return;

            const estado = getEstado(hora, MONITOREO.inicio, MONITOREO.fin);
            const mensaje = buildMessage(estado);

            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(DESTINO, media, { caption: mensaje });

            console.log(`📤 Enviado (${estado}) → ${hora}`);

        } catch (err) {
            console.error('❌ Error enviando:', err.message);
        }
    });
});

client.initialize();
