// ===============================
// VARIABLES GLOBALES
// ===============================

let itemActual = {
    id: null,
    tipo: null
};

let ventaGeneradaId = null;


// ===============================
// CONTROL DE BOTONES
// ===============================

actualizarEstadoBotones("deshabilitar");

function actualizarEstadoBotones(accion) {
    const btnCobrar = document.getElementById("btnCobrar");
    const btnTicket = document.getElementById("btnTicket");

    if (!btnCobrar || !btnTicket) return;

    if (accion === "deshabilitar") {
        btnCobrar.disabled = true;
        btnTicket.disabled = true;
    }

    if (accion === "habilitarCobrar") {
        btnCobrar.disabled = false;
        btnTicket.disabled = true;
    }

    if (accion === "habilitarTicket") {
        btnCobrar.disabled = true;
        btnTicket.disabled = false;
    }
}


// ===============================
// CARGAR ITEMS EN CAJA
// ===============================

async function cargarCaja() {
   // const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");
    const body = document.getElementById("adminBody");

    body.innerHTML = "Cargando items listos para cobrar...";
  Swal.fire({
        title: "Cargando items...",
        time: 2000,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });
    const res = await fetch("/api/caja/ordenes-listas/", {
        headers: { "Authorization": `Token ${token}` }
    });

    const items = await res.json();
    Swal.close();

    body.innerHTML = `
        <div class="caja-layout">

            <div class="caja-pedidos">
                <h3> <i class="fas fa-list"></i> Items para Cobro</h3>
                <div id="listaOrdenesCaja">
                    ${items.map(o => `
                        <div class="orden-item"
                             onclick="seleccionarItem(${o.id}, '${o.tipo}', ${o.total})">

                            <strong>
                                ${o.tipo === "orden" ? "Pedido" : "Reserva"} #${o.id}
                            </strong>

                            <span>$${o.total}</span>
                        </div>
                    `).join("")}
                </div>
            </div>

            <div class="caja-cobro">
                <h3> <i class="fas fa-money-bill"></i> Cobrar</h3>

                <p><strong> <i class="fas fa-list"></i> Item:</strong> <span id="cajaPedidoId">—</span></p>
                <p><strong> <i class="fas fa-money-bill"></i> Total:</strong> $<span id="cajaTotal">0.00</span></p>

                <label> <i class="fas fa-wallet"></i> Método de Pago</label>
                <select id="metodoPago">
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                </select>

                <div id="campoReferencia" style="display:none;">
                    <label>Referencia</label>
                    <input type="text" id="referenciaPago" placeholder="No. transacción">
                </div>

                <button class="btn-cobrar"
                        id="btnCobrar"
                        disabled
                        onclick="procesarCobro()">
                        <i class="fas fa-money-bill"></i> Cobrar
                </button>

                <button class="btn-ticket"
                        id="btnTicket"
                        disabled
                        onclick="imprimirTicket()">
                        <i class="fas fa-ticket-alt"></i> Imprimir Ticket
                </button>
            </div>

        </div>
    `;

    document.getElementById("metodoPago").addEventListener("change", e => {
        document.getElementById("campoReferencia").style.display =
            e.target.value === "efectivo" ? "none" : "block";
    });

    actualizarEstadoBotones("deshabilitar");
}


// ===============================
// SELECCIONAR ITEM
// ===============================

function seleccionarItem(id, tipo, total) {

    document.getElementById("cajaPedidoId").textContent =
        tipo === "orden" ? `Pedido #${id}` : `Reserva #${id}`;

    document.getElementById("cajaTotal").textContent = total;

    itemActual.id = id;
    itemActual.tipo = tipo;

    ventaGeneradaId = null;

    actualizarEstadoBotones("habilitarCobrar");
}


// ===============================
// CREAR VENTA
// ===============================

async function crearVenta() {

  //  const token = localStorage.getItem("token");

    const token = sessionStorage.getItem("token");

    const res = await fetch(`/api/caja/crear-venta/`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tipo: itemActual.tipo,
            id: itemActual.id
        })
    });

    const data = await res.json();

    if (!res.ok) {
         Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error || "Error creando la venta"
        });

        return null;
    }

    ventaGeneradaId = data.id;
    return data.id;
}


// ===============================
// PROCESAR PAGO
// ===============================

async function procesarPago(ventaId, metodo, monto, referencia) {

  //  const token = localStorage.getItem("token");

    const token = sessionStorage.getItem("token");
   Swal.fire({
        title: "Procesando pago...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const res = await fetch(`/api/caja/agregar-pago/${ventaId}/`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            metodo: metodo,
            monto: monto,
            referencia: referencia
        })
    });

    const data = await res.json();

    Swal.close();
    if (!res.ok) {
         Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error || "Error al procesar el pago"
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "Pago realizado",
        text: "El pago fue procesado correctamente",
        timer: 2000,
        showConfirmButton: false
    });

    actualizarEstadoBotones("habilitarTicket");

    // Refrescar lista después de cobrar
  
}


// ===============================
// PROCESAR COBRO
// ===============================
async function procesarCobro() {

    if (!itemActual.id) {
        Swal.fire({
            icon: "warning",
            title: "Selecciona un item",
            text: "Debes seleccionar un pedido o reserva primero"
        });
        return;
    }

    const confirmacion = await Swal.fire({
        title: "¿Confirmar cobro?",
        text: "Se registrará el pago del pedido",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Cobrar",
        cancelButtonText: "Cancelar"
    });

    if (!confirmacion.isConfirmed) {
        return;
    }

    const metodo = document.getElementById("metodoPago").value;
    const referencia = document.getElementById("referenciaPago").value;
    const total = parseFloat(document.getElementById("cajaTotal").textContent);

    const ventaId = await crearVenta();

    if (ventaId) {
        await procesarPago(ventaId, metodo, total, referencia);
    }
}

// ===============================
// IMPRIMIR TICKET
// ===============================

function imprimirTicket() {

    if (!ventaGeneradaId) {
     Swal.fire({
            icon: "warning",
            title: "Ticket no disponible",
            text: "Primero debes procesar el pago"
        });

        return;
    }

    window.open(`/api/caja/ticket/${ventaGeneradaId}/`, "_blank");
  Swal.fire({
        icon: "success",
        title: "Ticket generado",
        timer: 1500,
        showConfirmButton: false
    });
    // Ahora sí refrescamos
    setTimeout(() => {
        cargarCaja();
    }, 1000);
}
