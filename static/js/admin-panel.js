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

 if (seccion === "reservas") {
        titulo.textContent = "Gestion de Reservas";
    cargarReservasAdmin();


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



async function cargarPedidosAdmin() {
    const token = localStorage.getItem("token");
    const contenedor = document.getElementById("adminBody");
    

    contenedor.innerHTML = "Cargando pedidos...";

    const res = await fetch("/api/panel-admin/ordenes/", {
        headers: { "Authorization": `Token ${token}` }
    });

    const pedidos = await res.json();

    if (!pedidos.length) {
        contenedor.innerHTML = "<p>No hay pedidos aún</p>";
        return;
    }

    contenedor.innerHTML = ""; // Limpiamos el contenedor

    // Creamos las tarjetas de pedido
    pedidos.forEach(p => {
        const card = document.createElement("div");
        card.className = "admin-card"; // Asegúrate de que las tarjetas tienen la clase admin-card
        card.setAttribute("data-estado", p.estado);

        card.innerHTML = `
            <h3>Pedido #${p.id}</h3>
            <p><strong>Cliente:</strong> ${p.cliente_nombre || "Invitado"}</p>
            <p><strong>Total:</strong> $${p.total}</p>

            <p><strong>Estado:</strong>
                <select onchange="cambiarEstado(${p.id}, this.value)">
                    <option value="pendiente" ${p.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="preparando" ${p.estado === "preparando" ? "selected" : ""}>Preparando</option>
                    <option value="entregado" ${p.estado === "entregado" ? "selected" : ""}>Entregado</option>
                </select>
            </p>

            <ul>
                ${p.items.map(i => `<li>${i.nombre_producto} x${i.cantidad}</li>`).join("")}
            </ul>
        `;

        contenedor.appendChild(card); // Añadimos la tarjeta al contenedor
    });
}






async function cambiarEstado(id, estado) {
    const token = localStorage.getItem("token");

    await fetch(`/api/panel-admin/ordenes/${id}/estado/`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
        },
        body: JSON.stringify({ estado })
    });

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

  document.getElementById("btnFiltrar").onclick = () => {
    cargarDashboardAdmin(
      dashDesde.value,
      dashHasta.value
    );
  };
}





// 🔥 Exponer funciones para onclick del HTML
window.cargarSeccion = cargarSeccion;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
