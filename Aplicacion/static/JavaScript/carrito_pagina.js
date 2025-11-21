// JavaScript/carrito_pagina.js
document.addEventListener('DOMContentLoaded', function() {
  console.log("📦 carrito_pagina.js iniciado");
  
  const listEl = document.getElementById('cart-items');
  const countEl = document.getElementById('cart-count');
  const sumCountEl = document.getElementById('summary-count');
  const sumSubtotalEl = document.getElementById('summary-subtotal');
  const sumTotalEl = document.getElementById('summary-total');
  const selectAllEl = document.getElementById('select-all');
  const btnCheckout = document.getElementById('btn-checkout');
  const tpl = document.getElementById('cart-item-template').innerHTML;

  function loadCart() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    console.log("🔍 Carrito cargado:", carrito);
    return carrito;
  }

  function saveCart(cart) {
    localStorage.setItem('carrito', JSON.stringify(cart));
    console.log("💾 Carrito guardado:", cart);
  }

  function money(n) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(n);
  }

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

  function render() {
    console.log("🎨 Renderizando carrito...");
    const cart = loadCart();
    listEl.innerHTML = '';
    let total = 0;
    let totalQty = 0;

    console.log(`📊 Total productos en carrito: ${cart.length}`);

    cart.forEach((item, idx) => {
      console.log(`➡️ Procesando producto ${idx}:`, item);
      
      const selected = (typeof item.selected === 'boolean') ? item.selected : true;
      const html = tpl
        .replace('__IMG__', item.url_imagen || '')
        .replace('__NAME__', item.nombre)
        .replace('__DESC__', item.descripcion || '')
        .replace('__SIZE__', item.talla || '—')
        .replace('__PRICE__', money(item.precio))
        .replace('__QTY__', item.cantidad);

      const wrap = document.createElement('div');
      wrap.innerHTML = html.trim();
      const node = wrap.firstChild;

      // check
      const check = node.querySelector('.cart-item-check');
      check.checked = selected;
      check.addEventListener('change', () => {
        item.selected = check.checked;
        saveCart(cart);
        render();
      });

      // qty +/-
      node.querySelectorAll('.btn-qty').forEach(btn => {
        btn.addEventListener('click', () => {
          const dir = btn.dataset.dir;
          if (dir === '+') {
            item.cantidad += 1;
          } else if (dir === '-' && item.cantidad > 1) {
            item.cantidad -= 1;
          }
          item.subtotal = item.precio * item.cantidad;
          saveCart(cart);
          render();
        });
      });

      // eliminar
      node.querySelector('.btn-remove').addEventListener('click', () => {
        cart.splice(idx, 1);
        saveCart(cart);
        render();
      });

      listEl.appendChild(node);

      if (selected) {
        total += item.subtotal ?? (item.precio * item.cantidad);
        totalQty += item.cantidad;
      }
    });

    // actualizar textos
    countEl.textContent = `(${cart.length} producto${cart.length !== 1 ? 's' : ''})`;
    sumCountEl.textContent = totalQty;
    sumSubtotalEl.textContent = money(total);
    sumTotalEl.textContent = money(total);

    // seleccionar todo
    if (cart.length > 0) {
      selectAllEl.checked = cart.every(it => (typeof it.selected === 'boolean') ? it.selected : true);
    } else {
      selectAllEl.checked = false;
    }
    
    console.log("✅ Renderizado completo. Total:", money(total));
  }

  // seleccionar todos
  selectAllEl.addEventListener('change', () => {
    const cart = loadCart();
    cart.forEach(it => it.selected = selectAllEl.checked);
    saveCart(cart);
    render();
  });

  // 🔥 BOTÓN CHECKOUT - DENTRO DEL DOMContentLoaded
  if (btnCheckout) {
    console.log("✅ Botón checkout encontrado");
    
    btnCheckout.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("🛒 Click en continuar compra");
      
      const cart = loadCart();
      
      if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
      }
      
      console.log("📦 Carrito a enviar:", cart);
      
      // Crear formulario para enviar POST a checkout
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/checkout/';
      
      // Obtener CSRF token
      const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                        getCookie('csrftoken');
      
      console.log("🔑 CSRF Token:", csrfToken);
      
      if (csrfToken) {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
      }
      
      // Agregar carrito
      const carritoInput = document.createElement('input');
      carritoInput.type = 'hidden';
      carritoInput.name = 'carrito';
      carritoInput.value = JSON.stringify(cart);
      form.appendChild(carritoInput);
      
      console.log("📤 Enviando formulario a checkout");
      document.body.appendChild(form);
      form.submit();
    });
  } else {
    console.error("❌ Botón checkout NO encontrado");
  }

  render();
});

function actualizarResumen() {
    const items = obtenerCarrito();
    let total = 0;
    
    items.forEach(item => {
        total += item.subtotal || 0;
    });
    
    const limiteMaximo = 5000000;
    
    // Actualizar displays
    document.getElementById('summary-total').textContent = `$${total.toLocaleString('es-CL')}`;
    document.getElementById('summary-count').textContent = items.length;
    document.getElementById('summary-subtotal').textContent = `$${total.toLocaleString('es-CL')}`;
    
    // ✅ VALIDACIÓN DE LÍMITE MÁXIMO
    const btnCheckout = document.getElementById('btn-checkout');
    let alertContainer = document.getElementById('alert-limite');
    
    if (total > limiteMaximo) {
        // Mostrar alerta si no existe
        if (!alertContainer) {
            const alert = document.createElement('div');
            alert.id = 'alert-limite';
            alert.className = 'alert alert-warning mt-3';
            alert.style.borderRadius = '16px';
            alert.style.border = '2px solid #FFC107';
            alert.style.fontWeight = '600';
            alert.innerHTML = `
                <div class="d-flex align-items-start">
                    <i class="bi bi-exclamation-triangle-fill me-3" style="font-size: 1.5rem; color: #FFC107;"></i>
                    <div>
                        <strong style="color: #856404;">Límite excedido</strong>
                        <p class="mb-0 mt-1" style="color: #856404;">
                            El monto máximo por compra es <strong>$5.000.000</strong>.<br>
                            Para compras mayoristas, contacta a 
                            <a href="mailto:ventas@tomys.cl" style="color: #FF6B35; font-weight: 700;">ventas@tomys.cl</a>
                        </p>
                    </div>
                </div>
            `;
            
            const summaryCard = document.querySelector('.summary-card .card-body');
            if (summaryCard) {
                summaryCard.appendChild(alert);
            }
        }
        
        // Deshabilitar botón
        if (btnCheckout) {
            btnCheckout.disabled = true;
            btnCheckout.style.opacity = '0.5';
            btnCheckout.style.cursor = 'not-allowed';
            btnCheckout.title = 'Monto excede el límite permitido';
        }
    } else {
        // Remover alerta si existe
        if (alertContainer) {
            alertContainer.remove();
        }
        
        // Habilitar botón
        if (btnCheckout) {
            btnCheckout.disabled = false;
            btnCheckout.style.opacity = '1';
            btnCheckout.style.cursor = 'pointer';
            btnCheckout.title = '';
        }
    }
}