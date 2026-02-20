let modoFormulario = "crear"; // o "editar"
let usuarioEditandoId = null;



document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || (!user.is_staff && !user.is_superuser)) {
     //   alert("No tienes permisos para acceder aquí");
        window.location.href = HOME_URL;
    }
});



async function cargarClientesAdmin() {
    const token = localStorage.getItem("token");
    const cuerpo = document.getElementById("adminBody");
  
    cuerpo.innerHTML = `

     <!-- Contenedor para el botón "Crear Usuario" y el filtro -->
    <div class="acciones-usuarios">
        <button class="btn-crear" onclick="abrirModalUsuario()">➕ Crear Usuario</button>
        <select id="filtroRol">
            <option value="">Filtrar por rol</option>
            <option value="cliente">Clientes</option>
            <option value="empleado">Empleados</option>
            <option value="admin">Administradores</option>
        </select>
    </div>




    <div class="admin-clientes-header">
        <h2>Gestión de Usuarios</h2>
    </div>


    <div class="tabla-wrapper">
        <div id="tablaUsuarios">Cargando usuarios...</div>
    </div>
`;

    const selectRol = document.getElementById("filtroRol");

    // Evento para cuando cambia el filtro
    selectRol.addEventListener("change", () => {
        cargarTablaUsuarios(selectRol.value);
    });

    // Cargar tabla inicial (sin filtro)
    cargarTablaUsuarios("");
}

