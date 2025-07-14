const btnIniciar = document.getElementById("btn-iniciar-juego");
const btnInteligente = document.getElementById("btn-iniciar-inteligente");
const btnCambiar = document.getElementById("btn-cambiar");

const btnLeaderboard = document.getElementById('btn-leaderboard');
const leaderboardModal = document.getElementById('leaderboard-modal');
const closeLeaderboardModal = document.getElementById('close-leaderboard-modal');
const leaderboardBody = document.getElementById('leaderboard-table-body');



btnIniciar.addEventListener("click", () => {

  window.location.href = './game';
});

btnInteligente.addEventListener("click", () => {
    window.location.href = '/game-inteligente';
});

/*
btnCambiar.addEventListener("click", () => {
    window.location.href = '/';
});*/


async function fetchAndShowLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const scores = await response.json();

        // Limpiar tabla anterior
        leaderboardBody.innerHTML = '';

        if (scores.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="3">Aún no hay puntajes. ¡Sé el primero!</td></tr>';
            return;
        }

        // Llenar la tabla con los nuevos datos
        scores.forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.nombre}</td>
                <td>${score.puntos}</td>
            `;
            leaderboardBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error al obtener el leaderboard:", error);
        leaderboardBody.innerHTML = '<tr><td colspan="3">No se pudieron cargar los puntajes.</td></tr>';
    }
}

// Evento para abrir el modal
if (btnLeaderboard) {
    btnLeaderboard.addEventListener('click', () => {
        fetchAndShowLeaderboard(); // Cargar los datos cada vez que se abre
        leaderboardModal.classList.add('visible');
    });
}

// Eventos para cerrar el modal
if (closeLeaderboardModal) {
    closeLeaderboardModal.addEventListener('click', () => {
        leaderboardModal.classList.remove('visible');
    });
}

if (leaderboardModal) {
    leaderboardModal.addEventListener('click', (e) => {
        // Cierra si se hace clic en el fondo oscuro
        if (e.target === leaderboardModal) {
            leaderboardModal.classList.remove('visible');
        }
    });
}

