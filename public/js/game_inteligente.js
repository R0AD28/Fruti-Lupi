import { iniciarMusica } from './musica.js';

iniciarMusica();

const FRUTAS = ['aguacate', 'sandia', 'uva', 'naranja'];
const FRUTAS_CODIFICADAS = { 'aguacate': 0, 'sandia': 1, 'uva': 2, 'naranja': 3 };
const ESP32_IP = "http://192.168.137.134";
const TIEMPO_BLOQUE_IA = 10000;
const PUNTOS_POR_ACIERTO = 50;

const pensamientoDiv = document.getElementById('pensamiento');
const frutaPensadaImg = document.getElementById('fruta-pensada');
const frutasEnPantalla = document.querySelectorAll('.fruta');
const vidasUI = document.querySelectorAll('.vida');
const valorPuntaje = document.getElementById("valor-puntaje");
const barraTiempo = document.getElementById("barra-tiempo");
const iaMessageContainer = document.getElementById("ia-message-container");
const pantallaFinal = document.getElementById("game-over-screen");
const puntajeFinal = document.getElementById("puntaje-final");
const botonGuardar = document.getElementById("guardar-puntaje");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnMenu = document.getElementById("btn-menu");

let puntaje = 0;
let vidasRestantes = 3;
let juegoTerminado = false;
let jugadaEnCurso = false;
let puedeLeerESP32 = true;
let frutaActual = null;
let frutaEnPantalla = false;

let tiempoTotalJuego = 0;
let velocidadJuego = 2;
let tiempoRespuesta = 5.0;
let historialErroresFruta = { 'aguacate': 0, 'sandia': 0, 'uva': 0, 'naranja': 0 };

let erroresBloque = 0;
let aciertosBloque = 0;
let frutasMostradasBloque = 0;

let intervaloBarraTiempo;
let intervaloIA;

const trofeosUI = document.querySelectorAll('.trofeo');
let totalAciertos = 0;
let trofeosGanados = 0;


function inicializarJuego() {
  intervaloIA = setInterval(cicloIA, TIEMPO_BLOQUE_IA);
  setInterval(leerEstadoESP32, 200);

  frutasEnPantalla.forEach(el =>
    el.addEventListener('click', () => procesarJugada(el.dataset.fruta, 'click'))
  );

  btnReiniciar.addEventListener('click', () => window.location.reload());
  btnMenu.addEventListener('click', () => window.location.href = "/menu");
  botonGuardar.addEventListener('click', () => guardarPuntajeEnServidor(puntaje));

  setTimeout(mostrarFrutaPensada, 1500);
}

function mostrarFrutaPensada() {
  if (frutaEnPantalla || juegoTerminado) return;
  frutaEnPantalla = true;
  frutasMostradasBloque++;

  pensamientoDiv.style.display = 'flex';
  frutaPensadaImg.classList.remove('animada');
  let cambios = 0;
  const maxCambios = 12;

  const animPensamiento = setInterval(() => {
    frutaPensadaImg.src = `/assets/${FRUTAS[Math.floor(Math.random() * FRUTAS.length)]}_pensada.png`;
    if (++cambios >= maxCambios) {
      clearInterval(animPensamiento);
      frutaActual = FRUTAS[Math.floor(Math.random() * FRUTAS.length)];
      frutaPensadaImg.src = `/assets/${frutaActual}_pensada.png`;
      void frutaPensadaImg.offsetWidth;
      frutaPensadaImg.classList.add('animada');
      iniciarBarraTiempo();
    }
  }, 100);
}

function procesarJugada(frutaPresionada, origen) {
  if (jugadaEnCurso || juegoTerminado) return;
  jugadaEnCurso = true;

  if (origen === 'esp32') puedeLeerESP32 = false;

  pausarBarraTiempo();

  const esAcierto = (frutaPresionada === frutaActual);

  if (esAcierto) {
    puntaje += PUNTOS_POR_ACIERTO;
    aciertosBloque++;
    valorPuntaje.textContent = puntaje;

    totalAciertos++;
    verificarTrofeos()

    fetch(`${ESP32_IP}/acierto`).catch(e => console.warn("Error enviando acierto:", e));
  } else {
    vidasRestantes--;
    erroresBloque++;
    if (frutaActual) historialErroresFruta[frutaActual]++;
    actualizarVidasUI();

    frutasEnPantalla.forEach(el => {
      el.classList.add('temblor');
      setTimeout(() => el.classList.remove('temblor'), 400);
    });

    fetch(`${ESP32_IP}/error`).catch(e => console.warn("Error enviando error:", e));
  }

  const frutaImg = [...frutasEnPantalla].find(img => img.dataset.fruta === frutaPresionada);
  animarExplosion(frutaImg, finalizarTurno);
}

function finalizarTurno() {
  if (vidasRestantes <= 0) {
    terminarJuego();
    return;
  }

  frutaEnPantalla = false;
  jugadaEnCurso = false;

  if (!puedeLeerESP32) {
    setTimeout(() => {
      puedeLeerESP32 = true;
    }, 700);
  }

  setTimeout(mostrarFrutaPensada, velocidadJuego * 1000);
}

function iniciarBarraTiempo() {
  pausarBarraTiempo();
  let tiempoRestante = tiempoRespuesta;

  intervaloBarraTiempo = setInterval(() => {
    if (juegoTerminado) return clearInterval(intervaloBarraTiempo);
    tiempoRestante -= 0.1;
    actualizarBarraUI(tiempoRestante);
    if (tiempoRestante <= 0) {
      clearInterval(intervaloBarraTiempo);
      perderVidaPorTiempo();
    }
  }, 100);
}

function actualizarBarraUI(tiempo) {
  const porcentaje = Math.max(0, (tiempo / tiempoRespuesta) * 100);
  barraTiempo.style.width = `${porcentaje}%`;
}

