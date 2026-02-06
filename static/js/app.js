/* =========================
   CARRITO (LOCALSTORAGE)
========================= */


function usuarioLogueado() {
    return !!localStorage.getItem("token");
}

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function totalItems() {
    return carrito.reduce((sum, p) => sum + p.cantidad, 0);
}

function totalPrecio() {
    return carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
}

/* =========================
   CARRITO ACTIONS
========================= */
async function agregarCarrito(id, nombre, precio, inputId) {
    const cantidad = parseInt(document.getElementById(inputId).value) || 1;

    if (usuarioLogueado()) {
        await fetch("/api/carrito/agregar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                producto_id: id,
                cantidad: cantidad
            })
        });

        await cargarCarritoBackend();
    } else {
        const producto = carrito.find(p => p.id === id);

        if (producto) producto.cantidad += cantidad;
        else carrito.push({ id, nombre, precio, cantidad });

        guardarCarrito();
        renderCarrito();
    }

    document.getElementById(inputId).value = 1;
    abrirCarrito();
}

async function aumentar(id) {
    if (usuarioLogueado()) {
        const item = carrito.find(p => p.id === id);
        if (!item) return;

        await fetch("/api/carrito/agregar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({
                producto_id: id,
                cantidad: 1
            })
        });

        cargarCarritoBackend();
    } else {
        const producto = carrito.find(p => p.id === id);
        producto.cantidad++;
        guardarCarrito();
        renderCarrito();
    }
}


async function disminuir(id) {
    const item = carrito.find(p => p.id === id);
    if (!item) return;

    if (usuarioLogueado() && item.backend_id) {
        await fetch("/api/carrito/eliminar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ item_id: item.backend_id })
        });

        cargarCarritoBackend();
    } else {
        item.cantidad--;
        if (item.cantidad <= 0) carrito = carrito.filter(p => p.id !== id);
        guardarCarrito();
        renderCarrito();
    }
}


/* =========================
   RENDER CARRITO
========================= */
function renderCarrito() {
    const lista = document.getElementById("lista-carrito");
    const total = document.getElementById("total");
    const badge = document.getElementById("cart-count");

    lista.innerHTML = "";

    if (carrito.length === 0) {
        lista.innerHTML = `<li class="carrito-vacio">Tu carrito está vacío</li>`;
        total.textContent = "0";
        badge.textContent = "0";
        return;
    }

    carrito.forEach(p => {
        const subtotal = p.precio * p.cantidad;

        const li = document.createElement("li");
        li.innerHTML = `
            <div class="item-info">
                <strong>${p.nombre}</strong>
                <small>$${p.precio} x ${p.cantidad} = $${subtotal}</small>
            </div>

            <div class="cart-controls">
                <button onclick="disminuir(${p.id})">−</button>
                <span>${p.cantidad}</span>
                <button onclick="aumentar(${p.id})">+</button>
                <button class="eliminar" onclick="eliminar(${p.id})">×</button>
            </div>
        `;

        lista.appendChild(li);
    });

    total.textContent = totalPrecio();
    badge.textContent = totalItems();
}

async function eliminar(id) {
    const item = carrito.find(p => p.id === id);
    if (!item) return;

    if (usuarioLogueado() && item.backend_id) {
        await fetch("/api/carrito/eliminar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ item_id: item.backend_id })
        });

        cargarCarritoBackend();
    } else {
        carrito = carrito.filter(p => p.id !== id);
        guardarCarrito();
        renderCarrito();
    }
}


/* =========================
   CARRITO UI
========================= */
function toggleCarrito() {
    document.getElementById("carrito").classList.toggle("active");
}

function abrirCarrito() {
    document.getElementById("carrito").classList.add("active");
}

/* =========================
   API
========================= */
const API_BASE = "/api";
let productosGlobal = [];



