

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
                            <th>Rol</th>
                            <th>Estado</th>
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
                                <td>
                                    ${
                                        u.is_superuser
                                        ? `<span class="badge-rol badge-admin">👑 Admin</span>`
                                        : u.is_staff
                                        ? `<span class="badge-rol badge-staff">🛠 Staff</span>`
                                        : `<span class="badge-rol badge-cliente">👤 Cliente</span>`
                                    }
                                </td>
                                <td>
                                    <span class="${u.is_active ? 'badge-activo' : 'badge-inactivo'}">
                                        ${u.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                                    </span>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL -->
        <div id="modalUsuario" class="modal">
            <div class="modal-content">
                <span class="close" onclick="cerrarModalUsuario()">&times;</span>
                <h2 id="modalTitulo">Crear Usuario</h2>

                <form id="formUsuario">
                    <input type="hidden" id="usuarioId">

                    <label>Nombre</label>
                    <input type="text" id="nombreUsuario" required>

                    <label>Apellido</label>
                    <input type="text" id="apellidoUsuario" required>

                    <label>Email</label>
                    <input type="email" id="emailUsuario" required>

                    <label>Teléfono</label>
                    <input type="text" id="telefonoUsuario">

                    <label>Rol</label>
                    <select id="rolUsuario" required>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="cliente">Cliente</option>
                    </select>

                    <label>
                        <input type="checkbox" id="activoUsuario" checked>
                        Activo
                    </label>

                    <button type="submit" class="btn-guardar">Guardar</button>
                </form>
            </div>
        </div>
        `;

    } catch (err) {
        console.error(err);
        contenedorTabla.innerHTML = "<p>Error cargando usuarios</p>";
    }
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

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
}


function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("collapsed");

    localStorage.setItem("sidebarCollapsed",
        sidebar.classList.contains("collapsed"));
}

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
                            <th>Rol</th>
                            <th>Estado</th>
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
                                <td>
                                    ${
                                        u.is_superuser
                                        ? `<span class="badge-rol badge-admin">👑 Admin</span>`
                                        : u.is_staff
                                        ? `<span class="badge-rol badge-staff">🛠 Staff</span>`
                                        : `<span class="badge-rol badge-cliente">👤 Cliente</span>`
                                    }
                                </td>
                                <td>
                                    <span class="${u.is_active ? 'badge-activo' : 'badge-inactivo'}">
                                        ${u.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                                    </span>
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL -->
        <div id="modalUsuario" class="modal">
            <div class="modal-content">
                <span class="close" onclick="cerrarModalUsuario()">&times;</span>
                <h2 id="modalTitulo">Crear Usuario</h2>

                <form id="formUsuario">
                    <input type="hidden" id="usuarioId">

                    <label>Nombre</label>
                    <input type="text" id="nombreUsuario" required>

                    <label>Apellido</label>
                    <input type="text" id="apellidoUsuario" required>

                    <label>Email</label>
                    <input type="email" id="emailUsuario" required>

                    <label>Teléfono</label>
                    <input type="text" id="telefonoUsuario">

                    <label>Rol</label>
                    <select id="rolUsuario" required>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="cliente">Cliente</option>
                    </select>

                    <label>
                        <input type="checkbox" id="activoUsuario" checked>
                        Activo
                    </label>

                    <button type="submit" class="btn-guardar">Guardar</button>
                </form>
            </div>
        </div>
        `;

    } catch (err) {
        console.error(err);
        contenedorTabla.innerHTML = "<p>Error cargando usuarios</p>";
    }
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
  }, 30000);
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
