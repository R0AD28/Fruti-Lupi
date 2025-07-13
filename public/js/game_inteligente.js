import { iniciarMusica } from './musica.js';

iniciarMusica();

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
let puntajeGuardado = false; // ← inicializa en falso



let puntaje = 0;
const valorPuntaje = document.getElementById("valor-puntaje");
const puntajeFinal = document.getElementById("puntaje-final");
const nombreInput = document.getElementById("nombre-jugador");
const botonGuardar = document.getElementById("guardar-puntaje");
const cuerpoTabla = document.getElementById("tabla-body");



const pantallaFinal = document.getElementById("game-over-screen");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnMenu = document.getElementById("btn-menu");

btnReiniciar.addEventListener("click", () => {
  window.location.reload();
});

btnMenu.addEventListener("click", () => {
  window.location.href = "/";
});



function mostrarFrutaPensada() {
  if (frutaEnPantalla) return;
  frutaEnPantalla = true;

  pensamientoDiv.style.display = 'flex';
  frutaPensadaImg.classList.remove('animada');

  let cambios = 0;
  const maxCambios = 12;
  const intervalo = setInterval(() => {
    const frutaTemp = frutas[Math.floor(Math.random() * frutas.length)];
    frutaPensadaImg.src = `/assets/${frutaTemp}_pensada.png`;
    cambios++;

    if (cambios >= maxCambios) {
      clearInterval(intervalo);

      const frutaFinal = frutas[Math.floor(Math.random() * frutas.length)];
      frutaActual = frutaFinal;
      frutaPensadaImg.src = `/assets/${frutaFinal}_pensada.png`;

      void frutaPensadaImg.offsetWidth;
      frutaPensadaImg.classList.add('animada');
      iniciarBarraTiempo();
    }
  }, 100);
}


setTimeout(() => {
  mostrarFrutaPensada();
}, 2000);

function verificarFruta(frutaPresionada) {
  if (jugadaEnCurso) return;
  jugadaEnCurso = true;
  
  pausarBarraTiempo();

  const tiempoReaccion = tiempoMaximo - tiempoRestante;

  const esAcierto = (frutaPresionada === frutaActual);
  const frutaImg = [...frutasEnPantalla].find(img => img.dataset.fruta === frutaPresionada);

  if (!frutaImg) {
    jugadaEnCurso = false;
    return;
  }


  // Si no es acierto, temblor y actualización de vidas
  if (!esAcierto) {
    fetch(`${ESP32_IP}/error`).catch(err => console.warn("Error al enviar error:", err));
    frutasEnPantalla.forEach(el => {
      el.classList.add('temblor');
      setTimeout(() => el.classList.remove('temblor'), 400);
    });
    vidasRestantes--;
    if (vidasRestantes >= 0) {
      vidas[vidasRestantes].style.visibility = 'hidden';
    }
  } else {
     fetch(`${ESP32_IP}/acierto`).catch(err => console.warn("Error al enviar acierto:", err));
  }
  
  // Realiza la animación de explosión
  animarExplosion(frutaImg, () => {
    
    if (vidasRestantes === 0) {
      pantallaFinal.classList.remove("oculto");
      puntajeFinal.textContent = puntaje;
      pausarJuegoCompleto();
      terminarJuego();
      return;
    }
    if (vidasRestantes <= 0) {
            pausarJuegoCompleto();
            terminarJuego();
            return;
        }

    
    if (esAcierto) {
      puntaje += 50;
      valorPuntaje.textContent = puntaje;
      pedirAdaptacionDelJuego(tiempoReaccion);
    }

    
    frutaEnPantalla = false;
    setTimeout(() => {
      mostrarFrutaPensada(); // Esto reiniciará la barra de tiempo para la nueva fruta
      jugadaEnCurso = false;  // Desbloquea para la siguiente jugada
    }, 100);
  });
}

async function pedirAdaptacionDelJuego(tiempoReaccion) {
    const estadoActual = {
        puntaje: puntaje,
        vidas: vidasRestantes,
        tiempo_reaccion: tiempoReaccion
    };

    try {
        const response = await fetch('/ia/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(estadoActual)
        });
        const result = await response.json();

        if (result.prediction) {
            console.log("Decisión de la IA:", result.prediction);
            // Ahora, adapta el juego basado en la predicción
            adaptarJuego(result.prediction);
        }
    } catch (error) {
        console.error("Error al contactar al servidor de IA:", error);
    }
}

