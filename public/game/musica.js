// public/game/musica.js

// Creamos un elemento de audio. Es mejor hacerlo aquí una sola vez.
const musicaDeFondo = new Audio('../assets/music/soundtrack.mp3'); // <-- ¡IMPORTANTE! Cambia esto por tu archivo de música.
musicaDeFondo.loop = true; // Para que la música se repita
musicaDeFondo.volume = 0.5; // Ajusta el volumen (0.0 a 1.0)

// Exportamos la función para que otros archivos puedan usarla
export function iniciarMusica() {
  console.log("Intentando reproducir música...");
  // El método .play() devuelve una promesa. Es buena práctica manejarla.
  musicaDeFondo.play().catch(error => {
    // Los navegadores modernos a veces bloquean la reproducción automática
    // si no hay una interacción previa del usuario EN ESA PÁGINA.
    console.error("La reproducción automática fue bloqueada por el navegador:", error);
    // Podrías mostrar un botón de "Activar sonido" aquí si esto ocurre.
  });
}

// Opcional: una función para detener la música si la necesitas
export function detenerMusica() {
  musicaDeFondo.pause();
  musicaDeFondo.currentTime = 0; // Reinicia la canción al principio
}