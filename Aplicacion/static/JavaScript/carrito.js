// carrito_pagina.js - Gestión del carrito de compras

// Cargar datos del carrito desde localStorage
function loadCartFromStorage() {
  const stored = localStorage.getItem("carrito");
  if (!stored) return [];
  
  const carrito = JSON.parse(stored);
  // Convertir formato de localStorage al formato del carrito_pagina
  return carrito.map((item, index) => ({
    id: index,
    name: item.nombre,
    desc: item.descripcion,
    size: item.talla || "—",
    price: item.precio,
    qty: item.cantidad,
    img: item.url_imagen,
    selected: item.selected !== false
  }));
}

let cartData = loadCartFromStorage();

// Función para formatear precios
function formatPrice(price) {
  return price.toLocaleString('es-CL');
}

// Función para guardar cambios en localStorage
function saveCartToStorage() {
  const carrito = cartData.map(item => ({
    nombre: item.name,
    descripcion: item.desc,
    precio: item.price,
    cantidad: item.qty,
    subtotal: item.price * item.qty,
    url_imagen: item.img,
    talla: item.size,
    selected: item.selected
  }));
  localStorage.setItem("carrito", JSON.stringify(carrito));
  console.log("💾 Carrito actualizado:", carrito);
}

// Función para renderizar un item del carrito
function renderCartItem(item, index) {
  const template = document.getElementById('cart-item-template').innerHTML;
  const checked = item.selected ? 'checked' : '';
  
  return template
    .replace('__IMG__', item.img)
    .replace('__NAME__', item.name)
    .replace('__DESC__', item.desc)
    .replace('__SIZE__', item.size)
    .replace('__PRICE__', formatPrice(item.price))
    .replace('__QTY__', item.qty)
    .replace('cart-item align-items-center">', `cart-item align-items-center" data-index="${index}">`)
    .replace('class="form-check-input mt-0 cart-item-check"', `class="form-check-input mt-0 cart-item-check" ${checked}`);
}

// Función para renderizar todo el carrito
function renderCart() {
  const container = document.getElementById('cart-items');
  
  if (cartData.length === 0) {
    container.innerHTML = '<div class="text-center py-5 text-muted"><p>Tu carrito está vacío</p></div>';
    updateSummary();
    return;
  }
  
  container.innerHTML = cartData.map((item, index) => renderCartItem(item, index)).join('');
  
  // Agregar event listeners a los items recién creados
  attachItemEventListeners();
  updateSummary();
}

// Función para actualizar el resumen
function updateSummary() {
  const checkboxes = document.querySelectorAll('.cart-item-check:checked');
  let total = 0;
  let count = 0;
  
  checkboxes.forEach(checkbox => {
    const itemDiv = checkbox.closest('.cart-item');
    const index = parseInt(itemDiv.dataset.index);
    const item = cartData[index];
    if (item) {
      total += item.price * item.qty;
      count++;
    }
  });
  
  document.getElementById('cart-count').textContent = `(${cartData.length} producto${cartData.length !== 1 ? 's' : ''})`;
  document.getElementById('summary-count').textContent = count;
  document.getElementById('summary-subtotal').textContent = `$${formatPrice(total)}`;
  document.getElementById('summary-total').textContent = `$${formatPrice(total)}`;
  
  // Actualizar el checkbox "Seleccionar todos"
  const allCheckboxes = document.querySelectorAll('.cart-item-check');
  const selectAllCheckbox = document.getElementById('select-all');
  if (selectAllCheckbox && allCheckboxes.length > 0) {
    selectAllCheckbox.checked = allCheckboxes.length === checkboxes.length;
  }
}

// Función para adjuntar event listeners a los items
function attachItemEventListeners() {
  // Checkboxes individuales
  document.querySelectorAll('.cart-item-check').forEach((checkbox) => {
    checkbox.addEventListener('change', function() {
      const itemDiv = this.closest('.cart-item');
      const index = parseInt(itemDiv.dataset.index);
      cartData[index].selected = this.checked;
      saveCartToStorage();
      updateSummary();
    });
  });
  
  // Botones de cantidad
  document.querySelectorAll('.btn-qty').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const itemDiv = this.closest('.cart-item');
      const index = parseInt(itemDiv.dataset.index);
      const dir = this.dataset.dir;
      
      if (dir === '+') {
        cartData[index].qty++;
      } else if (dir === '-' && cartData[index].qty > 1) {
        cartData[index].qty--;
      }
      
      // Actualizar solo la cantidad en el DOM
      const qtySpan = itemDiv.querySelector('.cart-item-qty');
      qtySpan.textContent = cartData[index].qty;
      
      // Actualizar precio total del item
      const priceP = itemDiv.querySelector('.fw-semibold.mb-2');
      priceP.textContent = `$ ${formatPrice(cartData[index].price * cartData[index].qty)}`;
      
      saveCartToStorage();
      updateSummary();
    });
  });
  
  // Botones de eliminar
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const itemDiv = this.closest('.cart-item');
      const index = parseInt(itemDiv.dataset.index);
      
      if (confirm('¿Deseas eliminar este producto del carrito?')) {
        cartData.splice(index, 1);
        saveCartToStorage();
        renderCart();
      }
    });
  });
}

// Checkbox "Seleccionar todos"
const selectAllCheckbox = document.getElementById('select-all');
if (selectAllCheckbox) {
  selectAllCheckbox.addEventListener('change', function() {
    const checkboxes = document.querySelectorAll('.cart-item-check');
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = this.checked;
      cartData[index].selected = this.checked;
    });
    saveCartToStorage();
    updateSummary();
  });
}

// Botón de continuar compra
const checkoutBtn = document.getElementById('btn-checkout');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', function() {
    const checkedItems = document.querySelectorAll('.cart-item-check:checked');
    
    if (checkedItems.length === 0) {
      alert('Por favor selecciona al menos un producto para continuar.');
      return;
    }
    
    // Aquí puedes redirigir al checkout o hacer lo que necesites
    alert(`Continuando con ${checkedItems.length} producto(s) seleccionado(s)`);
    // window.location.href = '/checkout/';
  });
}

// Inicializar el carrito al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  renderCart();
});