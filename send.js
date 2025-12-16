const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const DESTINO = '593983084511@c.us'; // ← tu número
const CAPTURES_DIR = path.join(__dirname, 'captures');

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
    console.log('👀 Observando carpeta:', CAPTURES_DIR);

    const watcher = chokidar.watch(CAPTURES_DIR, {
        ignoreInitial: true,
        awaitWriteFinish: true
    });

    watcher.on('add', async filePath => {
        try {
            console.log('📸 Nueva captura:', filePath);
            const media = MessageMedia.fromFilePath(filePath);
            await client.sendMessage(DESTINO, media);
            console.log('📤 Enviada por WhatsApp');

            // opcional: borrar luego de enviar
            // fs.unlinkSync(filePath);

        } catch (err) {
            console.error('❌ Error enviando:', err.message);
        }
    });
});

client.initialize();
