// musica.js
let musicaFondo;

window.addEventListener("DOMContentLoaded", () => {
  if (!window.musicaFondoGlobal) {
    musicaFondo = new Audio("/assets/music/soundtrack.mp3"); 
    musicaFondo.loop = true;
    musicaFondo.volume = 0.5;
    musicaFondo.play().catch((e) => console.warn("Autoplay bloqueado:", e));

    // Guarda en global para no reiniciar al navegar
    window.musicaFondoGlobal = musicaFondo;
  } else {
    musicaFondo = window.musicaFondoGlobal;
  }
});
