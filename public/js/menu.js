const btnIniciar = document.getElementById("btn-iniciar-juego");
const btnInteligente = document.getElementById("btn-iniciar-inteligente");


btnIniciar.addEventListener("click", () => {

  window.location.href = './game';
});

btnInteligente.addEventListener("click", () => {
    window.location.href = '/game-inteligente';
});