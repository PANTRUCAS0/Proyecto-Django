let carrito = [];
let contadorCarrito = 0;

function agregarProducto(nombre, descripcion, precio, imagen) {
    const nuevoProducto = {
        nombre: nombre,
        descripcion: descripcion,
        precio: parseFloat(precio),
        imagen: imagen
    };

    carrito.push(nuevoProducto);
    contadorCarrito += 1;

    actualizarCarrito();
}

function abrirCarrito() {
    const carritoOverlay = document.getElementById('carrito');
    carritoOverlay.style.display = 'block';
}


function cerrarCarrito() {
    const carritoOverlay = document.getElementById('carrito');
    carritoOverlay.style.display = 'none';
}




function actualizarCarrito() {
    const listaCarrito = document.getElementById('listaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');
    const contadorCarritoElemento = document.getElementById('contadorCarrito');

    // Limpiar la lista de carrito antes de volver a llenar
    listaCarrito.innerHTML = '';

    let total = 0;

    carrito.forEach(producto => {
        const itemCarrito = document.createElement('li');
        itemCarrito.textContent = `${producto.nombre} - $${producto.precio.toFixed(2)}`;
        listaCarrito.appendChild(itemCarrito);

        total += producto.precio;
    });

    totalCarrito.textContent = `Total: $${total.toFixed(2)}`;
    contadorCarritoElemento.textContent = contadorCarrito;
}

function pagar() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    // Agrupar productos iguales
    const productosAgrupados = [];
    carrito.forEach(p => {
        const existente = productosAgrupados.find(x => x.nombre === p.nombre);
        if (existente) {
            existente.cantidad += 1;
            existente.subtotal += p.precio;
        } else {
            productosAgrupados.push({
                nombre: p.nombre,
                descripcion: p.descripcion,
                precio: p.precio,
                cantidad: 1,
                subtotal: p.precio,
                url_imagen: p.imagen
            });
        }
    });

    const total = productosAgrupados.reduce((acc, p) => acc + p.subtotal, 0);

    // Enviar datos a Django con fetch
    fetch('/guardar_boleta/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            productos: productosAgrupados,
            total: total
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'ok') {
            // Guardamos datos para mostrar en la boleta
            localStorage.setItem("boleta", JSON.stringify({
                productos: productosAgrupados,
                total: total
            }));
            carrito = []; // limpiar carrito
            window.location.href = "/boleta/";
        } else {
            alert("Hubo un error al guardar la boleta");
        }
    });
}

// Función para obtener el token CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
