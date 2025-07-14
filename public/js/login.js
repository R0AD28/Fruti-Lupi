document.addEventListener('DOMContentLoaded', () => {
    const userSelectList = document.getElementById('user-select-list');
    const loginForm = document.getElementById('login-form');
    
    const openModalBtn = document.getElementById('open-register-modal');
    const modal = document.getElementById('register-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('mensaje-error');

    // --- 1. Cargar y llenar la lista desplegable de usuarios ---
    async function fetchAndDisplayUsers() {
        try {
            const response = await fetch('/api/users');
            const users = await response.json();
            
            // Limpiar opciones antiguas, manteniendo la primera opción deshabilitada
            userSelectList.innerHTML = '<option value="" disabled selected>Selecciona tu nombre...</option>';

            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.nombre;
                option.textContent = user.nombre;
                userSelectList.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar los usuarios:', error);
        }
    }

    // --- 2. Manejar el envío del formulario de login ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombreSeleccionado = userSelectList.value;

        if (!nombreSeleccionado) {
            alert('Por favor, selecciona un jugador de la lista.');
            return;
        }

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombreSeleccionado })
        });

        const data = await response.json();
        if (data.success) {
            window.location.href = '/menu'; // Redirige al menú principal
        } else {
            alert('Hubo un error al iniciar sesión. Intenta de nuevo.');
        }
    });

    // --- 3. Lógica para el modal de registro (sin cambios, ya es correcta) ---
    openModalBtn.addEventListener('click', () => {
        modal.classList.add('visible');
    });

    function hideModal() {
        modal.classList.remove('visible');
        errorMessage.textContent = '';
        registerForm.reset();
    }
    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('register-nombre').value;
        const edad = document.getElementById('register-edad').value;

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, edad })
        });

        const data = await response.json();
        if (data.success) {
            hideModal();
            fetchAndDisplayUsers();
        } else {
            errorMessage.textContent = data.message;
        }
    });

    // Cargar los usuarios al iniciar la página
    fetchAndDisplayUsers();
});