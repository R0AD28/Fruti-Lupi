const frutas = ['naranja', 'sandia', 'uva', 'aguacate'];

const pensamientoDiv = document.getElementById('pensamiento');
const frutaPensadaImg = document.getElementById('fruta-pensada');
const frutasEnPantalla = document.querySelectorAll('.fruta');
const vidas = document.querySelectorAll('.vida');

let frutaActual = null;
let vidasRestantes = 3;

let frutaEnPantalla = false; // Evita mostrar múltiples frutas
let puedeLeer = true;        // Controla lectura del ESP32
let jugadaEnCurso = false;   // Bloquea múltiples ejecuciones al presionar fruta

function mostrarFrutaPensada() {
  if (frutaEnPantalla) return;
  frutaEnPantalla = true;

  const frutaAleatoria = frutas[Math.floor(Math.random() * frutas.length)];
  frutaActual = frutaAleatoria;
  frutaPensadaImg.src = `../assets/${frutaAleatoria}_pensada.png`;

  frutaPensadaImg.classList.remove('animada');
  void frutaPensadaImg.offsetWidth;
  frutaPensadaImg.classList.add('animada');

  pensamientoDiv.style.display = 'flex';
}

setTimeout(() => {
  mostrarFrutaPensada();
}, 2000);

function verificarFruta(frutaPresionada) {
  if (jugadaEnCurso) return; // Evitar múltiples respuestas rápidas
  jugadaEnCurso = true;

  const frutaCorrecta = frutaActual;

  console.log('Presionaste:', frutaPresionada, '| Debías presionar:', frutaCorrecta);

  frutaEnPantalla = false; // Para mostrar nueva fruta

  if (frutaPresionada === frutaCorrecta) {
    setTimeout(() => {
      mostrarFrutaPensada();
      jugadaEnCurso = false;
    }, 300);
  } else {
    vidasRestantes--;
    if (vidasRestantes >= 0) {
      vidas[vidasRestantes].style.visibility = 'hidden';
    }

    if (vidasRestantes === 0) {
      alert('¡Juego terminado!');
      window.location.reload();
    } else {
      setTimeout(() => {
        mostrarFrutaPensada();
        jugadaEnCurso = false;
      }, 300);
    }
  }
}

frutasEnPantalla.forEach((frutaHTML) => {
  frutaHTML.addEventListener('click', () => {
    const frutaPresionada = frutaHTML.dataset.fruta;
    verificarFruta(frutaPresionada);
  });
});

// IP del ESP32
const ESP32_IP = "http://192.168.142.71"; // Ip del arduino

setInterval(() => {
  if (!puedeLeer) return;

  fetch(`${ESP32_IP}/estado`)
    .then(response => response.text())
    .then(frutaPresionada => {
      console.log("Respuesta desde ESP32:", frutaPresionada);

      if (frutaPresionada !== "Ninguno") {
        puedeLeer = false;
        verificarFruta(frutaPresionada.toLowerCase());

        setTimeout(() => {
          puedeLeer = true;
        }, 700); // Espera suficiente para evitar rebotes del ESP32
      }
    })
    .catch(error => console.error("Error al obtener estado desde ESP32:", error));
}, 200); // Consulta rápida para captar pulsaciones a tiempo
