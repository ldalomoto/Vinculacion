//const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
//const qrcode = require('qrcode-terminal');
//const chokidar = require('chokidar');
//const path = require('path');
//
//const CAPTURES_DIR = path.join(__dirname, 'captures');
//
//const MONITOREO = {
//    responsable: 'Lenin Alomoto',
//    lugar: 'G1',
//    fecha: 'lunes 15/12/2025',
//    inicio: '15:00',
//    fin: '21:00',
//    camaras_sin_conexion: [
//        'Camera 01_DS-7104HGHI-K1',
//        'Ambato y Bolívar_DS-7104HGHI-K1',
//        'Camera 01_DS-7104HGHI-K1'
//    ]
//};
//
//// ---------------- FUNCIONES ----------------
//
//function getEstado(actual, inicio, fin) {
//    if (actual === inicio) return 'inicia';
//    if (actual === fin) return 'finaliza';
//    return 'continua';
//}
//
//function buildMessage(estado) {
//    return `${MONITOREO.responsable} ${estado} monitoreo ${MONITOREO.lugar}
//
//Hora: ${MONITOREO.inicio} - ${MONITOREO.fin}
//Fecha: ${MONITOREO.fecha}
//
//Novedades:
//Cámaras sin conexión:
//${MONITOREO.camaras_sin_conexion.join('\n')}`;
//}
//
//// ---------------- CLIENT ----------------
//
//const client = new Client({
//    authStrategy: new LocalAuth(),
//    puppeteer: {
//        headless: true,
//        args: ['--no-sandbox', '--disable-setuid-sandbox']
//    }
//});
//
//client.on('qr', qr => {
//    console.log('📱 Escanea el QR:');
//    qrcode.generate(qr, { small: true });
//});
//
//client.on('ready', () => {
//    console.log('WhatsApp conectado');
//    console.log('Escuchando mensajes para obtener ID de grupos...');
//    console.log('Esperando capturas nuevas...');
//    
//    // Watcher de capturas (NO ENVÍA AÚN)
//    const watcher = chokidar.watch(CAPTURES_DIR, {
//        ignoreInitial: true,
//        awaitWriteFinish: true
//    });
//
//    watcher.on('add', filePath => {
//        console.log('Captura detectada:', filePath);
//    });
//});
//
//// ---------------- ESCUCHAR MENSAJES ----------------
//
//client.on('message', async msg => {
//    const chat = await msg.getChat();
//
//    if (chat.isGroup) {
//        console.log('==============================');
//        console.log('MENSAJE EN GRUPO');
//        console.log('Nombre del grupo:', chat.name);
//        console.log('ID del grupo:', chat.id._serialized);
//        console.log('Enviado por:', msg.author);
//        console.log('Mensaje:', msg.body);
//        console.log('==============================');
//    }
//});
//
//client.initialize();
//