async function cargarTablaUsuarios(rol) {
    const token = localStorage.getItem("token");
    const contenedorTabla = document.getElementById("tablaUsuarios");

    contenedorTabla.innerHTML = "Cargando usuarios...";

    try {
        const url = rol
            ? `/api/panel-admin/clientes/?rol=${rol}`
            : `/api/panel-admin/clientes/`;

        const res = await fetch(url, {
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        if (!res.ok) throw new Error("No autorizado");

        const usuarios = await res.json();
window.usuariosGlobal = usuarios;

        if (usuarios.length === 0) {
            contenedorTabla.innerHTML = "<p>No hay usuarios para este rol.</p>";
            return;
        }

        contenedorTabla.innerHTML = `
        <div class="admin-container">
            <div class="usuarios-header">
                <table class="tabla-admin">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                                <th>Dirección</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Acciones</th>


                        </tr>
                    </thead>
                    <tbody>
                        ${usuarios.map(u => `
                            <tr>
                                <td>${u.id}</td>
                                <td>${u.username}</td>
                                <td>${u.nombre} ${u.apellido}</td>
                                <td>${u.email}</td>
                                <td>${u.telefono || "-"}</td>
                                   <td>${u.direccion || "-"}</td>
                              <td>
    <span class="badge-rol badge-${u.rol}">
        ${
            u.rol === "cliente" ? "👤 Cliente" :
            u.rol === "empleado" ? "🛠 Empleado" :
            u.rol === "supervisor" ? "🧭 Supervisor" :
            u.rol === "admin" ? "👑 Administrador" :
            u.rol === "superuser" ? "🔥 Superuser" :
            "—"
        }
    </span>
</td>

                                <td>
                                    <span class="${u.is_active ? 'badge-activo' : 'badge-inactivo'}">
                                        ${u.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                                    </span>
                                </td>
                                <td class="acciones">
    <button 
        class="btn-editaradminuser"
        onclick="editarUsuario(${u.id})"
    >
        ✏️ Editar
    </button>
</td>

                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL -->
     <div id="modalUsuario" class="modal-usuariopanel">
    <div class="modal-usuariopanel__content">
     
           <div class="modal-usuariopanel__header">
            <h2 class="modal-usuariopanel__title">Crear Usuario</h2>
            <span class="modal-usuariopanel__close" onclick="cerrarModalUsuario()">&times;</span>
        </div>

      <form id="formUsuario" class="modal-usuariopanel__form">

    <!-- Username -->
    <div>
        <label>Username</label>
        <input type="text" id="usernameUsuario" required>
    </div>

    <!-- Email -->
    <div>
        <label>Email</label>
        <input type="email" id="emailUsuario" required>
    </div>

    <!-- Nombre -->
    <div>
        <label>Nombre</label>
        <input type="text" id="nombreUsuario" required>
    </div>

    <!-- Apellido -->
    <div>
        <label>Apellido</label>
        <input type="text" id="apellidoUsuario" required>
    </div>

    <!-- Teléfono -->
    <div>
        <label>Teléfono</label>
        <input type="text" id="telefonoUsuario">
    </div>

    <!-- Dirección -->
    <div>
        <label>Dirección</label>
        <input type="text" id="direccionUsuario">
    </div>

    <!-- Rol -->
    <div>
        <label>Rol</label>
        <select id="rolUsuario" required onchange="toggleAdminFields()">
            <option value="cliente">Cliente</option>
            <option value="empleado">Empleado</option>
            <option value="admin">Admin</option>
        </select>
    </div>

    <!-- Activo -->
    <div class="modal-usuariopanel__checkbox">
        <label>
            <input type="checkbox" id="activoUsuario" checked>
            Activo
        </label>
    </div>

    <!-- ADMIN FIELDS -->
    <div id="adminFields" class="modal-usuariopanel__admin">
        <label>
            <input type="checkbox" id="isSuperUsuario">
            Superusuario
        </label>
    </div>

    <!-- Password -->
    <div>
        <label>Contraseña</label>
        <input type="password" id="passwordUsuario" required>
    </div>

    <!-- Confirm Password -->
    <div>
        <label>Confirmar contraseña</label>
        <input type="password" id="passwordConfirmUsuario" required>
    </div>

    <!-- BOTONES -->
    <div class="modal-usuariopanel__actions">
        <button type="submit" class="modal-usuariopanel__btn">
            Guardar Usuario
        </button>
    </div>
</form>


            </div>
        </div>
        `;

    } catch (err) {
        console.error(err);
        contenedorTabla.innerHTML = "<p>Error cargando usuarios</p>";
    }
}

function editarUsuario(id) {
    const usuario = window.usuariosGlobal.find(u => u.id === id);
    if (!usuario) return;

    // Eliminar modal previo si existe
    const modalPrevio = document.getElementById("modalUsuario");
    if (modalPrevio) modalPrevio.remove();

    // 🧱 Inyectar HTML del modal
    document.body.insertAdjacentHTML("beforeend", `
        <div id="modalUsuario" class="modal-usuariopanel">
            <div class="modal-usuariopanel__content">

                <div class="modal-usuariopanel__header">
                    <h2 class="modal-usuariopanel__title">Editar Usuario</h2>
                    <span class="modal-usuariopanel__close" onclick="cerrarModalUsuario()">&times;</span>
                </div>

                <form id="formUsuario" class="modal-usuariopanel__form">

                    <div>
                        <label>Username</label>
                        <input type="text" id="usernameUsuario" required>
                    </div>

                    <div>
                        <label>Email</label>
                        <input type="email" id="emailUsuario" required>
                    </div>

                    <div>
                        <label>Nombre</label>
                        <input type="text" id="nombreUsuario" required>
                    </div>

                    <div>
                        <label>Apellido</label>
                        <input type="text" id="apellidoUsuario" required>
                    </div>

                    <div>
                        <label>Teléfono</label>
                        <input type="text" id="telefonoUsuario">
                    </div>

                    <div>
                        <label>Dirección</label>
                        <input type="text" id="direccionUsuario">
                    </div>

                    <div>
                        <label>Rol</label>
                        <select id="rolUsuario" required onchange="toggleAdminFields()">
                            <option value="cliente">Cliente</option>
                            <option value="empleado">Empleado</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="admin">Admin</option>
                            <option value="superuser">Superuser</option>
                        </select>
                    </div>

                    <div class="modal-usuariopanel__checkbox">
                        <label>
                            <input type="checkbox" id="activoUsuario">
                            Activo
                        </label>
                    </div>

                    <div class="modal-usuariopanel__actions">
                        <button type="submit" class="modal-usuariopanel__btn">
                            Guardar cambios
                        </button>
                    </div>

                </form>
            </div>
        </div>
    `);

    // 🧾 Rellenar datos
    document.getElementById("usernameUsuario").value = usuario.username;
    document.getElementById("emailUsuario").value = usuario.email;
    document.getElementById("nombreUsuario").value = usuario.nombre;
    document.getElementById("apellidoUsuario").value = usuario.apellido;
    document.getElementById("telefonoUsuario").value = usuario.telefono || "";
    document.getElementById("direccionUsuario").value = usuario.direccion || "";
    document.getElementById("rolUsuario").value = usuario.rol;
    document.getElementById("activoUsuario").checked = usuario.is_active;

    // Mostrar modal
    document.getElementById("modalUsuario").style.display = "flex";

    // Guardar ID para el submit
    window.usuarioEditandoId = id;
}
function cerrarModalUsuario() {
    const modal = document.getElementById("modalUsuario");
    if (modal) modal.remove();
}


document.addEventListener("submit", async function (e) {
    if (e.target.id !== "formUsuario") return;

    e.preventDefault();

    const password = document.getElementById("passwordUsuario").value;
    const confirmPassword = document.getElementById("passwordConfirmUsuario").value;

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
    }

    const rol = document.getElementById("rolUsuario").value;
    const token = localStorage.getItem("token");

    const data = {
        username: document.getElementById("usernameUsuario").value,
        nombre: document.getElementById("nombreUsuario").value,
        apellido: document.getElementById("apellidoUsuario").value,
        email: document.getElementById("emailUsuario").value,
        telefono: document.getElementById("telefonoUsuario").value,
        direccion: document.getElementById("direccionUsuario").value,
        rol: rol,
        password: password,
        is_active: document.getElementById("activoUsuario").checked,
        is_admin: rol === "admin",
        is_superuser: document.getElementById("isSuperUsuario").checked
    };

    try {
        const res = await fetch("/api/admin/usuarios/crear/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (!res.ok) {
            alert("Error: " + JSON.stringify(result));
            return;
        }

        cerrarModalUsuario();
        cargarTablaUsuarios("");
        alert("Usuario creado correctamente");

    } catch (err) {
        console.error(err);
        alert("Error creando usuario");
    }
});




window.addEventListener("click", function (e) {
    const modal = document.getElementById("modalUsuario");
    if (e.target === modal) cerrarModalUsuario();
});

function toggleAdminFields() {
    const rol = document.getElementById("rolUsuario").value;
    const adminFields = document.getElementById("adminFields");

    if (rol === "admin") {
        adminFields.style.display = "block";
    } else {
        adminFields.style.display = "none";
        document.getElementById("isAdminUsuario").checked = false;
        document.getElementById("isSuperUsuario").checked = false;
    }
}

function abrirModalUsuario() {
    const modal = document.getElementById("modalUsuario");
    if (modal) {
        modal.style.display = "block";
    }
}

function cerrarModalUsuario() {
    const modal = document.getElementById("modalUsuario");
    if (modal) modal.style.display = "none";

    const form = document.getElementById("formUsuario");
    if (form) form.reset();

    document.getElementById("adminFields").style.display = "none";
}



function cargarSeccion(seccion) {
    const titulo = document.getElementById("adminTitle");
    const cuerpo = document.getElementById("adminBody");

    cuerpo.innerHTML = "Cargando...";

    if (seccion === "dashboard") {
        titulo.textContent = "Dashboard";
        cargarDashboardAdmin();
        iniciarAutoRefresh();
    }
 if (seccion === "analitica") {
        titulo.textContent = "Analitica";
        cargarAnalytics();
      
    }

 if (seccion === "reservas") {
        titulo.textContent = "Gestion de Reservas";
    cargarReservasAdmin();


    }

     if (seccion === "pos") {
        titulo.textContent = "Punto de Venta";
    cargarPuntodeVenta();
  


    }
     if (seccion === "contacto") {
        titulo.textContent = "Gestion de Contactos";
    cargarContactoAdmin();


    }


    if (seccion === "pedidos") {
        titulo.textContent = "Gestión de Pedidos";
        cargarPedidosAdmin();
    }

    if (seccion === "clientes") {
        titulo.textContent = "Lista de Clientes";
       cargarClientesAdmin();
    }

    if (seccion === "productos") {
        titulo.textContent = "Gestión de Productos";
        cargarProductosAdmin();
    }
    if (seccion === "caja") {
        titulo.textContent = "Gestión de caja";
        cargarCaja();
    }
     if (seccion === "empresa") {
        titulo.textContent = "Gestión de empresa";
        cargarEmpresaAdmin();
    }
}


async function cargarContactoAdmin() {
    const token = localStorage.getItem("token");
    const contenedor = document.getElementById("adminBody");

    contenedor.innerHTML = "Cargando mensajes...";

    const res = await fetch("/panel_admin/contacto/", {
        headers: {
            "Authorization": `Token ${token}`
        }
    });

    if (!res.ok) {
        contenedor.innerHTML = "Error cargando mensajes";
        return;
    }

    const mensajes = await res.json();

    if (!mensajes.length) {
        contenedor.innerHTML = "<p>No hay mensajes</p>";
        return;
    }
    console.log("los mensjaes", mensajes)
    contenedor.innerHTML = ""; // Limpiar contenedor

    mensajes.forEach(m => {
        const card = document.createElement("div");
        card.className = "admin-contactos__card";

     card.innerHTML = `
  <h3 class="admin-contactos__titulo">📩 Mensaje de contacto</h3>

  <p><strong>👤 Nombre:</strong> ${m.nombre}</p>
  <p><strong>📧 Correo:</strong> ${m.email}</p>

  ${m.telefono ? `<p><strong>📞 Teléfono:</strong> ${m.telefono}</p>` : ""}

  <p><strong>📝 Mensaje:</strong></p>
  <div >
    ${m.mensaje}
  </div>
  <label class="admin-contactos__leido">
    <input 
      type="checkbox" 
      ${m.leido ? "checked" : ""} 
      onchange="marcarLeido(${m.id}, this.checked)"
    />
    Marcar como leído
  </label>
  <p class="admin-contactos__fecha">
    <strong>🕒 Fecha:</strong> ${new Date(m.creado).toLocaleString()}
  </p>
`;


        contenedor.appendChild(card);
    });
}


async function marcarLeido(id, estado) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`/panel_admin/contacto/${id}/leido/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`
      },
      body: JSON.stringify({ leido: estado })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error backend:", text);
      alert("Error actualizando estado");
      return;
    }

    const data = await res.json();
    console.log("✔ Estado actualizado:", data);

  } catch (err) {
    console.error("❌ Error real de red:", err);
    alert("Error de conexión");
  }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
}


function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("open");

    localStorage.setItem(
        "sidebarOpen",
        sidebar.classList.contains("open")
    );
}

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("sidebarOpen") === "true") {
        document.getElementById("sidebar").classList.add("open");
    }
});


document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("sidebarCollapsed") === "true") {
        document.getElementById("sidebar").classList.add("collapsed");
    }
});

let pedidosGlobal = [];



async function cargarPedidosAdmin() {

    const token = localStorage.getItem("token");
    const contenedor = document.getElementById("adminBody");

    contenedor.innerHTML = "Cargando pedidos...";

    try {

        const res = await fetch("/api/panel-admin/ordenes/", {
            headers: {
                "Authorization": `Token ${token}`
            }
        });

        const pedidos = await res.json();

        if (!pedidos.length) {
            contenedor.innerHTML = "<p>No hay pedidos aún</p>";
            return;
        }

        // 🔹 ESTRUCTURA PRINCIPAL (NAV + GRID)
        contenedor.innerHTML = `
            <div class="pedidosadmin-topnav">
                <div class="pedidosadmin-estados">
                    <button class="pedidosadmin-btn activo" data-estado="todos">Todos</button>
                    <button class="pedidosadmin-btn" data-estado="pendiente">Pendiente</button>
                    <button class="pedidosadmin-btn" data-estado="preparando">Preparando</button>
                    <button class="pedidosadmin-btn" data-estado="entregado">Entregado</button>
                </div>
            </div>

            <div id="gridPedidos" class="pedidos-grid"></div>
        `;

        const grid = document.getElementById("gridPedidos");

        // 🔹 CREAR TARJETAS
        pedidos.forEach(p => {

            const card = document.createElement("div");
            card.className = "admin-card";
            card.dataset.estado = p.estado;

            card.innerHTML = `
                <h3>Pedido #${p.id}</h3>
                <p><strong>Cliente:</strong> ${p.cliente_nombre || "Invitado"}</p>
        <p><strong>Tipo:</strong> 
        ${
            p.tipo_pedido === "delivery"
            ? `<span class="tipo-delivery">Delivery</span>`
            : `<span class="tipo-retirar">Retirar en local</span>`
        }
    </p>
                <p><strong>Total:</strong> $${p.total}</p>
                <p><strong>Estado:</strong> 
                    ${
                        p.estado === "entregado"
                        ? `<span class="estado-entregado">Entregado</span>`
                        : `
                            <select onchange="cambiarEstado(${p.id}, this.value)">
                                <option value="pendiente" ${p.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
                                <option value="preparando" ${p.estado === "preparando" ? "selected" : ""}>Preparando</option>
                            </select>
                        `
                    }
                </p>
                <ul>
                    ${p.items.map(i => `<li>${i.nombre_producto} x${i.cantidad}</li>`).join("")}
                </ul>
            `;

            grid.appendChild(card);
        });

        // 🔹 ACTIVAR FILTROS
        const botones = document.querySelectorAll(".pedidosadmin-btn");

        botones.forEach(btn => {
            btn.addEventListener("click", function () {

                // Quitar activo
                botones.forEach(b => b.classList.remove("activo"));
                this.classList.add("activo");

                const estado = this.dataset.estado;
                filtrarPedidos(estado);
            });
        });

    } catch (error) {
        contenedor.innerHTML = "<p>Error al cargar pedidos</p>";
        console.error(error);
    }
}





function filtrarPedidos(estado) {

    const cards = document.querySelectorAll(".admin-card");

    cards.forEach(card => {

        if (estado === "todos") {
            card.style.display = "block";
            return;
        }

        if (card.dataset.estado === estado) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });
}



function filtrarEstado(estado) {
    if (estado === "todos") {
        renderPedidos(pedidosGlobal);
        return;
    }

    const filtrados = pedidosGlobal.filter(p => p.estado === estado);
    renderPedidos(filtrados);
}

function filtrarPorFecha() {
    const desde = document.getElementById("fechaDesde").value;
    const hasta = document.getElementById("fechaHasta").value;

    if (!desde || !hasta) return;

    const filtrados = pedidosGlobal.filter(p => {
        const fecha = new Date(p.creado).toISOString().split("T")[0];
        return fecha >= desde && fecha <= hasta;
    });

    renderPedidos(filtrados);
}



async function cambiarEstado(id, nuevoEstado) {

    const token = localStorage.getItem("token");

    await fetch(`/api/panel-admin/ordenes/${id}/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        },
        body: JSON.stringify({
            estado: nuevoEstado
        })
    });

    // Recargamos pedidos
    cargarPedidosAdmin();
}













/* RESERVAS*/
 
  async function cargarReservasAdmin() {
    const token = localStorage.getItem("token");
    const contenedor = document.getElementById("adminBody");

    contenedor.innerHTML = "Cargando reservas...";

    try {
        const res = await fetch("/api/admin-reservas/", {
            headers: { "Authorization": `Token ${token}` }
        });

        const reservas = await res.json();

        if (!reservas.length) {
            contenedor.innerHTML = "<p>No hay reservas aún</p>";
            return;
        }

        contenedor.innerHTML = "";

        reservas.forEach(r => {
            const card = document.createElement("div");
            card.className = "admin-card";
            card.setAttribute("data-estado", r.estado);

            card.innerHTML = `
                <h3>Reserva #${r.id}</h3>

                <p>
                  <strong>Cliente:</strong> ${r.nombre} (${r.telefono})
                </p>

                <p>
                  📅 <strong>Fecha:</strong> ${r.fecha}<br>
                  ⏰ <strong>Hora:</strong> ${r.hora_inicio} - ${r.hora_fin}
                </p>

                <p>
                  🍽️ <strong>Mesas:</strong> ${r.mesas} |
                  🪑 <strong>Sillas:</strong> ${r.sillas}
                </p>

                <p>
                  <strong>Estado:</strong>
                  <select onchange="cambiarEstadoReserva(${r.id}, this.value)">
                      <option value="pendiente" ${r.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
                      <option value="confirmada" ${r.estado === "confirmada" ? "selected" : ""}>Confirmada</option>
                      <option value="cancelada" ${r.estado === "cancelada" ? "selected" : ""}>Cancelada</option>
                  </select>
                </p>
            `;

            contenedor.appendChild(card);
        });

    } catch (err) {
        contenedor.innerHTML = "<p>Error cargando reservas</p>";
        console.error(err);
    }
}
async function cambiarEstadoReserva(reservaId, nuevoEstado) {
    const token = localStorage.getItem("token");

    try {
        await fetch(`/api/panel-admin/reservas/${reservaId}/estado/`, {
            method: "PATCH",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ estado: nuevoEstado })
        });

    } catch (err) {
        console.error("Error cambiando estado de la reserva", err);
    }
}



