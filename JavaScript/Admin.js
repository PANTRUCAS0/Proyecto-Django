
let carrito = [];


function agregarProducto() {
    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = document.getElementById('precio').value.trim();
    const imagen = document.getElementById('imagen').value.trim();

    if (nombre === '' || descripcion === '' || precio === '' || imagen === '') {
        alert('Todos los campos son obligatorios. Por favor, completa la información.');
        return;
    }

    const nuevoProducto = {
        nombre: nombre,
        descripcion: descripcion,
        precio: parseFloat(precio),
        imagen: imagen
    };
    carrito.push(nuevoProducto);

    actualizarCarrito();
    // Limpiar el formulario después de agregar el producto
    document.getElementById('formularioProducto').reset();


    document.getElementById('listaProductos').innerHTML += nuevoProducto;

    // Limpiar el formulario después de agregar el producto
    document.getElementById('formularioProducto').reset();
}

// Función para modificar un producto
function modificarProducto(boton) {
    const producto = boton.parentNode;
    // Aquí puedes implementar la lógica para modificar el producto
}

// Función para eliminar un producto
function eliminarProducto(boton) {
    const producto = boton.parentNode;
    producto.parentNode.removeChild(producto);
    // Aquí puedes implementar la lógica para eliminar el producto
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        window.scrollTo({
            top: section.offsetTop,
            behavior: 'smooth'
        });
    }
}