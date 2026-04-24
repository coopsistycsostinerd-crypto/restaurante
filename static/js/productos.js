async function cargarProductosAdmin() {

    const token = sessionStorage.getItem("token");
    const contenedor = document.getElementById("adminBody");

    contenedor.innerHTML = "Cargando productos...";

    try {

        const res = await fetch("/api/panel-admin/productos/", {
            headers: { "Authorization": `Token ${token}` }
        });

        const productos = await res.json();

        if (!res.ok) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: productos.detail || "No se pudieron cargar los productos"
            });

            return;
        }

        console.log("categoria", productos);

        contenedor.innerHTML = `
        <div class ="admin-container">
            <div class="productos-header">
                <button class="btn-crear" onclick="abrirModalProducto()"> <i class="fas fa-plus"></i> Crear Producto</button>
            </div>

            <div class="usuarios-header">
                <table class="tabla-admin">
                    <thead>
                        <tr>
                            <th>Imagen</th>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Disponible</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productos.map(p => `
                            <tr>
<td class="col-img">
  ${p.imagen 
      ? `<img src="${p.imagen}" class="img-tabla-producto">` 
      : `<span class="sin-img">—</span>`}
</td>

<td>${p.nombre}</td>
<td>${p.categoria_nombre || ''}</td>
<td>$${p.precio}</td>
<td>${p.disponible ? '✅' : '❌'}</td>
<td>
<button onclick='editarProducto(${JSON.stringify(p)})'><i class="fas fa-edit"></i></button>
</td>
</tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MODAL -->
        <div id="modalProducto" class="modal">
            <div class="modal-content">
                <span class="close" onclick="cerrarModalProducto()">&times;</span>
                <h2 id="modalTitulo"> <i class="fas fa-box-open"></i> Crear Producto</h2>

                <form id="formProducto">

<input type="hidden" id="productoId">

<div class="form-grid">

<div class="form-col">
<label>Nombre</label>
<input type="text" id="nombreProducto" required>

<label>Precio</label>
<input type="number" step="0.01" id="precioProducto" required>

<label>Categoría</label>
<select id="categoriaProducto"></select>
</div>

<div class="form-col">
<label>Descripción</label>
<textarea id="descripcionProducto"></textarea>

<label>Imagen</label>
<input type="file" id="imagenProducto">

<label class="checkbox-label">
<input type="checkbox" id="disponibleProducto" checked>
Disponible
</label>
</div>

</div>

<button type="submit" class="btn-guardar"> <i class="fas fa-save"></i> Guardar</button>

</form>
            </div>
        </div>
        `;

        cargarCategoriasSelect();
        document.getElementById("formProducto").onsubmit = guardarProducto;

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor"
        });

    }
}
function mostrarFormularioProducto(producto = null) {
    const cont = document.getElementById("formProductoContainer");

    cont.innerHTML = `
        <div class="form-admin">
            <h3>${producto ? "Editar" : "Nuevo"} Producto</h3>

            <input id="prodNombre" placeholder="Nombre" value="${producto?.nombre || ""}">
            <input id="prodPrecio" type="number" placeholder="Precio" value="${producto?.precio || ""}">
            
         

            <button onclick="guardarProducto(${producto?.id || null})"> <i class="fas fa-save"></i> Guardar</button>
        </div>
    `;
}
function abrirModalProducto() {
    const modal = document.getElementById("modalProducto");
    modal.style.display = "flex";  // IMPORTANTE
    document.getElementById("modalTitulo").textContent = "Crear Producto";
    document.getElementById("formProducto").reset();
    document.getElementById("productoId").value = "";
}
function cerrarModalProducto() {
    document.getElementById("modalProducto").style.display = "none";
}





async function cargarCategoriasSelect() {

    try {

        const res = await fetch("/api/categorias/");
        const categorias = await res.json();

        if (!res.ok) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudieron cargar las categorías"
            });

            return;
        }

        const select = document.getElementById("categoriaProducto");

        select.innerHTML = categorias.map(c =>
            `<option value="${c.id}">${c.nombre}</option>`
        ).join("");

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor"
        });

    }
}
async function guardarProducto(e) {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    const id = document.getElementById("productoId").value;

    const formData = new FormData();
    formData.append("nombre", nombreProducto.value);
    formData.append("descripcion", descripcionProducto.value);
    formData.append("precio", precioProducto.value);
    formData.append("categoria", categoriaProducto.value);
    formData.append("disponible", disponibleProducto.checked);

    if (imagenProducto.files[0]) {
        formData.append("imagen", imagenProducto.files[0]);
    }

    const url = id
        ? `/api/panel-admin/productos/${id}/`
        : `/api/panel-admin/productos/`;

    const method = id ? "PUT" : "POST";

    try {

        const res = await fetch(url, {
            method: method,
            headers: { "Authorization": `Token ${token}` },
            body: formData
        });

        if (!res.ok) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo guardar el producto"
            });

            return;
        }

        Swal.fire({
            icon: "success",
            title: "Producto guardado",
            text: id ? "Producto actualizado correctamente" : "Producto creado correctamente",
            timer: 1800,
            showConfirmButton: false
        });

        cerrarModalProducto();
        cargarProductosAdmin();

    } catch (error) {

        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor"
        });

    }
}

function editarProducto(p) {
    abrirModalProducto();
    modalTitulo.textContent = "Editar Producto";

    productoId.value = p.id;
    nombreProducto.value = p.nombre;
    descripcionProducto.value = p.descripcion;
    precioProducto.value = p.precio;
    categoriaProducto.value = p.categoria;
    disponibleProducto.checked = p.disponible;
}



async function eliminarProducto(id) {

const result = await Swal.fire({
    title: "¿Eliminar producto?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
});

if (!result.isConfirmed) return;

const token = sessionStorage.getItem("token");

try {

    const res = await fetch(`/api/panel-admin/productos/${id}/`, {
        method: "DELETE",
        headers: { "Authorization": `Token ${token}` }
    });

    if (!res.ok) {

        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo eliminar el producto"
        });

        return;
    }

    Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        timer: 1500,
        showConfirmButton: false
    });

    cargarProductosAdmin();

} catch (error) {

    Swal.fire({
        icon: "error",
        title: "Error de conexión",
        text: "No se pudo conectar con el servidor"
    });

}

}