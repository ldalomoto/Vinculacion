const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chokidar = require('chokidar');
const path = require('path');

const DESTINO = '120363404278630046@g.us';
const CAPTURES_DIR = path.join(__dirname, 'captures');

function horaEnRango(horaActual, inicio, fin) {
    const toMin = h => {
        const [hh, mm] = h.split(':').map(Number);
        return hh * 60 + mm;
    };

    const actual = toMin(horaActual);
    const ini = toMin(inicio);
    const fi = toMin(fin);

    // rango normal (ej: 09:00 - 17:00)
    if (ini <= fi) {
        return actual >= ini && actual <= fi;
    }

    // rango cruza medianoche (ej: 22:00 - 02:00)
    return actual >= ini || actual <= fi;
}

const MONITOREO = {
    responsable: 'Lenin Alomoto',
    lugar: 'G1',
    fecha: 'lunes 15/12/2025',

    // 👇 BLOQUES HORARIOS
    horarios: [
        { inicio: '21:46', fin: '22:46' }, // mañana
        { inicio: '23:00', fin: '00:00' }  // tarde / noche
    ],

    camaras_sin_conexion: [
        'Camera 01_DS-7104HGHI-K1',
        'Ambato y Bolívar_DS-7104HGHI-K1',
        'Camera 01_DS-7104HGHI-K1'
    ]
};

function obtenerBloqueActual(horaActual) {
    return MONITOREO.horarios.find(
        h => horaEnRango(horaActual, h.inicio, h.fin)
    );
}

const estadoPorBloque = {};

function getEstado(horaActual, bloque) {
    const key = `${bloque.inicio}-${bloque.fin}`;

    if (!estadoPorBloque[key]) {
        estadoPorBloque[key] = 'iniciado';
        return 'inicia';
    }

    return 'continua';
}

function buildMessage(estado, bloque) {
    return `${MONITOREO.responsable} ${estado} monitoreo ${MONITOREO.lugar}
Hora: ${bloque.inicio} - ${bloque.fin}
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
        ignoreInitial: true,
        awaitWriteFinish: true
    });

    watcher.on('add', async filePath => {
        try {
            const hora = new Date().toTimeString().slice(0, 5);

            // 🔍 Ver si estamos dentro de algún bloque
            const bloque = obtenerBloqueActual(hora);
            if (!bloque) return; // ⛔ fuera de horario

            const estado = getEstado(hora, bloque);
            const mensaje = buildMessage(estado, bloque);

            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(DESTINO, media, { caption: mensaje });

            console.log(`📤 Enviado (${estado}) → ${hora}`);

        } catch (err) {
            console.error('❌ Error enviando:', err.message);
        }
    });
});

client.initialize();
