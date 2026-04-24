

let modoFormulario = "crear"; // o "editar"
let usuarioEditandoId = null;



document.addEventListener("DOMContentLoaded", () => {
  //  const user = JSON.parse(localStorage.getItem("user"));
    const user = JSON.parse(sessionStorage.getItem("user"));


    if (!user || (!user.is_staff && !user.is_superuser)) {
     //   alert("No tienes permisos para acceder aquí");
        window.location.href = HOME_URL;
    }
});



async function cargarClientesAdmin() {
  //  const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");
    const cuerpo = document.getElementById("adminBody");
  
    cuerpo.innerHTML = `

     <!-- Contenedor para el botón "Crear Usuario" y el filtro -->
    <div class="acciones-usuarios">
        <button class="btn-crear" onclick="abrirModalCrearUsuario()"><i class="fas fa-plus"></i> Crear Usuario</button>
  
        <select id="filtroRol">
            <option value="">Filtrar por rol</option>
            <option value="cliente">Clientes</option>
            <option value="empleado">Empleados</option>
            <option value="gerente">Gerentes</option>
            <option value="cajero">Cajeros</option>
            <option value="cocina">Cocina</option>
            <option value="admin">Administradores</option>
        </select>
    </div>




    <div class="admin-clientes-header">
        <h2><i class="fas fa-users"></i> Gestión de Usuarios</h2>
    </div>


    <div class="tabla-wrapper">
        <div id="tablaUsuarios">  Cargando usuarios...</div>
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
function abrirModalCrearUsuario() {

    window.usuarioEditandoId = null;

    document.getElementById("formUsuario").reset();
    document.getElementById("activoUsuario").checked = true;

    // 🔥 mostrar password
   // document.getElementById("passwordFields").style.display = "block";

    document.querySelector(".modal-usuariopanel__title").innerHTML =
        '<i class="fas fa-user-plus"></i> Crear Usuario';

    document.getElementById("modalUsuario").style.display = "block";
}


async function cargarTablaUsuarios(rol) {
   // const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");

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
        u.rol === "cliente" ? `<i class="fas fa-user"></i> Cliente` :
        u.rol === "empleado" ? `<i class="fas fa-screwdriver-wrench"></i> Empleado` :
        u.rol === "supervisor" ? `<i class="fas fa-compass"></i> Supervisor` :
        u.rol === "admin" ? `<i class="fas fa-crown"></i> Administrador` :
        u.rol === "superuser" ? `<i class="fas fa-fire"></i> Superuser` :
        u.rol === "cocina" ? `<i class="fas fa-utensils"></i> Cocina` :
        u.rol === "cajero" ? `<i class="fas fa-cash-register"></i> Cajero` :
        "—"
    }
</span>
</td>

                             <td>
    <span class="${u.is_active ? 'badge-activo' : 'badge-inactivo'}">
        ${
            u.is_active 
            ? `<i class="fas fa-circle-check"></i> Activo`
            : `<i class="fas fa-circle-xmark"></i> Inactivo`
        }
    </span>
</td>
                                <td class="acciones">
    <button 
        class="btn-editaradminuser"
        onclick="editarUsuario(${u.id})"
    >
         <i class="fas fa-edit"></i> Editar
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
            <h2 class="modal-usuariopanel__title"> <i class="fas fa-user-plus"></i> Crear Usuario</h2>
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
            <option value="cocina">Cocina</option>
            <option value="gerente">Gerente</option>
            <option value="cajero">Cajero</option>
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
    <div id="adminFields" class="modal-usuariopanel__admin"   >
        <label>
            <input type="checkbox" id="isSuperUsuario"  >
            Superusuario
        </label>
    </div>

    <!-- Password -->
<div id="passwordFields" class="hidden" style="display:none;">
    <div>
        <label>Contraseña</label>
        <input type="password" id="passwordUsuario">
    </div>

    <div>
        <label>Confirmar contraseña</label>
        <input type="password" id="passwordConfirmUsuario">
    </div>
</div>

    <!-- BOTONES -->
    <div class="modal-usuariopanel__actions">
        <button type="submit" class="modal-usuariopanel__btn">
          <i class="fas fa-save"></i>  Guardar Usuario
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

    window.usuarioEditandoId = id;

    // rellenar datos
    document.getElementById("usernameUsuario").value = usuario.username;
    document.getElementById("emailUsuario").value = usuario.email;
    document.getElementById("nombreUsuario").value = usuario.nombre;
    document.getElementById("apellidoUsuario").value = usuario.apellido;
    document.getElementById("telefonoUsuario").value = usuario.telefono || "";
    document.getElementById("direccionUsuario").value = usuario.direccion || "";
    document.getElementById("rolUsuario").value = usuario.rol;
    document.getElementById("activoUsuario").checked = usuario.is_active;

    // 🔥 ocultar password
    document.getElementById("passwordFields").style.display = "none";

    document.querySelector(".modal-usuariopanel__title").innerHTML =
        '<i class="fas fa-edit"></i> Editar Usuario';

    document.getElementById("modalUsuario").style.display = "flex";
}

function cerrarModalUsuario() {

    const modal = document.getElementById("modalUsuario");
    if (modal) modal.style.display = "none";
 window.usuarioEditandoId = null;
    const form = document.getElementById("formUsuario");
    if (form) form.reset();
 window.usuarioEditandoId = null;
    const adminFields = document.getElementById("adminFields");
    if (adminFields) adminFields.style.display = "none";

    window.usuarioEditandoId = null;

}

document.addEventListener("submit", async function (e) {

    if (e.target.id !== "formUsuario") return;
    e.preventDefault();

    try {

        const passwordInput = document.getElementById("passwordUsuario");
        const confirmInput = document.getElementById("passwordConfirmUsuario");

        let password = null;
/*
        if (passwordInput && confirmInput) {
            password = passwordInput.value;
            const confirmPassword = confirmInput.value;

            if (password !== confirmPassword) {
                return Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Las contraseñas no coinciden"
                });
            }
        }
*/
      
    

if (!window.usuarioEditandoId) {
    const username = document.getElementById("usernameUsuario").value.trim();
    password = username + "123";
}

        const rol = document.getElementById("rolUsuario").value;
        const token = sessionStorage.getItem("token");
        const superInput = document.getElementById("isSuperUsuario");

        const data = {
            username: document.getElementById("usernameUsuario").value,
            nombre: document.getElementById("nombreUsuario").value,
            apellido: document.getElementById("apellidoUsuario").value,
            email: document.getElementById("emailUsuario").value,
            telefono: document.getElementById("telefonoUsuario").value,
            direccion: document.getElementById("direccionUsuario").value,
            rol: rol,
            is_active: document.getElementById("activoUsuario").checked,
            is_admin: rol === "admin",
            is_superuser: superInput ? superInput.checked : false
        };

        if (password) {
            data.password = password;
        }

        let url = "/api/admin/usuarios/crear/";
        let method = "POST";

        if (window.usuarioEditandoId) {
            url = `/api/panel-admin/usuarios/${window.usuarioEditandoId}/`;
            method = "PATCH";
        }

        const res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}`
            },
            body: JSON.stringify(data)
        });

        let result = {};

        try {
            result = await res.json();
        } catch {
            result = {};
        }

        if (!res.ok) {
            throw new Error(result.error || "Error al procesar el usuario");
        }

        // cerrar modal solo si existe
        if (typeof cerrarModalUsuario === "function") {
            cerrarModalUsuario();
        }

        // recargar tabla solo si existe
        if (typeof cargarTablaUsuarios === "function") {
            cargarTablaUsuarios("");
        }

        await Swal.fire({
            icon: "success",
            title: "Éxito",
            text: window.usuarioEditandoId
                ? "Usuario actualizado correctamente"
                : "Usuario creado correctamente",
            timer: 2000,
            showConfirmButton: false
        });

    } catch (err) {

        console.error("Error:", err);

        Swal.fire({
            icon: "error",
            title: "Error",
            text: err.message || "Error procesando usuario"
        });

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
if (seccion === "cocina") {
        titulo.textContent = "Gestión de Cocina";
        cargarCocinaAdmin();
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
     if (seccion === "reportes") {
        titulo.textContent = "Reportes";
        cargarReportes2();
    }
}


async function cargarContactoAdmin() {
  //  const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");
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
  <h3 class="admin-contactos__titulo"> <i class="fas fa-envelope"></i> Mensaje de contacto</h3>

  <p><strong> <i class="fas fa-user"></i> Nombre:</strong> ${m.nombre}</p>
  <p><strong> <i class="fas fa-envelope"></i> Correo:</strong> ${m.email}</p>

  ${m.telefono ? `<p><strong> <i class="fas fa-phone"></i> Teléfono:</strong> ${m.telefono}</p>` : ""}

  <p><strong> <i class="fas fa-comment"></i> Mensaje:</strong></p>
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
    <strong> <i class="fas fa-clock"></i> Fecha:</strong> ${new Date(m.creado).toLocaleString()}
  </p>
`;


        contenedor.appendChild(card);
    });
}


async function marcarLeido(id, estado) {
 // const token = localStorage.getItem("token");
  const token = sessionStorage.getItem("token");

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
     // alert("Error actualizando estado");
        swal.fire({
    icon: "error",
    title: "Error",
    text: "No se pudo actualizar el estado"
});
      return;
    }

    const data = await res.json();
    console.log("✔ Estado actualizado:", data);

  } catch (err) {
    console.error("❌ Error real de red:", err);
   // alert("Error de conexión");
    Swal.fire({
    icon: "error",
    title: "Error de conexión",
    text: "No se pudo conectar al servidor"
});
  }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

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

   // const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");

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
                    <button class="pedidosadmin-btn activo" data-estado="todos"> <i class="fas fa-list"></i> Todos</button>
                    <button class="pedidosadmin-btn" data-estado="pendiente"> <i class="fas fa-clock"></i> Pendiente</button>
                    <button class="pedidosadmin-btn" data-estado="preparando"> <i class="fas fa-cog"></i> Preparando</button>
                    <button class="pedidosadmin-btn" data-estado="entregado"> <i class="fas fa-truck"></i> Entregado</button>
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
                <h3> <i class="fas fa-list"></i> Pedido #${p.id}</h3>
                <p><strong> <i class="fas fa-user"></i> Cliente:</strong> ${p.cliente_nombre || "Invitado"}</p>
        <p><strong> <i class="fas fa-box"></i> Tipo:</strong> 
        ${
            p.tipo_pedido === "delivery"
            ? `<span class="tipo-delivery"> <i class="fas fa-shipping-fast"></i> Delivery</span>`
            : `<span class="tipo-retirar"> <i class="fas fa-store"></i> Retirar en local</span>`
        }
    </p>
                <p><strong> <i class="fas fa-tag"></i> Total:</strong> $${p.total}</p>
                <p><strong> <i class="fas fa-info-circle"></i> Estado:</strong> 
                    ${
                        p.estado === "entregado"
                        ? `<span class="estado-entregado"> <i class="fas fa-truck"></i> Entregado</span>`
                        : `
                            <select onchange="cambiarEstado(${p.id}, this.value)">
                                <option value="pendiente" ${p.estado === "pendiente" ? "selected" : ""}> <i class="fas fa-clock"></i> Pendiente</option>
                                <option value="preparando" ${p.estado === "preparando" ? "selected" : ""}> <i class="fas fa-cog"></i> Preparando</option>
                            </select>
                        `
                    }
                </p>
               <table class="pedido-tabla">
  <thead>
    <tr>
      <th> <i class="fas fa-list"></i> Descripción</th>
      <th> <i class="fas fa-hashtag"></i> Cantidad</th>
    </tr>
  </thead>
  <tbody>
    ${p.items.map(i => `
      <tr>
        <td>${i.nombre_producto}</td>
        <td>${i.cantidad}</td>
      </tr>
    `).join("")}
  </tbody>
</table>
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


async function cargarCocinaAdmin() {

   // const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");

    const contenedor = document.getElementById("adminBody");

    contenedor.innerHTML = "Cargando pedidos...";

    try {

        const res = await fetch("/api/panel-admin/ordenescocina/", {
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
                    <button class="pedidosadmin-btn activo" data-estado="todos"> <i class="fas fa-list"></i> Todos</button>
                    <button class="pedidosadmin-btn" data-estado="pendiente"> <i class="fas fa-clock"></i> Pendiente</button>
                    <button class="pedidosadmin-btn" data-estado="preparando"> <i class="fas fa-cog"></i> Preparando</button>
                    <button class="pedidosadmin-btn" data-estado="entregado"> <i class="fas fa-truck"></i> Entregado</button>
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
                <h3> <i class="fas fa-list"></i> Pedido #${p.id}</h3>
                <p><strong> <i class="fas fa-user"></i> Cliente:</strong> ${p.cliente_nombre || "Invitado"}</p>
        <p><strong> <i class="fas fa-box"></i> Tipo:</strong> 
        ${
            p.tipo_pedido === "delivery"
            ? `<span class="tipo-delivery"> <i class="fas fa-shipping-fast"></i> Delivery</span>`
            : `<span class="tipo-retirar"> <i class="fas fa-store"></i> Retirar en local</span>`
        }
    </p>
            
                <p><strong> <i class="fas fa-info-circle"></i> Estado:</strong> 
                    ${
                        p.estado === "entregado"
                        ? `<span class="estado-entregado"> <i class="fas fa-truck"></i> Entregado</span>`
                        : `
                            <select onchange="cambiarEstado2(${p.id}, this.value)">
                                <option value="pendiente" ${p.estado === "pendiente" ? "selected" : ""}> <i class="fas fa-clock"></i> Pendiente</option>
                                <option value="preparando" ${p.estado === "preparando" ? "selected" : ""}> <i class="fas fa-cog"></i> Preparando</option>
                            </select>
                        `
                    }
                </p>
               <table class="pedido-tabla">
  <thead>
    <tr>
      <th> <i class="fas fa-list"></i> Descripción</th>
      <th> <i class="fas fa-hashtag"></i> Cantidad</th>
    </tr>
  </thead>
  <tbody>
    ${p.items.map(i => `
      <tr>
        <td>${i.nombre_producto}</td>
        <td>${i.cantidad}</td>
      </tr>
    `).join("")}
  </tbody>
</table>
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

  //  const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");

    await fetch(`/api/panel-admin/ordenes/${id}/estado/`, {
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
async function cambiarEstado2(id, nuevoEstado) {

  //  const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");

    await fetch(`/api/panel-admin/ordenes/${id}/estado/`, {
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
   cargarCocinaAdmin();
}













/* RESERVAS*/
 
  async function cargarReservasAdmin() {
 //   const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");

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
                <h3>    <i class="fas fa-calendar-check"></i> Reserva #${r.id}</h3>

                <p>
                  <strong> <i class="fas fa-user"></i> Cliente:</strong> ${r.nombre} (${r.telefono})
                </p>

                <p>
               <strong> <i class="fas fa-calendar"></i> Fecha:</strong> ${r.fecha}<br>
                   <strong> <i class="fas fa-clock"></i> Hora:</strong> ${r.hora_inicio} - ${r.hora_fin}
                </p>

                <p>
                   <strong> <i class="fas fa-utensils"></i> Mesas:</strong> ${r.mesas} |
                   <strong> <i class="fas fa-chair"></i> Sillas:</strong> ${r.sillas}
                </p>

                <p>
                  <strong> <i class="fas fa-info-circle"></i> Estado:</strong>
                  <select onchange="cambiarEstadoReserva(${r.id}, this.value)">
                      <option value="pendiente" ${r.estado === "pendiente" ? "selected" : ""}> <i class="fas fa-clock"></i> Pendiente</option>
                      <option value="confirmada" ${r.estado === "confirmada" ? "selected" : ""}> <i class="fas fa-check-circle"></i> Confirmada</option>
                      <option value="cancelada" ${r.estado === "cancelada" ? "selected" : ""}> <i class="fas fa-times-circle"></i> Cancelada</option>
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
  //  const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");

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
 // const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");
 

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


function crearKPI(contenedor, titulo, valor, prefijo = "", icono = "") {
  const card = document.createElement("div");
  card.className = "kpi-card";

  card.innerHTML = `
    <span class="kpi-title">
        ${icono ? `<i class="fas ${icono}"></i>` : ""}
        ${titulo}
    </span>
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
 // const token = localStorage.getItem("token");
  const token = sessionStorage.getItem("token");

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

  <div class="dashboard-header">
    <div>
      <h1> <i class="fas fa-chart-line"></i> Dashboard</h1>
      <p class="dashboard-sub">Resumen general del negocio</p>
    </div>
    <div class="dashboard-user">
      <div class="user-avatar">A</div>
      <div>
        <strong>Administrador</strong>
        <span>Panel principal</span>
      </div>
    </div>
  </div>
    <section class="admin-dashboard">

      <div class="dashboard-filtros">
        <input type="date" id="dashDesde">
        <input type="date" id="dashHasta">
        <button id="btnFiltrar"> <i class="fas fa-filter"></i> Filtrar</button>
      </div>

      <div class="kpi-row" id="kpiRow"></div>

      <div class="charts-row">
        <div class="chart-card">
          <h3> <i class="fas fa-chart-line"></i>  Ventas por día</h3>
          <canvas id="ventasChart"></canvas>
        </div>

        <div class="chart-card">
          <h3> <i class="fas fa-calendar-check"></i>  Reservas por día</h3>
          <canvas id="reservasChart"></canvas>
        </div>
      </div>

    <div class="top-row">
    <div class="top-card">
        <h3> <i class="fas fa-fire"></i>  Productos Más Vendidos</h3>
        <div id="topVendidos"></div>
    </div>

    <div class="top-card">
        <h3> <i class="fas fa-coins"></i>  Productos con Más Ingresos</h3>
        <div id="topIngresos"></div>
    </div>
    </div>

    </section>
  `;

  /* KPIs */
  const kpiRow = document.getElementById("kpiRow");
  kpiRow.innerHTML = "";

crearKPI(kpiRow, "Total Órdenes", data.kpis.total_ordenes, "", "fa-receipt");
crearKPI(kpiRow, "Total Ventas", data.kpis.total_ventas, "$", "fa-dollar-sign");
crearKPI(kpiRow, "Reservas Hoy", data.kpis.reservas_hoy, "", "fa-calendar-check");

 data.ordenes_por_estado.forEach(o => {

  const iconosEstado = {
    pendiente: "fa-clock",
    en_proceso: "fa-spinner",
    completado: "fa-circle-check",
    cancelado: "fa-circle-xmark"
  };

  crearKPI(
    kpiRow,
    `Órdenes ${o.estado}`,
    o.total,
    "",
    iconosEstado[o.estado] || "fa-chart-pie"
  );
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
    contenedor.innerHTML = "<p> <i class=\"fas fa-exclamation-circle\"></i> No hay datos</p>";
    return;
  }

  const max = productos[0].total_vendido;

  productos.forEach((p, index) => {
    const porcentaje = (p.total_vendido / max) * 100;

    contenedor.innerHTML += `
      <div class="top-item">
        <div class="top-info">
          <span> #${index + 1} ${p.producto__nombre}</span>
          <strong><i class="fas fa-shopping-cart"></i> ${p.total_vendido} vendidos</strong>
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
          <span> #${index + 1} ${p.producto__nombre}</span>
          <strong> <i class="fas fa-coins"></i> RD$ ${ingresoFormateado}</strong>
        </div>
        <div class="top-bar">
          <div class="top-bar-fill ingresos" style="width:${porcentaje}%"></div>
        </div>
      </div>
    `;
  });
}

async function cargarPuntodeVenta() {

    //const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");
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
       oninput="filtrarProductos(this.value)" >

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
    <span class="label"> <i class="fas fa-money-bill"></i> COBRAR</span>
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
      //  alert("No hay productos en la venta");
      swal.fire({
    icon: "warning",
    title: "Carrito vacío",
    text: "Agrega productos antes de cobrar"
}); 

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
   // const token = localStorage.getItem("token");
   const token = sessionStorage.getItem("token");

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

      //  const token = localStorage.getItem("token");
        const token = sessionStorage.getItem("token");
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
           // alert("Error procesando la venta");
           swal.fire({
    icon: "error",
    title: "Error",
    text: data.error || "Error procesando la venta"
});
            btn.disabled = false;
            btn.innerText = "Confirmar";
        }

    } catch (error) {

       // alert("Error de conexión");
         swal.fire({    
    icon: "error",
    title: "Error de conexión",
    text: "No se pudo conectar al servidor"
});
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
          //  alert("Debe ingresar el monto recibido.");
            swal.fire({
                icon: "warning",
                title: "Monto insuficiente",
                text: "Debe ingresar el monto recibido."
            });
            return;
        }

        if (recibido < total) {
            swal.fire({
                icon: "warning",
                title: "Monto insuficiente",
                text: "El monto recibido es menor que el total."
            });
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
            swal.fire({
                icon: "warning",
                title: "Número de tarjeta inválido",
                text: "El número de tarjeta debe tener al menos 13 dígitos."
            });
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(fecha)) {
            swal.fire({
                icon: "warning",
                title: "Formato de fecha inválido",
                text: "El formato de fecha debe ser MM/AA."
            });
            return;
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            swal.fire({
                icon: "warning",
                title: "CVV inválido",
                text: "El CVV debe tener 3 o 4 dígitos."
            });
            return;
        }
    }

    // ================= TRANSFERENCIA =================
    if (metodo === "transferencia") {

        const referencia = document.getElementById("referenciaTransferencia").value.trim();

        if (referencia === "") {
            swal.fire({
                icon: "warning",
                title: "Referencia de transferencia",
                text: "Debe ingresar la referencia de la transferencia."
            });
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
                <button id="btnNoPrint"> <i class="fas fa-times"></i> No</button>
                <button id="btnPrint"> <i class="fas fa-print"></i> Imprimir</button>
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

  //  const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");

    if (!carrito2.length) {
      //  alert("No hay productos en la venta");
        swal.fire({
            icon: "warning",
            title: "Carrito vacío",
            text: "No hay productos en la venta."
        });
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
                    <i class="fas fa-trash"></i>
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

