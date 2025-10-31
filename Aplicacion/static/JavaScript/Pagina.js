// let contadorCarrito = 0;

// function agregarProducto(nombre, descripcion, precio, imagen) {
//     let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

//     let productoExistente = carrito.find(item => item.nombre === nombre);

//     if (productoExistente) {
//         productoExistente.cantidad += 1;
//         productoExistente.subtotal = productoExistente.precio * productoExistente.cantidad;
//     } else {
//         carrito.push({
//             nombre: nombre,
//             descripcion: descripcion,
//             precio: parseFloat(precio),
//             cantidad: 1,
//             subtotal: parseFloat(precio),
//             url_imagen: imagen // 👈 usamos SIEMPRE el mismo nombre
//         });
//     }

//     localStorage.setItem("carrito", JSON.stringify(carrito));
//     actualizarCarrito();
// }

function agregarProducto(nombre, descripcion, precio, imagen) {
    console.log("⚠️ agregarProducto llamada desde Pagina.js (DUPLICADA!)", {nombre, descripcion, precio, imagen});
    // ... resto del código
}

function abrirCarrito() {
    document.getElementById('carrito').style.display = 'block';
}

function cerrarCarrito() {
    document.getElementById('carrito').style.display = 'none';
}

function pagar() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    const productosAgrupados = [];
    carrito.forEach(p => {
        const existente = productosAgrupados.find(x => x.nombre === p.nombre);
        if (existente) {
            existente.cantidad += p.cantidad;
            existente.subtotal += p.subtotal;
        } else {
            productosAgrupados.push({
                nombre: p.nombre,
                descripcion: p.descripcion,
                precio: p.precio,
                cantidad: p.cantidad,
                subtotal: p.subtotal,
                url_imagen: p.url_imagen
            });
        }
    });

    const total = productosAgrupados.reduce((acc, p) => acc + p.subtotal, 0);

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
            localStorage.setItem("boleta", JSON.stringify({
                productos: productosAgrupados,
                total: total
            }));
            localStorage.removeItem("carrito");
            window.location.href = "/boleta/";
        } else {
            alert("Hubo un error al guardar la boleta.");
        }
    })
    .catch(err => console.error("Error al pagar:", err));
}

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
