// static/JavaScript/actualizar.js

document.addEventListener('DOMContentLoaded', function() {
    const updateForm = document.getElementById('updateForm');
    
    if (updateForm) {
        updateForm.addEventListener('submit', function(e) {
            // No prevenir el submit, solo mostrar mensaje
            mostrarAlertaModerna();
        });
    }
});

function mostrarAlertaModerna() {
    // Crear el alert moderno
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-actualizar';
    alertDiv.innerHTML = `
        <i class="bi bi-check-circle-fill"></i>
        <span>¡Los datos se han actualizado correctamente!</span>
    `;
    
    // Insertar al inicio del contenedor
    const container = document.querySelector('.actualizar-container');
    const formTitle = container.querySelector('.form-title');
    
    if (formTitle) {
        formTitle.insertAdjacentElement('afterend', alertDiv);
    } else {
        container.insertBefore(alertDiv, container.firstChild);
    }
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => alertDiv.remove(), 500);
    }, 5000);
}

// Animación de salida
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(20px);
        }
    }
`;
document.head.appendChild(style);