/* =========================
   FETCH CATEGORIAS
========================= */
async function cargarCategorias() {
    console.log("📡 Llamando a /api/categorias/");

    try {
        const res = await fetch(`${API_BASE}/categorias/`);
        console.log("📥 Respuesta categorias:", res);

        const categorias = await res.json();
        console.log("📦 Categorias recibidas:", categorias);

        const contenedor = document.getElementById("categorias");

        contenedor.innerHTML = `
            <button class="active" data-categoria="all">Todo</button>
        `;

        contenedor.querySelector("button").onclick = () =>
            filtrarCategoria("all");

        categorias.forEach(cat => {
            const btn = document.createElement("button");
            btn.textContent = cat.nombre;
            btn.dataset.categoria = cat.nombre;
            btn.onclick = () => filtrarCategoria(cat.nombre);




            contenedor.appendChild(btn);
        });

    } catch (error) {
        console.error("❌ Error cargando categorias:", error);
    }
}

/* =========================
   FETCH PRODUCTOS
========================= */
async function cargarProductos() {
    const res = await fetch(`${API_BASE}/productos/`);
    productosGlobal = await res.json();

    console.log("📦 productosGlobal completo:", productosGlobal);
    console.log("🧾 primer producto:", productosGlobal[0]);
    const primerosCuatro = productosGlobal.slice(0, 4);
    renderProductos(primerosCuatro);
}


