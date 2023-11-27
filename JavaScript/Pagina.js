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
    // Aquí puedes implementar la lógica para procesar el pago
    // Por ejemplo, mostrar un mensaje de éxito y vaciar el carrito
    alert('¡Gracias por tu compra!');
    carrito = [];
    actualizarCarrito();
}
