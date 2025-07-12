document.addEventListener('DOMContentLoaded', () => {
    const userGrid = document.getElementById('user-selection-grid');
    const openModalBtn = document.getElementById('open-register-modal');
    const modal = document.getElementById('register-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('mensaje-error');

    async function fetchAndDisplayUsers() {
        try {
            const response = await fetch('/api/users');
            const users = await response.json();
            
            userGrid.innerHTML = '';

            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'user-card';
                userCard.dataset.nombre = user.nombre;
                
                userCard.innerHTML = `
                    <span>${user.nombre}</span>
                `;

                userCard.addEventListener('click', () => loginUser(user.nombre));

                userGrid.appendChild(userCard);
            });
        } catch (error) {
            console.error('Error al cargar los usuarios:', error);
            userGrid.innerHTML = '<p>No se pudieron cargar los perfiles.</p>';
        }
    }

    async function loginUser(nombre) {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre })
        });

        const data = await response.json();
        if (data.success) {
            window.location.href = '/menu';
        } else {
            alert('Hubo un error al iniciar sesión. Intenta de nuevo.');
        }
    }

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
        if (e.target === modal) {
            hideModal();
        }
    });

    // Enviar el formulario de registro
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
            alert('¡Te has registrado con éxito!');
            hideModal();
            fetchAndDisplayUsers();
        } else {
            errorMessage.textContent = data.message;
        }
    });

    fetchAndDisplayUsers();
});