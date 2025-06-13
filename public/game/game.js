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


  frutaPensadaImg.classList.remove('animada');
  void frutaPensadaImg.offsetWidth;
  frutaPensadaImg.classList.add('animada');

  pensamientoDiv.style.display = 'flex';
}



setTimeout(() => {
  mostrarFrutaPensada();
}, 2000);

frutasEnPantalla.forEach((frutaHTML) => {
    frutaHTML.addEventListener('click', () => {
      const frutaPresionada = frutaHTML.dataset.fruta;
      const frutaCorrecta = frutaActual; // Guardar antes de cambiar
  
      console.log('Presionaste:', frutaPresionada, '| Debías presionar:', frutaCorrecta);
  
      if (frutaPresionada === frutaCorrecta) {
        setTimeout(mostrarFrutaPensada, 300);
      } else {
        vidasRestantes--;
        if (vidasRestantes >= 0) {
          vidas[vidasRestantes].style.visibility = 'hidden';
        }
  
        if (vidasRestantes === 0) {
          alert('¡Juego terminado!');
          window.location.reload();
        } else {
          setTimeout(mostrarFrutaPensada, 300);
        }
      }
    });
  });
  