/* =========================
   RENDER PRODUCTOS
========================= */
function renderProductos(lista) {
    const contenedor = document.getElementById("productos");
  

    contenedor.innerHTML = "";

    lista.forEach(prod => {
        const article = document.createElement("article");
          const imagen = prod.imagen ? prod.imagen : "/media/productos/default.png";
        article.className = "producto-card";

        article.innerHTML = `
            <img src="${imagen}" class="producto-img" alt="${imagen}">

            <div class="producto-info">
                <h3>${prod.nombre}</h3>
                <p>Deliciosa preparación hecha al momento con ingredientes frescos.</p>

                <div class="producto-footer">
                    <span class="producto-precio">$${prod.precio}</span>

                    <div class="cantidad-control">
                        <input type="number" min="1" value="1" id="qty-${prod.id}">
                        <button class="btn-agregar" onclick="agregarCarrito(
                            ${prod.id},
                            '${prod.nombre}',
                            ${prod.precio},
                            'qty-${prod.id}'
                        )">
                            Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;

        contenedor.appendChild(article);
    });
}

/* =========================
   FILTRAR
========================= */
function filtrarCategoria(categoriaNombre, e) {
    console.log("🎯 Filtrando categoría:", categoriaNombre);

    document.querySelectorAll(".categorias button")
        .forEach(b => b.classList.remove("active"));

    if (e && e.target) {
        e.target.classList.add("active");
    }

    if (categoriaNombre === "all") {
        const primerosCuatro = productosGlobal.slice(0, 4);
        renderProductos(primerosCuatro);
        return;
    }

    const filtrados = productosGlobal.filter(
        p => p.categoria === categoriaNombre
    );

    console.log("✅ Filtrados:", filtrados);
    renderProductos(filtrados);
}




/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", async () => {
    cargarCategorias();
    cargarProductos();
    actualizarMenuUsuario();

    if (usuarioLogueado()) {
        await cargarCarritoBackend();
    } else {
        renderCarrito();
    }
});




/* boton ordenar ahora*/

async function checkout() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío");
        return;
    }

    const payload = {
        items: carrito.map(p => ({
            producto_id: p.id,
            cantidad: p.cantidad,
            precio: p.precio
        })),
        total: totalPrecio()
    };

    console.log("📦 Enviando orden:", payload);

    try {
        const res = await fetch("/api/ordenes/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Si usas auth con token:
                // "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error("Error al crear la orden");
        }

        const data = await res.json();
        console.log("✅ Orden creada:", data);

        // LIMPIAR CARRITO
        carrito = [];
        guardarCarrito();
        renderCarrito();
        toggleCarrito();

        alert("🎉 Pedido realizado con éxito");

    } catch (err) {
        console.error("❌ Error checkout:", err);
        alert("Hubo un problema al procesar tu pedido");
    }
}



/* modal*/
function abrirCheckout() {
    if (carrito.length === 0) {
        alert("Carrito vacío");
        return;
    }

    document.getElementById("modal-total").textContent = totalPrecio();
    document.getElementById("checkoutModal").classList.add("active");

    precargarDatos();
}

function cerrarModal() {
    document.getElementById("checkoutModal").classList.remove("active");
}

function toggleDireccion() {
    const tipo = document.getElementById("tipoPedido").value;
    const box = document.getElementById("direccionBox");
    const direccion = document.getElementById("direccion");

    if (tipo === "delivery") {
        box.style.display = "block";
        direccion.required = true;
    } else {
        box.style.display = "none";
        direccion.required = false;
        direccion.value = "";
    }
}


function precargarDatos() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    nombre.value = user.nombre || "";
    telefono.value = user.telefono || "";
    direccion.value = user.direccion || "";
}

document.addEventListener("DOMContentLoaded", () => {
    document
        .getElementById("checkoutForm")
        .addEventListener("submit", async e => {
            e.preventDefault();

          const payload = {
  cliente_nombre: nombre.value,
  cliente_telefono: telefono.value,
  tipo_pedido: tipoPedido.value,
  direccion: tipoPedido.value === "delivery" ? direccion.value : null,
  items: carrito.map(p => ({
    producto_id: p.id,
    cantidad: p.cantidad,
    precio: p.precio
  })),
  total: totalPrecio()
};


            console.log("📦 Confirmando pedido:", payload);

            // aquí va el POST real

    try {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/ordenes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: "Token " + token }) // 🔥 SOLO si existe token
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Error al crear orden");

 const data = await res.json();
console.log("✅ Orden creada:", data);

// 🔥 LIMPIAR CARRITO BACKEND SI ESTÁ LOGUEADO
if (localStorage.getItem("token")) {
    await fetch(`${API_BASE}/carrito/limpiar/`, {
        method: "DELETE",
        headers: {
            "Authorization": `Token ${localStorage.getItem("token")}`
        }
    });
}


// 🧹 LIMPIAR CARRITO LOCAL
carrito = [];
guardarCarrito();
renderCarrito();
cerrarModal();

alert("🎉 Pedido realizado con éxito");







} catch (err) {
  console.error("❌ Error:", err);
  alert("No se pudo procesar el pedido");
}

        });
});




/*modal y login*/

function abrirLoginModal() {
    document.getElementById("loginModal").classList.add("active");
}

function cerrarLoginModal() {
    document.getElementById("loginModal").classList.remove("active");
}

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async e => {
        e.preventDefault();

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        try {
            const res = await fetch("/api/login/", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({username, password})
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.non_field_errors || data.error || "Credenciales inválidas");
                return;
            }

            // Guardar token y datos de usuario
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify({
                nombre: data.nombre,
                apellido: data.apellido,
                email: data.email,
                telefono: data.telefono,
                direccion: data.direccion,
                  is_staff: data.is_staff,
                  is_admin:data.is_admin,
            is_superuser: data.is_superuser,
            }));
actualizarMenuUsuario();

            cerrarLoginModal();
            alert("✅ Sesión iniciada correctamente");

            // Precargar datos en checkout
            precargarDatos();

            // Sincronizar carrito
        await fusionarCarritoLocalConBackend();
await cargarCarritoBackend();
renderCarrito();
    location.reload();
        } catch (err) {
            console.error(err);
            alert("Error al iniciar sesión");
        }
    });
});
async function fusionarCarritoLocalConBackend() {
    const carritoLocal = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carritoLocal.length === 0) return;

    const token = localStorage.getItem("token");

    for (const item of carritoLocal) {
        await fetch("/api/carrito/agregar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({
                producto_id: item.id,
                cantidad: item.cantidad
            })
        });
    }

    localStorage.removeItem("carrito");
}


function cerrarLoginModal() {
    document.getElementById("loginModal").classList.remove("active");
}
function abrirLoginModal() {
    document.getElementById("loginModal").classList.add("active");
}



// Mostrar el menú según si hay usuario
function actualizarMenuUsuario() {
    const container = document.getElementById("userMenuContainer");
    const user = JSON.parse(localStorage.getItem("user"));

    // 🔓 SI HAY USUARIO LOGUEADO
    if (user) {
        container.innerHTML = `
        <div class="user-dropdown" id="userDropdown">
            <button class="user-btn" onclick="toggleUserDropdown()">
                <span class="user-avatar" id="userAvatar"></span>
                <span class="user-name" id="userName">${user.nombre || "Usuario"}</span>
            </button>

            <div class="user-dropdown-content">
                <a href="#"  onclick="abrirPerfil() ">👤 Mi perfil</a>
                <a href="#" onclick="abrirMisPedidos()">🧾 Mis pedidos</a>
                <a href="#" onclick="abrirMisReservas()">🧾 Mis Reservas</a>

           <a href="#" onclick="irPanelAdmin()">⚙️ Panel Admin</a>



${user.is_superuser ? `<a href="/super-panel.html">👑 Super Panel</a>` : ``}


                <a href="#" onclick="cerrarSesion()">🚪 Cerrar sesión</a>
            </div>
        </div>
        `;

        return; // 🔥 IMPORTANTE: detener aquí
    }

    // 🔒 SI NO HAY USUARIO
    container.innerHTML = `<button id="loginBtn" onclick="abrirLoginModal()">Login</button>`;
}


async function irPanelAdmin() {
    window.location.href = "/api/panel-admin/";
}




// Mostrar/ocultar dropdown
function toggleUserDropdown() {
    const dropdown = document.getElementById("userDropdown");
    dropdown.classList.toggle("show");
}

// Cerrar sesión
async function cerrarSesion() {
    const token = localStorage.getItem("token");

    try {
        if (token) {
            await fetch("/api/logout/", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${token}`,
                    "Content-Type": "application/json"
                }
            });
        }
    } catch (err) {
        console.error("Error cerrando sesión en backend:", err);
    }

    // Limpieza local (pase lo que pase arriba)
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    carrito = [];
    guardarCarrito();
    renderCarrito();
    actualizarMenuUsuario();

  //  location.reload();
  window.location.href = HOME_URL;

}


