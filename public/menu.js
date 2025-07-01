// public/menu.js

const btnIniciar = document.getElementById("btn-iniciar-juego");

btnIniciar.addEventListener("click", () => {
  // Simplemente redirigimos a la página del juego. ¡Nada más!
  window.location.href = './game/game.html';
});