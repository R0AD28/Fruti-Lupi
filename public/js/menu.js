const btnIniciar = document.getElementById("btn-iniciar-juego");
const btnInteligente = document.getElementById("btn-iniciar-inteligente");
const btnCambiar = document.getElementById("btn-cambiar");



btnIniciar.addEventListener("click", () => {

  window.location.href = './game';
});

btnInteligente.addEventListener("click", () => {
    window.location.href = '/game-inteligente';
});

btnCambiar.addEventListener("click", () => {
    window.location.href = '/';
});

