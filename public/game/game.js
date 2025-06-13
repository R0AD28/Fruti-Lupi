const frutas = ['naranja', 'sandia', 'uva', 'aguacate'];

const pensamientoDiv = document.getElementById('pensamiento');
const frutaPensadaImg = document.getElementById('fruta-pensada');
const frutasEnPantalla = document.querySelectorAll('.fruta');
const vidas = document.querySelectorAll('.vida');

let frutaActual = null;
let vidasRestantes = 3;


function mostrarFrutaPensada() {
  const frutaAleatoria = frutas[Math.floor(Math.random() * frutas.length)];
  frutaActual = frutaAleatoria;
  frutaPensadaImg.src = `../assets/${frutaAleatoria}_pensada.png`;
  pensamientoDiv.style.display = 'flex';
}


setTimeout(() => {
  mostrarFrutaPensada();
}, 2000);

frutasEnPantalla.forEach((frutaHTML) => {
  frutaHTML.addEventListener('click', () => {
    //const ruta = frutaHTML.src;
    //const frutaPresionada = frutas.find(nombre => ruta.includes(`${nombre}_burbuja`));

    const frutaPresionada = frutaHTML.dataset.fruta;

    if (frutaPresionada === frutaActual) {
      mostrarFrutaPensada();
    } else {

      vidasRestantes--;
      if (vidasRestantes >= 0) {
        vidas[vidasRestantes].style.visibility = 'hidden';
      }

      if (vidasRestantes === 0) {
        alert('¡Juego terminado!');
        window.location.reload();
      } else {
        mostrarFrutaPensada();
      }
    }
    console.log('Presionaste:', frutaPresionada, '| Debías presionar:', frutaActual);
  });
});
