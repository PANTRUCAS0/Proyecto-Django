let carrito = []; // Esta es tu variable que contiene los productos
let productoActualId = null;

// ================================
// 🔹 AGREGAR PRODUCTO
// ================================
function agregarProducto() {
  console.log('Función agregarProducto() ejecutada');

  const nombre = document.getElementById('nombre').value.trim();
  const descripcion = document.getElementById('descripcion').value.trim();
  const precio = parseFloat(document.getElementById('precio').value.trim());
  const imagen = document.getElementById('imagen').value.trim();
  const talla = document.getElementById('talla') ? document.getElementById('talla').value : "";
  const marca = document.getElementById('marca') ? document.getElementById('marca').value : "";

  if (!nombre || !descripcion || isNaN(precio) || !imagen || !talla || !marca) {
    alert('⚠️ Todos los campos son obligatorios. Por favor completa la información.');
    return;
  }

  const nuevoProducto = { nombre, descripcion, precio, imagen, talla, marca };
  carrito.push(nuevoProducto);
  actualizarListaProductos();

  // Limpiar formulario
  document.getElementById('formularioProducto').reset();


    carrito.push(nuevoProducto); // Agregamos el nuevo producto al carrito

    actualizarListaProductos(); // Llamamos a la función para actualizar la lista en la interfaz

    // Limpiar el formulario después de agregar el producto
    document.getElementById('formularioProducto').reset();
}


// ================================
// 🔹 MOSTRAR PRODUCTOS EN LISTA
// ================================
function actualizarListaProductos() {
  const listaProductosHTML = document.getElementById('listaProductos');
  listaProductosHTML.innerHTML = '';

  carrito.forEach((producto, index) => {
    const nuevoProductoHTML = document.createElement('li');
    nuevoProductoHTML.innerHTML = `
      <div class="producto">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <p><strong>Precio:</strong> $${producto.precio}</p>
        <p><strong>Talla:</strong> ${producto.talla}</p>
        <p><strong>Marca:</strong> ${producto.marca}</p>
        <button onclick="editarProducto(${index})">✏️ Editar</button>
        <button onclick="eliminarProducto(${index})">🗑️ Eliminar</button>
      </div>
    `;
    listaProductosHTML.appendChild(nuevoProductoHTML);
  });
}

// ================================
// 🔹 ELIMINAR PRODUCTO
// ================================
function eliminarProducto(index) {
  if (confirm('¿Deseas eliminar este producto?')) {
    carrito.splice(index, 1);
    actualizarListaProductos();
  }
}


// ================================
// 🔹 ABRIR MODAL PARA EDITAR PRODUCTO
// ================================
function editarProducto(index) {
  const producto = carrito[index];
  productoActualId = index;

  document.getElementById("modalNombre").value = producto.nombre;
  document.getElementById("modalDescripcion").value = producto.descripcion;
  document.getElementById("modalPrecio").value = producto.precio;
  document.getElementById("modalImagen").value = producto.imagen;
  document.getElementById("modalTalla").value = producto.talla;
  document.getElementById("modalMarca").value = producto.marca;

  document.getElementById("modalActualizar").style.display = "block";
}

// ================================
// 🔹 CERRAR MODAL
// ================================
function cerrarModal() {
  document.getElementById("modalActualizar").style.display = "none";
}

// ================================
// 🔹 GUARDAR CAMBIOS DESDE MODAL
// ================================
function guardarCambios() {
  const nombre = document.getElementById("modalNombre").value.trim();
  const descripcion = document.getElementById("modalDescripcion").value.trim();
  const precio = parseFloat(document.getElementById("modalPrecio").value.trim());
  const imagen = document.getElementById("modalImagen").value.trim();
  const talla = document.getElementById("modalTalla").value;
  const marca = document.getElementById("modalMarca").value;

  if (!nombre || !descripcion || isNaN(precio) || !imagen || !talla || !marca) {
    alert("⚠️ Por favor completa todos los campos antes de guardar.");
    return;
  }

  const producto = carrito[productoActualId];
  producto.nombre = nombre;
  producto.descripcion = descripcion;
  producto.precio = precio;
  producto.imagen = imagen;
  producto.talla = talla;
  producto.marca = marca;

  actualizarListaProductos();
  cerrarModal();

  alert("✅ Cambios guardados correctamente.");
}