// Llamar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    actualizarMenuUsuario();
      actualizarUIUsuario();
});

// Cerrar dropdown si se hace click fuera
document.addEventListener("click", function (e) {
    const dropdown = document.getElementById("userDropdown");
    if (!dropdown) return;

    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("show");
    }
});


function actualizarUIUsuario() {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData) return;

    const userNameSpan = document.getElementById("userName");
    const avatar = document.getElementById("userAvatar");

    const nombreCompleto = userData.nombre + " " + (userData.apellido || "");
    userNameSpan.textContent = nombreCompleto.trim();

    // Inicial para avatar
    avatar.textContent = userData.nombre.charAt(0).toUpperCase();
}



async function cargarCarritoBackend() {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("/api/carrito/", {
        headers: { "Authorization": `Token ${token}` }
    });

    const data = await res.json();
    carrito = data.items.map(i => ({
        id: i.producto,
        nombre: i.nombre,
        precio: parseFloat(i.precio),
        cantidad: i.cantidad,
        backend_id: i.id
    }));

    renderCarrito();
}


async function agregarAlCarrito(producto) {
    const token = localStorage.getItem("token");

    if (token) {
        await fetch("/api/carrito/agregar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({
                producto_id: producto.id,
                cantidad: 1
            })
        });

        cargarCarritoBackend();
    } else {
        // modo invitado (tu lógica actual)
        agregarLocal(producto);
    }
}


async function eliminarDelCarrito(item) {
    const token = localStorage.getItem("token");

    if (token && item.backend_id) {
        await fetch("/api/carrito/eliminar/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({ item_id: item.backend_id })
        });

        cargarCarritoBackend();
    } else {
        eliminarLocal(item.id);
    }
}





function abrirMisPedidos() {
    document.getElementById("misPedidosModal").classList.add("active");
    cargarMisPedidos();
}



function cerrarMisPedidos() {
    document.getElementById("misPedidosModal").classList.remove("active");
}

