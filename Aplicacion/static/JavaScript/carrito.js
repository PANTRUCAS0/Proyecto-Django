// JavaScript/carrito.js

// carrito.js - INICIO DEL ARCHIVO


function agregarProducto(nombre, descripcion, precio, imagen) {
  
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  let productoExistente = carrito.find(item => item.nombre === nombre);

  if (productoExistente) {
    productoExistente.cantidad += 1;
    productoExistente.subtotal = productoExistente.precio * productoExistente.cantidad;
  } else {
    carrito.push({
      nombre: nombre,
      descripcion: descripcion,
      precio: parseFloat(precio),
      cantidad: 1,
      subtotal: parseFloat(precio),
      url_imagen: imagen,
      selected: true
    });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  console.log("💾 Carrito guardado:", carrito);
  actualizarCarrito();
}


// function agregarProducto(nombre, descripcion, precio, imagen) {
//   let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

//   // ¿ya existe?
//   let productoExistente = carrito.find(item => item.nombre === nombre);

//   if (productoExistente) {
//     productoExistente.cantidad += 1;
//     productoExistente.subtotal = productoExistente.precio * productoExistente.cantidad;
//   } else {
//     carrito.push({
//       nombre: nombre,
//       descripcion: descripcion,
//       precio: parseFloat(precio),
//       cantidad: 1,
//       subtotal: parseFloat(precio),
//       url_imagen: imagen,         // 👈 así lo está usando tu página de carrito
//       selected: true              // 👈 para la página /carrito/
//     });
//   }

//   localStorage.setItem("carrito", JSON.stringify(carrito));
//   actualizarCarrito();
// }

// esta función es para los botones que usan data-*
function agregarProductoDataset(btn) {
  const nombre = btn.dataset.nombre;
  const descripcion = btn.dataset.descripcion || "";
  const precio = btn.dataset.precio || 0;
  const imagen = btn.dataset.imagen || "";

  agregarProducto(nombre, descripcion, precio, imagen);
}

// actualiza el numerito del header
function actualizarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const contador = document.getElementById("contadorCarrito");
  if (contador) {
    contador.textContent = carrito.length;
  }
}

// al cargar cualquier página, refrescamos el contador
document.addEventListener("DOMContentLoaded", actualizarCarrito);