// NUEVA FUNCIÓN para cambiar las reglas del juego
function adaptarJuego(accion) {
    switch(accion) {
        case 'aumentar_tiempo':
            tiempoMaximo = Math.min(10, tiempoMaximo + 1); // Aumenta el tiempo, con un máximo de 10s
            console.log("Tiempo máximo ahora:", tiempoMaximo);
            break;
        case 'reducir_tiempo':
            tiempoMaximo = Math.max(3, tiempoMaximo - 0.5); // Reduce el tiempo, con un mínimo de 3s
            console.log("Tiempo máximo ahora:", tiempoMaximo);
            break;
        case 'fruta_extra':
            // Lógica para añadir una fruta extra en la pantalla
            break;
        // ... otras acciones que tu modelo pueda predecir
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


  const popSound = new Audio("/assets/music/pop_sound.mp3");
  popSound.volume = 0.6;
  popSound.play().catch(err => console.error("Error al reproducir sonido pop:", err));

  const originalSrc = frutaImg.src;

  let index = 0;
  const intervalo = setInterval(() => {
    if (index < frames.length) {
      frutaImg.src = `/assets/${frames[index]}.png`;
      index++;
    } else {
      clearInterval(intervalo);
      frutaImg.src = originalSrc;
      if (callback) callback();
    }
  }, 50);
}


frutasEnPantalla.forEach((frutaHTML) => {
  frutaHTML.addEventListener('click', () => {
    const frutaPresionada = frutaHTML.dataset.fruta;
    verificarFruta(frutaPresionada);
  });
});

// IP del ESP32
const ESP32_IP = "http://192.168.137.128"; // Ip del arduino

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

async function guardarPuntajeEnServidor(puntos) {
  try {
    const response = await fetch('/api/save-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ puntos: puntos }), // Enviamos el puntaje en formato JSON
    });

    const data = await response.json();

    if (data.success) {
      console.log('¡Puntaje guardado exitosamente en el servidor!');
      // Retroalimentación visual para el usuario
      botonGuardar.textContent = '¡Guardado!';
      botonGuardar.disabled = true; // Deshabilitar para no guardar dos veces
      botonGuardar.style.backgroundColor = '#5d4037'; // Cambiar color a uno oscuro
    } else {
      console.error('Error al guardar el puntaje:', data.message);
      alert('Hubo un problema al guardar tu puntaje. Intenta de nuevo.');
    }
  } catch (error) {
    console.error('Error de red al intentar guardar el puntaje:', error);
    alert('No se pudo conectar con el servidor para guardar el puntaje.');
  }
}


botonGuardar.addEventListener("click", () => {
  guardarPuntajeEnServidor(puntaje);
});


btnReiniciar.addEventListener("click", () => {
  if (!puntajeGuardado) {
    const confirmar = confirm("⚠️ ¡No has guardado tu puntaje! ¿Seguro que quieres reiniciar?");
    if (!confirmar) return;
  }
  window.location.reload();
});



let tiempoMaximo = 5;
let tiempoRestante = tiempoMaximo;
let intervaloTiempo;
const barraTiempo = document.getElementById("barra-tiempo");

function iniciarBarraTiempo() {
  clearInterval(intervaloTiempo);
  tiempoRestante = tiempoMaximo;
  actualizarBarra();

  intervaloTiempo = setInterval(() => {
    tiempoRestante -= 0.1;
    actualizarBarra();

    if (tiempoRestante <= 0) {
      clearInterval(intervaloTiempo);
      perderVidaPorTiempo();
    }
  }, 100);
}

function actualizarBarra() {
  const porcentaje = Math.max(0, (tiempoRestante / tiempoMaximo) * 100);
  barraTiempo.style.width = `${porcentaje}%`;
}

function perderVidaPorTiempo() {
  frutaEnPantalla = false;
  vidasRestantes--;
  if (vidasRestantes >= 0) {
    vidas[vidasRestantes].style.visibility = 'hidden';
  }
   if (vidasRestantes <= 0) {
            pausarJuegoCompleto();
            terminarJuego();
            return;
        }

  if (vidasRestantes === 0) {
    pantallaFinal.classList.remove("oculto");
    puntajeFinal.textContent = puntaje;
    pausarJuegoCompleto();
    terminarJuego();
  } else {
    setTimeout(() => {
      mostrarFrutaPensada();
      jugadaEnCurso = false;
    }, 100);
  }
}
function pausarBarraTiempo() {
  clearInterval(intervaloTiempo);
}

function reanudarBarraTiempo() {
  iniciarBarraTiempo();
}

function terminarJuego() {
    puntajeFinal.textContent = puntaje;
    pantallaFinal.classList.remove("oculto");
}

function pausarJuegoCompleto() {
  pausarBarraTiempo();     
  puedeLeer = false;        
  frutaEnPantalla = true;   
  jugadaEnCurso = true;     
}
