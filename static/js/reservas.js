/* ===============================
   ELEMENTOS
================================ */
const reservaFecha = document.getElementById("fecha");
const reservaHoraInicio = document.getElementById("hora_inicio");
const reservaHoraFin = document.getElementById("hora_fin");
const duracionSelect = document.getElementById("duracion");


const mesas = document.getElementById("mesas");
const sillas = document.getElementById("sillas");
const disponibilidadInfo = document.getElementById("disponibilidad");

const reservaNombre = document.getElementById("nombrereserva");
const reservaTelefono = document.getElementById("telefonoreserva");
const reservaForm = document.getElementById("reservaForm");

let horaFin24 = null; // 👈 valor real para backend

/* ===============================
   MODAL
================================ */
function abrirReservaModal() {
    document.getElementById("reservaModal").classList.add("active");
      cargarHoras12h(); 
    precargarDatosReserva();
  bloquearFechasPasadas();
    bloquearHorasPasadas();

}

function cerrarReservaModal() {
    document.getElementById("reservaModal").classList.remove("active");
}

/* ===============================
   PRECARGAR USUARIO
================================ */
function precargarDatosReserva() {
 //   const user = JSON.parse(localStorage.getItem("user"));

const user = JSON.parse(sessionStorage.getItem("user"));

console.log("el ususario", user)
    if (user) {
        reservaNombre.value = user.nombre ?? "";
        reservaTelefono.value = user.telefono ?? "";
        reservaNombre.readOnly = true;
        reservaTelefono.readOnly = true;
    } else {
        reservaNombre.readOnly = false;
        reservaTelefono.readOnly = false;
        // ❌ NO limpiar aquí
    }
}



/* ===============================
   CALCULAR HORA FIN
================================ */
function calcularHoraFin() {
    const inicio = reservaHoraInicio.value;
    const duracion = parseInt(duracionSelect.value, 10);
    const fecha = reservaFecha.value; // yyyy-mm-dd

    if (!inicio || !duracion || !fecha) return;

    const [h, m] = inicio.split(":").map(Number);
    
    // Crear fecha exacta de inicio
    const inicioDate = new Date(fecha + "T" + inicio + ":00");

    // Sumar duración en horas
    const finDate = new Date(inicioDate.getTime() + duracion * 60 * 60 * 1000);

    // Hora final 24h (para backend)
    horaFin24 = finDate.toTimeString().slice(0,5);

    // Hora final 12h (visual)
    reservaHoraFin.value = formato12h(horaFin24);

    consultarDisponibilidad();
}



/* ===============================
   CONSULTAR DISPONIBILIDAD
================================ */
async function consultarDisponibilidad() {
    const fecha = reservaFecha.value;
    const hora_inicio = reservaHoraInicio.value;
    const hora_fin = reservaHoraFin.value;

    if (!fecha || !hora_inicio || !hora_fin) return;

    try {
        const res = await fetch("/api/disponibilidad/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fecha, hora_inicio, hora_fin })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Error consultando disponibilidad");
            return;
        }

        disponibilidadInfo.textContent =
            `Disponibles → Mesas: ${data.mesas_disponibles}, Sillas: ${data.sillas_disponibles}`;
 `🕒 ${formato12h(hora_inicio)} - ${formato12h(hora_fin)}
Mesas: ${data.mesas_disponibles} | Sillas: ${data.sillas_disponibles}`;

    } catch (err) {
        console.error("Error disponibilidad:", err);
        alert("Error de conexión");
    }
}

/* ===============================
   CREAR RESERVA
================================ */
if (reservaForm) {
    reservaForm.addEventListener("submit", async e => {
        e.preventDefault();

        console.log("NOMBRE:", JSON.stringify(reservaNombre.value));
console.log("TEL:", JSON.stringify(reservaTelefono.value));

if (!reservaNombre.value.trim() || !reservaTelefono.value.trim()) {
    alert("⚠️ Debes ingresar nombre y teléfono");
    return;
}



        const payload = {
            fecha: reservaFecha.value,
            hora_inicio: reservaHoraInicio.value,
            hora_fin: horaFin24,
            mesas: parseInt(mesas.value, 10),
            sillas: parseInt(sillas.value, 10),
            nombre: reservaNombre.value,
            telefono: reservaTelefono.value
        };

        try {
          //  const token = localStorage.getItem("token");
            const token = sessionStorage.getItem("token");
            console.log("el payload", payload)

            const res = await fetch("/api/crear-reserva/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { Authorization: "Token " + token })
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                alert(
                    typeof data === "string"
                        ? data
                        : Object.values(data).join("\n")
                );
                return;
            }

            alert("✅ Reserva enviada correctamente");
            reservaForm.reset();
            cerrarReservaModal();

        } catch (err) {
            console.error("Error reserva:", err);
            alert("Error creando la reserva");
        }
    });
}


function cargarHoras12h() {
    const select = document.getElementById("hora_inicio");
    select.innerHTML = "";

    for (let h = 0; h < 24; h++) {
        for (let m of [0, 30]) {
            const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

            const hour12 = h % 12 || 12;
            const ampm = h >= 12 ? "PM" : "AM";
            const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;

            const option = document.createElement("option");
            option.value = value;       // ⬅ backend recibe 24h
            option.textContent = label; // 👀 usuario ve AM/PM

            select.appendChild(option);
        }
    }
}


/* ===============================
   EVENTOS
================================ */
if (reservaHoraInicio) {
    reservaHoraInicio.addEventListener("change", calcularHoraFin);
}
if (duracionSelect) {
    duracionSelect.addEventListener("change", calcularHoraFin);
}
if (reservaFecha) {
    reservaFecha.addEventListener("change", consultarDisponibilidad);
}

function bloquearFechasPasadas() {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");

    reservaFecha.min = `${yyyy}-${mm}-${dd}`;
}
function bloquearHorasPasadas() {
    if (!reservaFecha.value) return;

    const ahora = new Date();
    const hoy = ahora.toISOString().slice(0, 10);
    const fechaSeleccionada = reservaFecha.value;

    if (fechaSeleccionada !== hoy) {
        // Si no es hoy, se permite cualquier hora
        reservaHoraInicio.min = "";
        return;
    }

    // Es hoy → bloquear horas pasadas
    const hh = String(ahora.getHours()).padStart(2, "0");
    const mm = String(ahora.getMinutes()).padStart(2, "0");

    reservaHoraInicio.min = `${hh}:${mm}`;
}


function esPM(hora) {
    const h = parseInt(hora.split(":")[0], 10);
    return h >= 12;
}

function formato12h(hora) {
    let [h, m] = hora.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}
