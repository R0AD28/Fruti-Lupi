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

  pensamientoDiv.style.display = 'flex';
  frutaPensadaImg.classList.remove('animada');

  let cambios = 0;
  const maxCambios = 12; 
  const intervalo = setInterval(() => {
    const frutaTemp = frutas[Math.floor(Math.random() * frutas.length)];
    frutaPensadaImg.src = `../assets/${frutaTemp}_pensada.png`;
    cambios++;

    if (cambios >= maxCambios) {
      clearInterval(intervalo);

      const frutaFinal = frutas[Math.floor(Math.random() * frutas.length)];
      frutaActual = frutaFinal;
      frutaPensadaImg.src = `../assets/${frutaFinal}_pensada.png`;

      void frutaPensadaImg.offsetWidth;
      frutaPensadaImg.classList.add('animada');
    }
  }, 100);
}


setTimeout(() => {
  mostrarFrutaPensada();
}, 2000);

function verificarFruta(frutaPresionada) {
  if (jugadaEnCurso) return;
  jugadaEnCurso = true;

  const frutaCorrecta = frutaActual;
  frutaEnPantalla = false;

  console.log('Presionaste:', frutaPresionada, '| Debías presionar:', frutaCorrecta);

  const frutaImg = [...frutasEnPantalla].find(img => img.dataset.fruta === frutaPresionada);

  if (frutaImg) {
    animarExplosion(frutaImg, () => {
      if (frutaPresionada === frutaCorrecta) {
        setTimeout(() => {
          mostrarFrutaPensada();
          jugadaEnCurso = false;
        }, 100);
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
          }, 100);
        }
      }
    });
  } else {
    jugadaEnCurso = false;
  }
}


function animarExplosion(frutaImg, callback) {
  const frames = [
    "bubble_pop_frame_02",
    "bubble_pop_frame_03",
    "bubble_pop_frame_04",
    "bubble_pop_frame_05",
    "bubble_pop_frame_06"
  ];

  const originalSrc = frutaImg.src;

  let index = 0;
  const intervalo = setInterval(() => {
    if (index < frames.length) {
      frutaImg.src = `../assets/${frames[index]}.png`;
      index++;
    } else {
      clearInterval(intervalo);
      frutaImg.src = originalSrc; // opcional si quieres volver a mostrar fruta
      if (callback) callback();
    }
  }, 50); // velocidad de cambio entre frames (puedes ajustar)
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