let ventasChart = null;
let reservasChart = null;
let dashboardTimer = null;

async function cargarDashboardAdmin(desde = "", hasta = "") {
  const token = localStorage.getItem("token");

  let url = "/dashboard/";
  if (desde && hasta) {
    url += `?from=${desde}&to=${hasta}`;
  }

  const res = await fetch(url, {
    headers: { Authorization: `Token ${token}` }
  });

  const data = await res.json();
  renderDashboard(data);
}


function iniciarAutoRefresh(desde = "", hasta = "") {
  if (dashboardTimer) clearInterval(dashboardTimer);

  dashboardTimer = setInterval(() => {
    cargarDashboardAdmin(desde, hasta);
  }, 400000);
}


function crearKPI(contenedor, titulo, valor, prefijo = "") {
  const card = document.createElement("div");
  card.className = "kpi-card";

  card.innerHTML = `
    <span>${titulo}</span>
    <strong>0</strong>
  `;

  contenedor.appendChild(card);

  const strong = card.querySelector("strong");
  let actual = 0;
  const step = Math.max(1, Math.ceil(valor / 25));

  const anim = setInterval(() => {
    actual += step;
    if (actual >= valor) {
      actual = valor;
      clearInterval(anim);
    }
    strong.textContent = prefijo + actual;
  }, 20);
}
async function cargarDashboardAdminFiltrado(desde, hasta) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `/dashboard/?from=${desde}&to=${hasta}`,
    { headers: { Authorization: `Token ${token}` } }
  );

  const data = await res.json();

  // simple: vuelve a dibujar con nuevos datos
  cargarDashboardAdmin();
}


