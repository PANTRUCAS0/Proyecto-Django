// static/JavaScript/auth-validation.js

// ===== VALIDACIÓN DE REGISTRO =====
document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si estamos en la página de registro
    if (!document.getElementById('Usuario')) return;

    const usuarioInput = document.getElementById("Usuario");
    const contrasenaInput = document.getElementById("Contraseña");
    const emailInput = document.getElementById("Email");
    const telefonoInput = document.getElementById("Telefono");

    if (usuarioInput) usuarioInput.addEventListener("input", validarUsuario);
    if (contrasenaInput) contrasenaInput.addEventListener("input", validarContrasena);
    if (emailInput) emailInput.addEventListener("input", validarEmail);
    if (telefonoInput) telefonoInput.addEventListener("input", validarTelefono);

    function actualizarMensaje(elementId, valido) {
        const mensaje = document.getElementById(elementId);
        if (!mensaje) return;
        
        const icon = mensaje.querySelector('i');
        
        if (valido) {
            mensaje.classList.remove("invalid");
            mensaje.classList.add("valid");
            if (icon) icon.className = "bi bi-check-circle";
        } else {
            mensaje.classList.remove("valid");
            mensaje.classList.add("invalid");
            if (icon) icon.className = "bi bi-x-circle";
        }
    }

    function validarUsuario() {
        const valido = usuarioInput.value.trim().length >= 3;
        actualizarMensaje("mensajeUsuario", valido);
        return valido;
    }

    function validarContrasena() {
        const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{5,}$/;
        const valido = regex.test(contrasenaInput.value);
        actualizarMensaje("mensajeContrasena", valido);
        return valido;
    }

    function validarEmail() {
        const valido = emailInput.value.includes("@") && emailInput.value.includes(".");
        actualizarMensaje("mensajeEmail", valido);
        return valido;
    }

    function validarTelefono() {
        const regex = /^\d{9}$/;
        const valido = regex.test(telefonoInput.value.trim());
        actualizarMensaje("mensajeTelefono", valido);
        return valido;
    }

    // Hacer la función global para el form
    window.validarFormulario = function() {
        const usuario = validarUsuario();
        const contrasena = validarContrasena();
        const email = validarEmail();
        const telefono = validarTelefono();
        
        return usuario && contrasena && email && telefono;
    }
});

// ===== VALIDACIÓN DE LOGIN =====
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        const loginUrl = this.action || window.location.href;

        fetch(loginUrl, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        })
        .then(response => {
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                alert('❌ Credenciales inválidas');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('⚠️ Error al procesar la solicitud');
        });
    });
});