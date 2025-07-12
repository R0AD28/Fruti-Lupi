const musicaDeFondo = new Audio('../assets/music/soundtrack.mp3');
musicaDeFondo.loop = true;
musicaDeFondo.volume = 0.6;

export function iniciarMusica() {
  console.log("Intentando reproducir música...");

  musicaDeFondo.play().catch(error => {

    console.error("La reproducción automática fue bloqueada por el navegador:", error);

  });
}

export function detenerMusica() {
  musicaDeFondo.pause();
  musicaDeFondo.currentTime = 0;
}