function renderDashboard(data) {
  const contenedor = document.getElementById("adminBody");

  contenedor.innerHTML = `
    <section class="admin-dashboard">

      <div class="dashboard-filtros">
        <input type="date" id="dashDesde">
        <input type="date" id="dashHasta">
        <button id="btnFiltrar">Filtrar</button>
      </div>

      <div class="kpi-row" id="kpiRow"></div>

      <div class="charts-row">
        <div class="chart-card">
          <h3>📈 Ventas por día</h3>
          <canvas id="ventasChart"></canvas>
        </div>

        <div class="chart-card">
          <h3>🪑 Reservas por día</h3>
          <canvas id="reservasChart"></canvas>
        </div>
      </div>

    <div class="top-row">
    <div class="top-card">
        <h3>🔥 Productos Más Vendidos</h3>
        <div id="topVendidos"></div>
    </div>

    <div class="top-card">
        <h3>💰 Productos con Más Ingresos</h3>
        <div id="topIngresos"></div>
    </div>
    </div>

    </section>
  `;

  /* KPIs */
  const kpiRow = document.getElementById("kpiRow");
  kpiRow.innerHTML = "";

  crearKPI(kpiRow, "Total Órdenes", data.kpis.total_ordenes);
  crearKPI(kpiRow, "Total Ventas", data.kpis.total_ventas, "$");
  crearKPI(kpiRow, "Reservas Hoy", data.kpis.reservas_hoy);

  data.ordenes_por_estado.forEach(o => {
    crearKPI(kpiRow, `Órdenes ${o.estado}`, o.total);
  });

  /* Charts */
  if (ventasChart) ventasChart.destroy();
  ventasChart = new Chart(
    document.getElementById("ventasChart"),
    {
      type: "line",
      data: {
        labels: data.ventas_por_dia.map(v => v.creado__date),
        datasets: [{
          label: "Ventas",
          data: data.ventas_por_dia.map(v => v.total),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37,99,235,.15)",
          fill: true,
          tension: .4
        }]
      }
    }
  );

  if (reservasChart) reservasChart.destroy();
  reservasChart = new Chart(
    document.getElementById("reservasChart"),
    {
      type: "bar",
      data: {
        labels: data.reservas_por_dia.map(r => r.fecha),
        datasets: [{
          label: "Reservas",
          data: data.reservas_por_dia.map(r => r.total),
          backgroundColor: "#22c55e"
        }]
      }
    }
  );
