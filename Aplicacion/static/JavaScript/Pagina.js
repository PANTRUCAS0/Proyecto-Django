// ===== SISTEMA DE CARRITO ZAPATERÍA TOMY'S =====
// Asegurarse de que todas las funciones estén en el scope global

// ✅ Función principal de agregar al carrito
function agregarProducto(nombre, descripcion, precio, imagen, talla, marca) {
    console.log("🛒 Agregando producto:", {nombre, descripcion, precio, imagen, talla, marca});
    
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Buscar producto con el MISMO nombre Y la MISMA talla
    let productoExistente = carrito.find(item => 
        item.nombre === nombre && item.talla === talla
    );

    if (productoExistente) {
        productoExistente.cantidad += 1;
        productoExistente.subtotal = productoExistente.precio * productoExistente.cantidad;
        console.log("✅ Producto existente, cantidad aumentada a:", productoExistente.cantidad);
        mostrarNotificacion(`${nombre} (cantidad: ${productoExistente.cantidad})`);
    } else {
        carrito.push({
            nombre: nombre,
            descripcion: descripcion,
            precio: parseFloat(precio),
            cantidad: 1,
            subtotal: parseFloat(precio),
            url_imagen: imagen,
            talla: talla || "—",        
            marca: marca || "",        
            selected: true       
        });
        console.log("✅ Producto nuevo agregado al carrito");
        mostrarNotificacion(`✅ ${nombre} agregado al carrito`);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    console.log("💾 Carrito guardado:", carrito);
    actualizarCarrito();
}

// ✅ Función para agregar productos usando data attributes (llamada desde HTML)
function agregarProductoDataset(btn) {
    const nombre = btn.dataset.nombre;
    const descripcion = btn.dataset.descripcion;
    const precio = btn.dataset.precio;
    const imagen = btn.dataset.imagen;
    const talla = btn.dataset.talla || "—";
    const marca = btn.dataset.marca || "";
    
    console.log("🛒 Agregando desde dataset:", {nombre, descripcion, precio, imagen, talla, marca});
    
    agregarProducto(nombre, descripcion, precio, imagen, talla, marca);
}

// ✅ Función para actualizar el contador del carrito
function actualizarCarrito() {
    try {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        let totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        
        console.log("📊 Actualizando contador. Total items:", totalItems);
        
        // Buscar el contador por ID
        const contador = document.getElementById('contadorCarrito');
        
        if (contador) {
            contador.textContent = totalItems;
            console.log("✅ Contador actualizado a:", totalItems);
            
            // Animación visual
            contador.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            contador.style.transform = 'scale(1.5)';
            
            setTimeout(function() {
                contador.style.transform = 'scale(1)';
            }, 300);
        } else {
            console.warn("⚠️ No se encontró el elemento #contadorCarrito");
        }
        
        return totalItems;
    } catch (error) {
        console.error("❌ Error en actualizarCarrito:", error);
        return 0;
    }
}

// ✅ Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    try {
        // Eliminar notificación anterior si existe
        const notifAnterior = document.querySelector('.notificacion-carrito');
        if (notifAnterior) {
            notifAnterior.remove();
        }
        
        // Crear nueva notificación
        const notif = document.createElement('div');
        notif.className = 'alert alert-success position-fixed notificacion-carrito shadow-lg';
        notif.style.cssText = 'top: 80px; right: 20px; z-index: 10000; min-width: 300px; max-width: 400px; box-shadow: 0 6px 16px rgba(0,0,0,0.25); animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); border-left: 5px solid #198754; border-radius: 10px;';
        notif.innerHTML = '<div class="d-flex align-items-center justify-content-between"><div class="d-flex align-items-center"><i class="bi bi-check-circle-fill me-2 fs-4 text-success"></i><span class="fw-semibold">' + mensaje + '</span></div><button class="btn-close btn-close-sm" onclick="this.closest(\'.notificacion-carrito\').remove()"></button></div>';
        
        document.body.appendChild(notif);
        
        // Auto-remover después de 3 segundos
        setTimeout(function() {
            if (notif.parentElement) {
                notif.style.animation = 'slideOutRight 0.4s ease';
                setTimeout(function() {
                    notif.remove();
                }, 400);
            }
        }, 3000);
    } catch (error) {
        console.error("❌ Error en mostrarNotificacion:", error);
    }
}

// ✅ Funciones auxiliares del carrito
function abrirCarrito() {
    const carritoModal = document.getElementById('carrito');
    if (carritoModal) {
        carritoModal.style.display = 'block';
    }
}

function cerrarCarrito() {
    const carritoModal = document.getElementById('carrito');
    if (carritoModal) {
        carritoModal.style.display = 'none';
    }
}

// ✅ Función de pago
function pagar() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const total = carrito.reduce(function(acc, p) {
        return acc + p.subtotal;
    }, 0);

    fetch('/guardar_boleta/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            productos: carrito,
            total: total
        })
    })
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        if (data.status === 'ok') {
            localStorage.setItem("boleta", JSON.stringify({
                productos: carrito,
                total: total
            }));
            localStorage.removeItem("carrito");
            window.location.href = "/boleta/";
        } else {
            alert("Hubo un error al guardar la boleta.");
        }
    })
    .catch(function(err) {
        console.error("❌ Error al pagar:", err);
        alert("Error de conexión. Por favor intenta nuevamente.");
    });
}

// ✅ Función para obtener CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ✅ Funciones de utilidad
function limpiarCarrito() {
    localStorage.removeItem('carrito');
    actualizarCarrito();
    console.log('🧹 Carrito limpiado');
}

function verCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    console.table(carrito);
    return carrito;
}

// ✅ Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Sistema de carrito Tomy's iniciado");
    
    // Actualizar contador inmediatamente
    const totalItems = actualizarCarrito();
    
    // Verificar estado inicial
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    console.log("📦 Productos en carrito:", carrito.length);
    console.log("🔢 Total de items:", totalItems);
    
    if (carrito.length > 0) {
        console.log("📋 Detalle del carrito:");
        console.table(carrito);
    }
    
    console.log("💡 Comandos útiles en consola:");
    console.log("   verCarrito() - Ver contenido del carrito");
    console.log("   limpiarCarrito() - Vaciar el carrito");
    console.log("   actualizarCarrito() - Actualizar contador");
});

// ✅ Agregar estilos de animación
(function() {
    const style = document.createElement('style');
    style.textContent = '@keyframes slideInRight { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(120%); opacity: 0; } } .notificacion-carrito { border-radius: 10px; } .notificacion-carrito:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.3); }';
    document.head.appendChild(style);
})();

console.log("✅ Sistema de carrito cargado correctamente");