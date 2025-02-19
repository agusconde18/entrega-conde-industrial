const http = require('http'); // o 'https' si es una URL HTTPS

const url = 'http://192.168.0.1'; // Reemplaza con la URL que quieres estresar
const intervalo = 5000; // Intervalo en milisegundos (5 segundos)
const numSolicitudes = 100; // Número de solicitudes a realizar

let totalBytesTransferidos = 0;
let numSolicitudesCompletadas = 0;

function realizarSolicitud() {
  const startTime = Date.now();

  http.get(url, (res) => {
    let datos = '';

    res.on('data', (chunk) => {
      datos += chunk;
    });

    res.on('end', () => {
      const endTime = Date.now();
      const tiempoTranscurrido = endTime - startTime;
      const bytesTransferidos = datos.length;

      totalBytesTransferidos += bytesTransferidos;
      numSolicitudesCompletadas++;

      if (numSolicitudesCompletadas === numSolicitudes) {
        calcularYMostrarVelocidadPromedio();
      }
    });
  }).on('error', (err) => {
    console.error('Error en la solicitud:', err);
  });
}

function calcularYMostrarVelocidadPromedio() {
  const velocidadPromedio = totalBytesTransferidos / (intervalo / 1000); // Bytes por segundo
  console.log(`Velocidad promedio: ${velocidadPromedio.toFixed(2)} bytes/segundo`);

  // Reiniciar contadores para el siguiente intervalo
  totalBytesTransferidos = 0;
  numSolicitudesCompletadas = 0;
}

// Iniciar el intervalo para mostrar las velocidades promedio
setInterval(() => {
  for (let i = 0; i < numSolicitudes; i++) {
    realizarSolicitud();
  }
}, intervalo);