renderTopVendidos(data.productos_mas_vendidos);
renderTopIngresos(data.productos_mas_ingresos);

  document.getElementById("btnFiltrar").onclick = () => {
    cargarDashboardAdmin(
      dashDesde.value,
      dashHasta.value
    );
  };
}
function renderTopVendidos(productos) {
  const contenedor = document.getElementById("topVendidos");
  contenedor.innerHTML = "";

  if (!productos || productos.length === 0) {
    contenedor.innerHTML = "<p>No hay datos</p>";
    return;
  }

  const max = productos[0].total_vendido;

  productos.forEach((p, index) => {
    const porcentaje = (p.total_vendido / max) * 100;

    contenedor.innerHTML += `
      <div class="top-item">
        <div class="top-info">
          <span>#${index + 1} ${p.producto__nombre}</span>
          <strong>${p.total_vendido} vendidos</strong>
        </div>
        <div class="top-bar">
          <div class="top-bar-fill" style="width:${porcentaje}%"></div>
        </div>
      </div>
    `;
  });
}
function renderTopIngresos(productos) {
  const contenedor = document.getElementById("topIngresos");
  contenedor.innerHTML = "";

  if (!productos || productos.length === 0) {
    contenedor.innerHTML = "<p>No hay datos</p>";
    return;
  }

  const max = Number(productos[0].total_ingresos);

  productos.forEach((p, index) => {
    const ingresos = Number(p.total_ingresos);
    const porcentaje = (ingresos / max) * 100;

    const ingresoFormateado = ingresos.toLocaleString("es-DO", {
      minimumFractionDigits: 2
    });

    contenedor.innerHTML += `
      <div class="top-item">
        <div class="top-info">
          <span>#${index + 1} ${p.producto__nombre}</span>
          <strong>RD$ ${ingresoFormateado}</strong>
        </div>
        <div class="top-bar">
          <div class="top-bar-fill ingresos" style="width:${porcentaje}%"></div>
        </div>
      </div>
    `;
  });
}

