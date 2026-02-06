async function cargarEmpresaAdmin() {
  const token = localStorage.getItem("token");

    const body = document.getElementById("adminBody");
    body.innerHTML = "Cargando datos de la empresa...";
 

    const res = await fetch("/config/empresa/", {
        headers: { "Authorization": `Token ${token}` }
    });

    const e = await res.json();
body.innerHTML = `
<div class="form-wrapper">
    <h2 class="form-title">🏢 Configuración de la Empresa</h2>

    <div class="form-grid">

        <div class="form-group">
            <label>Nombre Comercial</label>
            <input id="empNombre" type="text" placeholder="Ingrese el nombre comercial">
        </div>

        <div class="form-group">
            <label>Razón Social</label>
            <input id="empRazon" type="text" placeholder="Ingrese la razón social">
        </div>

        <div class="form-group">
            <label>RNC</label>
            <input id="empRnc" type="text" placeholder="Ingrese el RNC">
        </div>

        <div class="form-group">
            <label>Teléfono</label>
            <input id="empTel" type="text" placeholder="Ingrese el teléfono">
        </div>

        <div class="form-group">
            <label>Email</label>
            <input id="empEmail" type="email" placeholder="Ingrese el email">
        </div>

        <div class="form-group form-group-full">
            <label>Dirección</label>
            <textarea id="empDir" placeholder="Ingrese la dirección"></textarea>
        </div>

        <div class="form-group form-group-full">
            <label>Mensaje pie de factura</label>
            <textarea id="empPie" placeholder="Mensaje para el pie de factura"></textarea>
        </div>

    </div>

    <button class="btn-save" onclick="guardarEmpresa()">Guardar Cambios</button>
</div>
`;



}

async function guardarEmpresa() {
    const data = {
        nombre: document.getElementById("empNombre").value,
        razon_social: document.getElementById("empRazon").value,
        rnc: document.getElementById("empRnc").value,
        telefono: document.getElementById("empTel").value,
        email: document.getElementById("empEmail").value,
        direccion: document.getElementByById("empDir").value,
        pie_factura: document.getElementById("empPie").value
    };

    const res = await fetch("/api/config/empresa/", {
        method: "PUT",
        headers: {
            "Authorization": `Token ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("✅ Datos de empresa actualizados");
    } else {
        alert("❌ Error guardando datos");
    }
}
