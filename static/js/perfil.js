/* ===============================
   PERFIL - FUNCIONES COMPLETAS
================================ */

function abrirPerfil() {
  document.getElementById("perfilModal").classList.add("active");
  cargarPerfil();
}

function cerrarPerfil() {
  document.getElementById("perfilModal").classList.remove("active");
}

/* ---------- CARGAR PERFIL ---------- */
async function cargarPerfil() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/perfil/", {
    headers: { Authorization: "Token " + token }
  });

  const u = await res.json();

  perfil_username.value = u.username || "";
  perfil_email.value = u.email || "";
  perfil_nombre.value = u.nombre || "";
  perfil_apellido.value = u.apellido || "";
  perfil_telefono.value = u.telefono || "";
  perfil_direccion.value = u.direccion || "";
  perfil_rol.value = u.rol || "";

  if (u.imagen) perfilImagenPreview.src = u.imagen;
}

/* ---------- GUARDAR PERFIL ---------- */
perfilForm.addEventListener("submit", async e => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("nombre", perfil_nombre.value);
  formData.append("apellido", perfil_apellido.value);
  formData.append("telefono", perfil_telefono.value);
  formData.append("direccion", perfil_direccion.value);

  if (perfilImagen.files.length > 0) {
    formData.append("imagen", perfilImagen.files[0]);
  }

  const res = await fetch("/api/perfil/", {
    method: "PUT",
    headers: { Authorization: "Token " + token },
    body: formData
  });

  if (res.ok) {
    alert("✅ Perfil actualizado");
    cerrarPerfil();
  } else {
    alert("❌ Error actualizando perfil");
  }
});

/* ---------- PREVIEW IMAGEN ---------- */
perfilImagen.addEventListener("change", () => {
  if (perfilImagen.files.length > 0) {
    perfilImagenPreview.src = URL.createObjectURL(perfilImagen.files[0]);
  }
});

/* ===============================
   CONTRASEÑA
================================ */

function abrirPasswordModal() {
  const modal = document.getElementById("passwordModal");
  const form = document.getElementById("passwordForm");

  if (form) form.reset();
  modal.classList.add("active");
}



function cerrarPasswordModal() {
  const modal = document.getElementById("passwordModal");
  const form = document.getElementById("passwordForm");

  // Cerrar modal
  modal.classList.remove("active");

  // Limpiar campos
  if (form) {
    form.reset();
  }
}


passwordForm.addEventListener("submit", async e => {
  e.preventDefault();

  if (pass_nueva.value !== pass_confirmar.value) {
    alert("Las contraseñas no coinciden");
    return;
  }

  const token = localStorage.getItem("token");

  const res = await fetch("/api/cambiar-password/", {
    method: "POST",
    headers: {
      Authorization: "Token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      actual: pass_actual.value,
      nueva: pass_nueva.value
    })
  });

  if (res.ok) {
    alert("🔐 Contraseña actualizada");
    cerrarPasswordModal();
    passwordForm.reset();
  } else {
    alert("❌ Error cambiando contraseña");
  }
});