async function cargarPuntodeVenta() {

    const token = localStorage.getItem("token");
    const contenedor = document.getElementById("adminBody");

    contenedor.innerHTML = "Cargando productos...";

    const res = await fetch("/api/productos/", {
        headers: {
            "Authorization": `Token ${token}`
        }
    });

    if (!res.ok) {
        contenedor.innerHTML = "Error cargando productos";
        return;
    }

    const productos = await res.json();
window.productosAdminPOS = productos;



// =============================
// EXTRAER CATEGORÍAS ÚNICAS
// =============================
      // ===============================
// EXTRAER CATEGORÍAS ÚNICAS
// ===============================
const categoriasUnicas = [...new Set(
    productos.map(p => p.categoria)
)];




    // 🧠 Layout base del POS
contenedor.innerHTML = `
<div class="pos">

    <!-- ================= COLUMNA PRODUCTOS ================= -->
    <div class="pos-col products-col">

          <div class="col-header">

    <input type="text"
       placeholder="Buscar producto..."
       oninput="filtrarProductos(this.value)">

    <!-- 🔥 NUEVA BARRA DE CATEGORÍAS -->
   <div class="adminpos-categorias-wrapper">
    <div class="adminpos-categorias" id="adminposCategorias"></div>
</div>


</div>


        <div class="col-body products-body" id="posProductos">
        </div>

    </div>

    <!-- ================= COLUMNA TICKET ================= -->
    <div class="pos-col ticket-col">

        <div class="col-header ticket-header">
            Ticket
        </div>

        <div class="col-body ticket-body" id="posCarrito">
        </div>

       <div class="col-footer ticket-footer">
<div class="tax-toggle">
    <label>
       <input type="checkbox"
       id="activarImpuesto"
       checked
       onchange="actualizarTotales()">

        Aplicar ITBIS (18%)
    </label>
</div>

    <div class="summary-row">
        <span>SubTotal</span>
        <span>RD$ <span id="posSubtotal">0.00</span></span>
    </div>
 

    <div class="summary-row">
        <span>ITBIS (18%)</span>
        <span>RD$ <span id="posTax">0.00</span></span>
    </div>



<button class="summary-total-btn  btn-charge" onclick="abrirModalCobro()">
    <span class="label">COBRAR</span>
    <span class="amount">RD$ <span id="posTotal">0.00</span></span>
</button>

</div>


    </div>

</div>
`;


const categoriasContainer = document.getElementById("adminposCategorias");

// Botón TODOS
const btnTodos = document.createElement("div");
btnTodos.className = "adminpos-categoria-btn active";
btnTodos.textContent = "Todos";
btnTodos.onclick = () => filtrarAdminPOS("all", btnTodos);
categoriasContainer.appendChild(btnTodos);

// Botones por categoría
categoriasUnicas.forEach(cat => {
    const btn = document.createElement("div");
    btn.className = "adminpos-categoria-btn";
    btn.textContent = cat;

    btn.onclick = () => filtrarAdminPOS(cat, btn);

    categoriasContainer.appendChild(btn);
});




    const grid = document.getElementById("posProductos");

    productos.forEach(p => {
        const btn = document.createElement("div");
        btn.className = "pos-producto-btn";
        btn.setAttribute("data-categoria", p.categoria?.id || "");


        btn.innerHTML = `
    ${p.imagen 
        ? `<img src="${p.imagen}" class="producto-img">`
        : `<div class="producto-sin-img">Sin imagen</div>`
    }

    <strong>${p.nombre}</strong>
   <p>RD$ ${formatoRD.format(p.precio)}</p>

`;


        btn.onclick = () => agregarProducto(p);

        grid.appendChild(btn);
    });
    filtrarAdminPOS();

}

function filtrarAdminPOS(categoriaNombre, botonActivo) {

    document.querySelectorAll(".adminpos-categoria-btn")
        .forEach(b => b.classList.remove("active"));

    botonActivo.classList.add("active");

    const grid = document.getElementById("posProductos");
    grid.innerHTML = "";

    let filtrados;

    if (categoriaNombre === "all") {
        filtrados = window.productosAdminPOS;
    } else {
        filtrados = window.productosAdminPOS.filter(
            p => p.categoria === categoriaNombre
        );
    }

    filtrados.forEach(p => {
        const btn = document.createElement("div");
        btn.className = "pos-producto-btn";

        btn.innerHTML = `
            ${p.imagen 
                ? `<img src="${p.imagen}" class="producto-img">`
                : `<div class="producto-sin-img">Sin imagen</div>`
            }
            <strong>${p.nombre}</strong>
            <p>RD$ ${formatoRD.format(parseFloat(p.precio))}</p>
        `;

        btn.onclick = () => agregarProducto(p);
        grid.appendChild(btn);
    });
}


function abrirModalCobro() {

    if (!carrito2.length) {
        alert("No hay productos en la venta");
        return;
    }

    let subtotal = 0;

    carrito2.forEach(item => {
        subtotal += item.precio * item.cantidad;
    });

    const aplicarImpuesto = document.getElementById("activarImpuesto")?.checked;
    const impuesto = aplicarImpuesto ? subtotal * 0.18 : 0;
    const total = subtotal + impuesto;

    const inputTotal = document.getElementById("totalCobroInput");
    inputTotal.value = total.toFixed(2);

    document
        .getElementById("modalPosConfirmacionVenta")
        .classList.add("active");

    cargarClientesconfirmacion();
}

let clientesGlobal = [];

async function cargarClientesconfirmacion() {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/panel-admin/clientes/", {
        headers: { "Authorization": `Token ${token}` }
    });

    clientesGlobal = await res.json();
}


// 🔥 EVENTO BUSCADOR
document.getElementById("buscarCliente").addEventListener("input", function () {

    const filtro = this.value.toLowerCase();
    const lista = document.getElementById("listaClientes");
    lista.innerHTML = "";

    if (!filtro) {
        document.getElementById("clienteSeleccionadoId").value = "";
        return;
    }

    const textoBusqueda = filtro.replace(/\s+/g, "").toLowerCase();

    const filtrados = clientesGlobal.filter(cliente => {

        if (!cliente) return false;

        const nombre = String(cliente.nombre || "").toLowerCase();
        const telefono = String(cliente.telefono || "").replace(/\s+/g, "");
        const correo = String(cliente.correo || "").toLowerCase();
        const cedula = String(cliente.cedula || "").replace(/\s+/g, "");

        return (
            nombre.includes(textoBusqueda) ||
            telefono.includes(textoBusqueda) ||
            correo.includes(textoBusqueda) ||
            cedula.includes(textoBusqueda)
        );
    });

    // 🔥 Si no encuentra nada
    if (filtrados.length === 0) {
        const div = document.createElement("div");
        div.className = "cliente-item";
        div.textContent = "No se encontraron clientes";
        div.style.opacity = "0.6";
        lista.appendChild(div);
        return;
    }

    // 🔥 CREAR LISTA
    filtrados.slice(0, 8).forEach(cliente => {

        const div = document.createElement("div");
        div.className = "cliente-item";
        div.textContent = `${cliente.nombre} - ${cliente.telefono || ""}`;

        div.onclick = () => {

            // Mostrar en buscador
            document.getElementById("buscarCliente").value =
                `${cliente.nombre} - ${cliente.telefono || ""}`;

            // Guardar ID
            document.getElementById("clienteSeleccionadoId").value = cliente.id;

            // Llenar inputs inferiores
            document.getElementById("nuevoNombre").value = cliente.nombre || "";
            document.getElementById("nuevoTelefono").value = cliente.telefono || "";

            // Limpiar lista visual
            lista.innerHTML = "";
        };

        lista.appendChild(div);
    });

});