function pausarBarraTiempo() {
  clearInterval(intervaloBarraTiempo);
}

function perderVidaPorTiempo() {
  if (jugadaEnCurso || juegoTerminado) return;
  jugadaEnCurso = true;

  erroresBloque++;
  if (frutaActual) historialErroresFruta[frutaActual]++;
  vidasRestantes--;
  actualizarVidasUI();

  frutasEnPantalla.forEach(el => {
    el.classList.add('temblor');
    setTimeout(() => el.classList.remove('temblor'), 400);
  });

  fetch(`${ESP32_IP}/error`).catch(e => console.warn("Error enviando error:", e));

  finalizarTurno();
}

function cicloIA() {
  if (juegoTerminado) return;
  const estadoJuego = recolectarDatosParaIA();
  pedirAdaptacionDelJuego(estadoJuego);
}

function recolectarDatosParaIA() {
  tiempoTotalJuego += 10;

  let frutaDominante = 0, maxErrores = 0;
  for (const fruta in historialErroresFruta) {
    if (historialErroresFruta[fruta] > maxErrores) {
      maxErrores = historialErroresFruta[fruta];
      frutaDominante = FRUTAS_CODIFICADAS[fruta];
    }
  }

  const datosParaIA = {
    tiempo_juego: tiempoTotalJuego,
    frutas_mostradas: frutasMostradasBloque,
    errores_10s: erroresBloque,
    aciertos_10s: aciertosBloque,
    vidas_restantes: vidasRestantes,
    velocidad_actual: velocidadJuego,
    fruta_dominante: frutaDominante,
    errores_fruta: maxErrores
  };

  console.log("📊 Datos IA:", datosParaIA);
  return datosParaIA;
}

async function pedirAdaptacionDelJuego(estadoJuego) {
  mostrarMensajeIA("🤖 Analizando tu juego...");

  try {
    const response = await fetch('/ia/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(estadoJuego)
    });
    const result = await response.json();
    if (result.prediction) {
      adaptarJuego(result.prediction);
      reiniciarContadoresBloque();
    } else if (result.error) {
      console.error("Error IA:", result.error);
    }
  } catch (error) {
    console.error("Error de red IA:", error);
  }
}

function adaptarJuego(accion) {
  let mensaje = "";
  switch (accion) {
    case 'aumentar_velocidad':
      velocidadJuego = Math.max(0.5, velocidadJuego - 0.5);
      tiempoRespuesta = Math.max(1.5, tiempoRespuesta - 0.5);
      mensaje = "¡Vas muy bien! Aumentando ritmo 🔥";
      break;
    default:
      mensaje = "¡Sigue así! Manteniendo ritmo 👍";
  }
  mostrarMensajeIA(mensaje, 2500);
}

function reiniciarContadoresBloque() {
  erroresBloque = 0;
  aciertosBloque = 0;
  frutasMostradasBloque = 0;
}

function leerEstadoESP32() {
  if (!puedeLeerESP32 || juegoTerminado) return;
  fetch(`${ESP32_IP}/estado`)
    .then(res => res.text())
    .then(fruta => {
      if (fruta && fruta !== "Ninguno") {
        procesarJugada(fruta.toLowerCase(), 'esp32');
      }
    })
    .catch(e => {});
}

function mostrarMensajeIA(texto, duracion = 1500) {
  if (!iaMessageContainer) return;
  iaMessageContainer.textContent = texto;
  iaMessageContainer.classList.add('visible');
  setTimeout(() => iaMessageContainer.classList.remove('visible'), duracion);
}

function actualizarVidasUI() {
  vidasUI.forEach((v, i) =>
    v.style.visibility = i < vidasRestantes ? 'visible' : 'hidden'
  );
}

function animarExplosion(frutaImg, callback) {
  if (!frutaImg) { if (callback) callback(); return; }
  const frames = [
    "bubble_pop_frame_02",
    "bubble_pop_frame_03",
    "bubble_pop_frame_04",
    "bubble_pop_frame_05",
    "bubble_pop_frame_06"
  ];
  const popSound = new Audio("/assets/music/pop_sound.mp3");
  popSound.volume = 0.6;
  popSound.play().catch(e => {});

  const originalSrc = frutaImg.src;
  let index = 0;
  const anim = setInterval(() => {
    if (index < frames.length) frutaImg.src = `/assets/${frames[index++]}.png`;
    else {
      clearInterval(anim);
      frutaImg.src = originalSrc;
      if (callback) callback();
    }
  }, 50);
}

async function guardarPuntajeEnServidor(puntos) {
  try {
    const response = await fetch('/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puntos })
    });
    const data = await response.json();
    if (data.success) {
      botonGuardar.textContent = '¡Guardado!';
      botonGuardar.disabled = true;
    } else {
      alert(`Hubo un problema: ${data.message}`);
    }
  } catch (error) {
    alert('No se pudo conectar para guardar el puntaje.');
  }
}

function pausarJuegoCompleto() {
  juegoTerminado = true;
  clearInterval(intervaloIA);
  pausarBarraTiempo();
  puedeLeerESP32 = false;
  jugadaEnCurso = true;
}

function terminarJuego() {
  if (juegoTerminado) return;
  pausarJuegoCompleto();
  cicloIA();
  puntajeFinal.textContent = puntaje;
  pantallaFinal.classList.remove("oculto");
}

function verificarTrofeos() {
    const umbrales = [10, 25, 50]; // Umbrales para ganar trofeos
    
    if (trofeosGanados < 3 && totalAciertos >= umbrales[trofeosGanados]) {
        trofeosUI[trofeosGanados].classList.remove('inactivo');
        trofeosGanados++;
    }
}
inicializarJuego();