async function cargarMisPedidos() {
    const token = localStorage.getItem("token");
    const contenedor = document.getElementById("listaPedidos");

    contenedor.innerHTML = "Cargando pedidos...";

    try {
        const res = await fetch("/api/mis-ordenes/", {
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        const pedidos = await res.json();

        if (pedidos.length === 0) {
            contenedor.innerHTML = "<p>No tienes pedidos todavía.</p>";
            return;
        }

        contenedor.innerHTML = "";

        pedidos.forEach(p => {
            const div = document.createElement("div");
            div.className = "pedido-card";

            div.innerHTML = `
                <h4>Pedido #${p.id}</h4>
                <p><strong>Fecha:</strong> ${new Date(p.creado).toLocaleString()}</p>
                <p><strong>Estado:</strong> <span class="estado-${p.estado}">${p.estado}</span></p>

                <p><strong>Total:</strong> $${p.total}</p>
                <ul>
                    ${p.items.map(i => `
                        <li>${i.nombre_producto} x${i.cantidad} — $${i.precio}</li>
                    `).join("")}
                </ul>
            `;

            contenedor.appendChild(div);
        });

    } catch (err) {
        contenedor.innerHTML = "<p>Error cargando pedidos</p>";
        console.error(err);
    }
}


function scrollToMenu() {
    document.querySelector(".hero-menu").scrollIntoView({
        behavior: "smooth"
    });
}



function abrirMisReservas() {
  document.getElementById("misReservasModal").style.display = "flex";
    cargarMisReservas();
}

function cerrarMisReservas() {
  document.getElementById("misReservasModal").style.display = "none";
}

async function cargarMisReservas() {
    const token = localStorage.getItem("token");
    const contenedor = document.getElementById("listaReservas");

    contenedor.innerHTML = "Cargando reservas...";

    try {
        const res = await fetch("/api/mis-reservas/", {
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        const reservas = await res.json();

        if (!reservas.length) {
            contenedor.innerHTML = "<p>No tienes reservas todavía.</p>";
            return;
        }

        contenedor.innerHTML = "";

        reservas.forEach(r => {
            const div = document.createElement("div");
            div.className = "pedido-card"; // reutiliza el mismo estilo

            div.innerHTML = `
                <h4>Reserva #${r.id}</h4>

                <p><strong>Fecha:</strong> ${r.fecha}</p>
                <p><strong>Hora:</strong> ${r.hora_inicio} - ${r.hora_fin}</p>

                <p>
                  <strong>Estado:</strong>
                  <span class="estado-${r.estado}">
                    ${r.estado}
                  </span>
                </p>

                <p>
                  <strong>Mesas:</strong> ${r.mesas} ·
                  <strong>Sillas:</strong> ${r.sillas}
                </p>

                ${r.notas ? `<p><strong>Notas:</strong> ${r.notas}</p>` : ""}
            `;

            contenedor.appendChild(div);
        });

    } catch (err) {
        contenedor.innerHTML = "<p>Error cargando reservas</p>";
        console.error(err);
    }
}




document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();

  alert("📨 Mensaje enviado. Te contactaremos pronto.");
  e.target.reset();
});


function abrirContacto() {
  document.getElementById("contactoModal").classList.add("active");
}

function cerrarContacto() {
  const modal = document.getElementById("contactoModal");
  const form = document.getElementById("contactoForm");

  modal.classList.remove("active");

  if (form) {
    form.reset(); // 👈 limpiar campos al cerrar
  }
}

/* Envío (frontend por ahora) */
document.getElementById("contactoForm").addEventListener("submit", e => {
  e.preventDefault();

  alert("📨 Mensaje enviado. Te contactaremos pronto.");
  cerrarContacto();
});

function cerrarMenuModal() {
  document.getElementById("menuModal").classList.remove("active");
}

function abrirMenuModal() {
  const destino = document.getElementById("productosModal");

  destino.innerHTML = "";

  // 👉 renderizamos TODOS en el modal
  productosGlobal.forEach(prod => {
    const article = document.createElement("article");
    const imagen = prod.imagen ? prod.imagen : "/media/productos/default.png";

    article.className = "producto-card";
    article.innerHTML = `
      <img src="${imagen}" class="producto-img">

      <div class="producto-info">
        <h3>${prod.nombre}</h3>
        <p>Deliciosa preparación hecha al momento.</p>

        <div class="producto-footer">
          <span class="producto-precio">$${prod.precio}</span>

          <div class="cantidad-control">
            <input type="number" min="1" value="1" id="modal-qty-${prod.id}">
            <button class="btn-agregar" onclick="agregarCarrito(
              ${prod.id},
              '${prod.nombre}',
              ${prod.precio},
              'modal-qty-${prod.id}'
            )">
              Agregar
            </button>
          </div>
        </div>
      </div>
    `;

    destino.appendChild(article);
  });

  document.getElementById("menuModal").classList.add("active");
}
