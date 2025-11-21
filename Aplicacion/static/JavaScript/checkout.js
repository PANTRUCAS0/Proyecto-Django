document.addEventListener('DOMContentLoaded', function() {
    const btnFinalizarCompra = document.getElementById('btn-finalizar-compra');
    const LIMITE_MAXIMO = 5000000;
    
    if (btnFinalizarCompra) {
        btnFinalizarCompra.addEventListener('click', procesarCompra);
    }
    
    // Validar límite al cargar la página
    validarLimiteCheckout();
});

/**
 * Valida el límite máximo en la página de checkout
 */
function validarLimiteCheckout() {
    const totalDisplay = document.getElementById('total-display');
    if (!totalDisplay) return;
    
    // Extraer el total del texto (eliminar $ y comas)
    const totalText = totalDisplay.textContent.replace(/\$|\.|\,/g, '');
    const total = parseInt(totalText);
    const LIMITE_MAXIMO = 5000000;
    
    if (total > LIMITE_MAXIMO) {
        const btnFinalizar = document.getElementById('btn-finalizar-compra');
        
        // Deshabilitar botón
        if (btnFinalizar) {
            btnFinalizar.disabled = true;
            btnFinalizar.style.opacity = '0.5';
            btnFinalizar.style.cursor = 'not-allowed';
        }
        
        // Mostrar alerta
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger mt-3';
        alertDiv.style.borderRadius = '16px';
        alertDiv.innerHTML = `
            <div class="d-flex align-items-start">
                <i class="bi bi-exclamation-octagon-fill me-3" style="font-size: 1.5rem;"></i>
                <div>
                    <strong>No se puede procesar esta compra</strong>
                    <p class="mb-0 mt-1">
                        El monto total excede el límite máximo de <strong>$5.000.000</strong>.<br>
                        Por favor, vuelve al carrito y ajusta tu pedido.<br>
                        Para compras mayoristas: <a href="mailto:ventas@tomys.cl" class="alert-link">ventas@tomys.cl</a>
                    </p>
                </div>
            </div>
        `;
        
        // Insertar antes del botón
        const checkoutSummary = document.querySelector('.checkout-summary .card-body');
        if (checkoutSummary && btnFinalizar) {
            checkoutSummary.insertBefore(alertDiv, btnFinalizar);
        }
    }
}

/**
 * Procesa la compra y envía los datos al servidor
 */
async function procesarCompra(e) {
    e.preventDefault();
    
    const btn = e.target;
    const originalHTML = btn.innerHTML;
    
    // Deshabilitar botón
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Procesando...';
    
    try {
        // Validar formulario
        if (!validarFormulario()) {
            throw new Error('Por favor completa todos los campos requeridos');
        }
        
        // Obtener carrito
        const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        
        if (carrito.length === 0) {
            throw new Error('El carrito está vacío');
        }
        
        // Calcular total
        const subtotal = carrito.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const total = subtotal + (subtotal > 50000 ? 0 : 5000);
        
        // ✅ VALIDACIÓN DE LÍMITE EN FRONTEND
        const LIMITE_MAXIMO = 5000000;
        if (total > LIMITE_MAXIMO) {
            alert(
                `⚠️ LÍMITE EXCEDIDO\n\n` +
                `El monto total ($${total.toLocaleString('es-CL')}) excede el límite máximo de $${LIMITE_MAXIMO.toLocaleString('es-CL')}.\n\n` +
                `Para compras mayoristas, contacta a ventas@tomys.cl`
            );
            window.location.href = '/carrito/';
            return;
        }
        
        // Preparar datos
        const data = {
            email: document.getElementById('Email').value,
            telefono: document.getElementById('Telefono').value,
            direccion: document.getElementById('Direccion').value,
            ciudad: document.getElementById('Ciudad').value,
            region: document.getElementById('Region').value,
            codigo_postal: document.getElementById('CodigoPostal')?.value || '',
            metodo_pago: document.querySelector('input[name="metodo_pago"]:checked')?.value || 'TRANSFERENCIA',
            carrito: carrito,
            notas: document.getElementById('notas')?.value || ''
        };
        
        // Enviar al servidor
        const response = await fetch('/procesar-pago/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
            // ✅ Pago exitoso
            localStorage.removeItem('carrito');
            
            // Mostrar mensaje de éxito
            mostrarMensajeExito();
            
            // Redirigir a confirmación
            setTimeout(() => {
                window.location.href = `/confirmacion/${result.orden_id}/`;
            }, 1500);
            
        } else {
            // ❌ Error en el pago
            
            // Verificar si es error de límite excedido
            if (result.error === 'limite_excedido') {
                alert(
                    `⚠️ LÍMITE EXCEDIDO\n\n` +
                    `${result.mensaje}\n\n` +
                    `${result.detalle}`
                );
                window.location.href = '/carrito/';
            } else {
                throw new Error(result.error || result.mensaje || 'Error al procesar el pago');
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert(`❌ Error: ${error.message}`);
        
        // Restaurar botón
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
}

/**
 * Valida que todos los campos requeridos estén completos
 */
function validarFormulario() {
    const camposRequeridos = [
        { id: 'Email', nombre: 'Email' },
        { id: 'Telefono', nombre: 'Teléfono' },
        { id: 'Direccion', nombre: 'Dirección' },
        { id: 'Ciudad', nombre: 'Ciudad' },
        { id: 'Region', nombre: 'Región' }
    ];
    
    for (const campo of camposRequeridos) {
        const elemento = document.getElementById(campo.id);
        if (!elemento || !elemento.value.trim()) {
            alert(`⚠️ El campo "${campo.nombre}" es obligatorio`);
            elemento?.focus();
            return false;
        }
    }
    
    // Validar método de pago
    const metodoPago = document.querySelector('input[name="metodo_pago"]:checked');
    if (!metodoPago) {
        alert('⚠️ Por favor selecciona un método de pago');
        return false;
    }
    
    return true;
}

/**
 * Muestra mensaje de éxito visual
 */
function mostrarMensajeExito() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    overlay.innerHTML = `
        <div style="
            background: white;
            padding: 3rem;
            border-radius: 20px;
            text-align: center;
            max-width: 400px;
            animation: slideUp 0.5s ease;
        ">
            <div style="
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #28A745, #20C997);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
            ">
                <i class="bi bi-check-circle-fill" style="font-size: 3rem; color: white;"></i>
            </div>
            <h3 style="color: #000; font-weight: 900; margin-bottom: 1rem;">¡COMPRA EXITOSA!</h3>
            <p style="color: #6C757D; font-weight: 600;">Tu orden ha sido procesada correctamente</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

/**
 * Obtiene el CSRF token de las cookies
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}