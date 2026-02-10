async function cargarEmpresaAdmin() {
    const token = localStorage.getItem("token");
    const body = document.getElementById("adminBody");

    body.innerHTML = "Cargando datos de la empresa...";

    const res = await fetch("/config/empresa/", {
        headers: { "Authorization": `Token ${token}` }
    });

    if (!res.ok) {
        body.innerHTML = "Error cargando datos";
        return;
    }

    const e = await res.json();

    body.innerHTML = `
    <div class="form-wrapper">
        <h2 class="form-title">🏢 Configuración de la Empresa</h2>

        <div class="form-grid">

            <div class="form-group">
                <label>Nombre Comercial</label>
                <input id="empNombre" type="text">
            </div>

            <div class="form-group">
                <label>Razón Social</label>
                <input id="empRazon" type="text">
            </div>

            <div class="form-group">
                <label>RNC</label>
                <input id="empRnc" type="text">
            </div>

            <div class="form-group">
                <label>Teléfono</label>
                <input id="empTel" type="text">
            </div>

            <div class="form-group">
                <label>Email</label>
                <input id="empEmail" type="email">
            </div>

            <div class="form-group">
                <label>WhatsApp</label>
                <input id="empWhatsapp" type="text">
            </div>

            <div class="form-group form-group-full">
                <label>Dirección</label>
                <textarea id="empDir"></textarea>
            </div>

            <div class="form-group">
                <label>Horario</label>
                <input id="empHorario" type="text">
            </div>

            <div class="form-group">
                <label>Slogan</label>
                <input id="empSlogan" type="text">
            </div>

            <div class="form-group">
                <label>Instagram</label>
                <input id="empInstagram" type="url">
            </div>

            <div class="form-group">
                <label>Facebook</label>
                <input id="empFacebook" type="url">
            </div>

            <div class="form-group form-group-full">
                <label>Mensaje pie de factura</label>
                <textarea id="empPie"></textarea>
            </div>

            <div class="form-group form-group-full">
                <label>Logo</label>
                <img id="logoPreview" style="max-height:80px; margin-bottom:10px;">
                <input id="empLogo" type="file" accept="image/*">
            </div>

        </div>

        <button class="btn-save" onclick="guardarEmpresa()">Guardar Cambios</button>
    </div>
    `;

    // 🔥 Rellenar campos (EXPLÍCITO, SIN CAMBIOS RAROS)
    document.getElementById("empNombre").value = e.nombre || "";
    document.getElementById("empRazon").value = e.razon_social || "";
    document.getElementById("empRnc").value = e.rnc || "";
    document.getElementById("empTel").value = e.telefono || "";
    document.getElementById("empEmail").value = e.email || "";
    document.getElementById("empWhatsapp").value = e.whatsapp || "";
    document.getElementById("empDir").value = e.direccion || "";
    document.getElementById("empHorario").value = e.horario || "";
    document.getElementById("empSlogan").value = e.slogan || "";
    document.getElementById("empInstagram").value = e.instagram || "";
    document.getElementById("empFacebook").value = e.facebook || "";
    document.getElementById("empPie").value = e.pie_factura || "";

    if (e.logo) {
        document.getElementById("logoPreview").src = e.logo;
    }
}

async function guardarEmpresa() {
    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("nombre", empNombre.value);
    formData.append("razon_social", empRazon.value);
    formData.append("rnc", empRnc.value);
    formData.append("telefono", empTel.value);
    formData.append("email", empEmail.value);
    formData.append("whatsapp", empWhatsapp.value);
    formData.append("direccion", empDir.value);
    formData.append("horario", empHorario.value);
    formData.append("slogan", empSlogan.value);
    formData.append("instagram", empInstagram.value);
    formData.append("facebook", empFacebook.value);
    formData.append("pie_factura", empPie.value);

    if (empLogo.files.length > 0) {
        formData.append("logo", empLogo.files[0]);
    }

    const res = await fetch("/config/empresa/", {
        method: "PUT",
        headers: {
            "Authorization": `Token ${token}`
        },
        body: formData
    });

    if (res.ok) {
        alert("✅ Empresa actualizada");
        cargarEmpresaAdmin();
    } else {
        alert("❌ Error guardando");
    }
}


