const horaActual = new Date().toTimeString().slice(0, 5);

console.log('Hora actual:', horaActual);

const MONITOREO = {
    responsable: 'Lenin Alomoto',
    lugar: 'G1',
    fecha: 'domingo 21/12/2025',

    horarios: [
        { inicio: '18:00', fin: '00:00' }
        // puedes agregar más bloques aquí
    ],

    camaras_sin_conexion: [
        'Camera 01_DS-7104HGHI-K1',
        'Ambato y Bolívar_DS-7104HGHI-K1',
        'Camera 01_DS-7104HGHI-K1'
    ]
};

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

function obtenerBloqueActual(horaActual) {
    return MONITOREO.horarios.find(
        h => horaEnRango(horaActual, h.inicio, h.fin)
    );
}


const bloque = obtenerBloqueActual(horaActual);

console.log('Bloque actual:', bloque);