function actualizarTotales() {

    let subtotal = 0;

    carrito2.forEach(item => {
        subtotal += item.precio * item.cantidad;
    });

    const aplicarImpuesto = document.getElementById("activarImpuesto").checked;

    const impuesto = aplicarImpuesto ? subtotal * 0.18 : 0;
    const total = subtotal + impuesto;

    document.getElementById("posSubtotal").textContent = formatoRD.format(subtotal);
    document.getElementById("posTax").textContent = formatoRD.format(impuesto);
    document.getElementById("posTotal").textContent = formatoRD.format(total);

}


const formatoRD = new Intl.NumberFormat("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});


function cerrarModal() {
    const modal = document.getElementById("modalPosConfirmacionVenta");

    console.log("Modal encontrado:", modal);

    if (modal) {
        modal.classList.remove("active");
    } else {
        alert("Modal no encontrado");
    }
}

function mostrarCamposPago2() {

    const metodo = document.getElementById("metodoPago").value;
    console.log("Método seleccionado:", metodo);
    document.getElementById("pagoEfectivo").style.display = "none";
    document.getElementById("pagoTarjeta").style.display = "none";
    document.getElementById("pagoTransferencia").style.display = "none";

    if (metodo === "efectivo")
        document.getElementById("pagoEfectivo").style.display = "block";

    if (metodo === "tarjeta")
        document.getElementById("pagoTarjeta").style.display = "block";

    if (metodo === "transferencia")
        document.getElementById("pagoTransferencia").style.display = "block";
}
async function confirmarCobro() {

    const btn = document.getElementById("btnConfirmarCobro");

    // 🔒 Evita doble clic
    if (btn.disabled) return;

    btn.disabled = true;
    btn.innerText = "Procesando...";

    try {

        const token = localStorage.getItem("token");
        const metodo = document.getElementById("metodoPago").value;
        const nombre = document.getElementById("nuevoNombre").value;
        const telefono = document.getElementById("nuevoTelefono").value;

        const productosEnviar = carrito2.map(p => ({
            id: p.id,
            cantidad: p.cantidad
        }));

        const totalFinal = parseFloat(document.getElementById("totalCobroInput").value) || 0;

        const res = await fetch("/api/pos/crear-venta-pos/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify({
                productos: productosEnviar,
                metodo_pago: metodo,
                total: totalFinal,
                cliente_nombre: nombre,
                cliente_telefono: telefono
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {

            cerrarModal();

            // 🖨 Abrir ticket
            const url = `/api/caja/ticket/${data.venta_id}/`;
            window.open(url, "_blank");

            // 🧹 Limpiar carrito
            carrito2 = [];
            renderCarrito2();
              document.getElementById("nuevoNombre").value = "";
    document.getElementById("nuevoTelefono").value = "";
    document.getElementById("metodoPago").value = "";
    document.getElementById("totalCobroInput").value = "";

        } else {
            alert("Error procesando la venta");
            btn.disabled = false;
            btn.innerText = "Confirmar";
        }

    } catch (error) {

        alert("Error de conexión");
        btn.disabled = false;
        btn.innerText = "Confirmar";

    }
}
function validarYConfirmar() {

    const metodo = document.getElementById("metodoPago").value;
    const total = parseFloat(document.getElementById("totalCobroInput").value) || 0;

    // ================= EFECTIVO =================
    if (metodo === "efectivo") {

        const recibido = parseFloat(document.getElementById("montoRecibido").value) || 0;

        if (!recibido) {
            alert("Debe ingresar el monto recibido.");
            return;
        }

        if (recibido < total) {
            alert("El monto recibido es menor que el total.");
            return;
        }
    }

    // ================= TARJETA =================
    if (metodo === "tarjeta") {

        const inputs = document.querySelectorAll("#pagoTarjeta input");

        const numero = inputs[0].value.trim();
        const fecha = inputs[1].value.trim();
        const cvv = inputs[2].value.trim();

        if (numero.length < 13) {
            alert("Número de tarjeta inválido.");
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(fecha)) {
            alert("Formato de fecha inválido (MM/AA).");
            return;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            alert("CVV inválido.");
            return;
        }
    }

    // ================= TRANSFERENCIA =================
    if (metodo === "transferencia") {

        const referencia = document.getElementById("referenciaTransferencia").value.trim();

        if (referencia === "") {
            alert("Debe ingresar la referencia de la transferencia.");
            return;
        }
    }

    // ✅ Si todo pasa las validaciones
    confirmarCobro();
}

function calcularCambio() {

    const totalInput = document.getElementById("totalCobroInput");
    const recibidoInput = document.getElementById("montoRecibido");
    const cambioSpan = document.getElementById("cambio");

    if (!totalInput || !recibidoInput || !cambioSpan) return;

    // 🔹 Limpiar separadores de miles
    const total = parseFloat(totalInput.value.replace(/,/g, "")) || 0;
    const recibido = parseFloat(recibidoInput.value.replace(/,/g, "")) || 0;

    const cambio = recibido - total;

    if (cambio >= 0) {
        cambioSpan.textContent = cambio.toLocaleString("es-DO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        cambioSpan.style.color = "green";
    } else {
        cambioSpan.textContent = "0.00";
        cambioSpan.style.color = "red";
    }
}



function mostrarConfirmacionImpresion(ventaId) {

    const overlay = document.createElement("div");
    overlay.className = "print-confirm-overlay";

    overlay.innerHTML = `
        <div class="print-confirm-box">
            <h3>Venta realizada con éxito</h3>
            <p>¿Desea imprimir el ticket?</p>
            <div class="buttons">
                <button id="btnNoPrint">No</button>
                <button id="btnPrint">Imprimir</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("btnPrint").onclick = () => {
       window.location.href = `/api/caja/ticket/${ventaId}/`;

        overlay.remove();
    };

    document.getElementById("btnNoPrint").onclick = () => {
        overlay.remove();
    };
}



function cerrarModal() {
   const modal = document.getElementById("modalPosConfirmacionVenta");
    if (modal) {
        modal.classList.remove("active");
    }

}

function cargarProductospos() {
    fetch("/api/pos/productos/")
        .then(res => res.json())
        .then(data => {
            const contenedor = document.getElementById("productosPOS");
            contenedor.innerHTML = "";

            data.forEach(p => {
             contenedor.innerHTML += `
    <div class="producto-btn"
        onclick="agregarProducto(${p.id}, '${p.nombre}', ${p.precio})">
        <h4>${p.nombre}</h4>
    <p>RD$ ${formatoRD.format(p.precio)}</p>
    </div>
`;

            });
        });
}


document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
});


async function cobrarVenta() {

    const token = localStorage.getItem("token");

    if (!carrito2.length) {
        alert("No hay productos en la venta");
        return;
    }

    const res = await fetch("/panel_admin/crear-venta/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        },
        body: JSON.stringify({
            productos: carrito2
        })
    });

    const data = await res.json();

    if (data.success) {
        window.open(`/caja/ticket/${data.venta_id}/`);
        carrito2 = [];
        renderCarrito2();
    }
}



let carrito2 = [];

function agregarProducto(producto) {

    const existe = carrito2.find(p => p.id === producto.id);

    if (existe) {
        existe.cantidad += 1; // 🔥 aquí suma 1
    } else {
        carrito2.push({
            ...producto,
            cantidad: 1
        });
    }

    renderCarrito2();
}


function renderCarrito2() {

    const contenedor = document.getElementById("posCarrito");

    contenedor.innerHTML = "";

    let total = 0;

    carrito2.forEach(p => {

        const subtotal = p.precio * p.cantidad;
        total += subtotal;

        contenedor.innerHTML += `
            <div class="carrito-item">
                <span>${p.nombre}</span>

                <div class="cantidad-control">
                    <input type="number" 
                           value="${p.cantidad}" 
                           min="1"
                           onchange="editarCantidad(${p.id}, this.value)">
               </div>

                <span>RD$ ${formatoRD.format(subtotal)}</span>

                <button class="btn-eliminar"
                        onclick="eliminarProducto(${p.id})">
                        🗑
                </button>
            </div>
        `;
    });

    actualizarTotales();
}



function cambiarCantidad(id, cambio) {

    const producto = carrito2.find(p => p.id === id);

    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        carrito2 = carrito2.filter(p => p.id !== id);
    }

    renderCarrito2();
}

function editarCantidad(id, nuevaCantidad) {

    const producto = carrito2.find(p => p.id === id);

    if (!producto) return;

    producto.cantidad = parseInt(nuevaCantidad);

    if (producto.cantidad <= 0 || isNaN(producto.cantidad)) {
        carrito2 = carrito2.filter(p => p.id !== id);
    }

    renderCarrito2();
}
function eliminarProducto(id) {
    carrito2 = carrito2.filter(p => p.id !== id);
    renderCarrito2();
}


function filtrarProductos(texto) {

    texto = texto.toLowerCase().trim();

    const productos = document.querySelectorAll(".pos-producto-btn");

    productos.forEach(producto => {

        const nombre = producto.querySelector("strong")?.textContent.toLowerCase() || "";

        producto.hidden = !nombre.includes(texto);

    });
}
 
async function cargarCategoriasAdminPOS() {

    try {
        const res = await fetch("/api/categorias/");
        const categorias = await res.json();

        const contenedor = document.getElementById("adminposCategorias");
        contenedor.innerHTML = "";

        // Botón Todos
        const btnTodos = document.createElement("div");
        btnTodos.className = "adminpos-categoria-btn active";
        btnTodos.textContent = "Todos";
        btnTodos.onclick = () => filtrarAdminPOS(null, btnTodos);
        contenedor.appendChild(btnTodos);

        categorias.forEach(cat => {
            const btn = document.createElement("div");
            btn.className = "adminpos-categoria-btn";
            btn.textContent = cat.nombre;

            btn.onclick = () => filtrarAdminPOS(cat.id, btn);

            contenedor.appendChild(btn);
        });

    } catch (error) {
        console.error("Error cargando categorias POS:", error);
    }
}


document.querySelectorAll(".producto-btn")
document.addEventListener("DOMContentLoaded", function () {

    const check = document.getElementById("activarImpuesto");

    if (check) {
        check.addEventListener("change", actualizarTotales);
    }

});

// 🔥 Exponer funciones para onclick del HTML
window.cargarSeccion = cargarSeccion;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
