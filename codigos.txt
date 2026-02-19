let ventaActual = null;

// Deshabilitar botones al cargar la página
actualizarEstadoBotones("deshabilitar");

// Función para actualizar el estado de los botones
function actualizarEstadoBotones(accion) {
    const btnCobrar = document.getElementById("btnCobrar");
    const btnTicket = document.getElementById("btnTicket");

    if (accion === "deshabilitar") {
        btnCobrar.disabled = true;
        btnTicket.disabled = true;
    } else if (accion === "habilitarCobrar") {
        btnCobrar.disabled = false;
        btnTicket.disabled = true;  // Aseguramos que "Imprimir Ticket" se mantiene deshabilitado
    } else if (accion === "habilitarTicket") {
        btnCobrar.disabled = true;  // Deshabilitar el botón de cobro después de procesar el pago
        btnTicket.disabled = false; // Habilitar el botón de ticket
    }
}

// 1. Cuando se selecciona una orden, creamos la venta
async function crearVenta(ordenId) {
    const token = localStorage.getItem("token");

    const res = await fetch(`/api/caja/crear-venta/${ordenId}/`, {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        }
    });

    const data = await res.json();

    if (res.ok) {
        console.log("Venta creada con éxito:", data);
        return data.id;  // `data.id` es el `venta_id` que recibimos
    } else {
        console.error("Error creando la venta:", data.error);
        return null;
    }
}

// 2. Usamos el `venta_id` para procesar el pago
async function procesarPago(ventaId, metodo, monto, referencia) {
    const token = localStorage.getItem("token");

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

    if (res.ok) {
        console.log("Pago procesado con éxito:", data);
        alert("Pago realizado con éxito");

        // Habilitar el botón de ticket y deshabilitar el de cobrar
        actualizarEstadoBotones("habilitarTicket");
    } else {
        console.error("Error procesando el pago:", data.error);
        alert("Error al procesar el pago");
    }
}

// 3. Cuando se selecciona una orden, cargamos los datos y habilitamos el botón de cobro
async function seleccionarOrden(ordenId, total) {
    try {
        // Hacemos un GET para obtener los detalles de la orden
        const res = await fetch(`/api/caja/orden/${ordenId}/`, {
            method: "GET",
            headers: {
                "Authorization": `Token ${localStorage.getItem("token")}`
            }
        });

        const data = await res.json();
        console.log("Respuesta de la API:", data);

        if (!res.ok) {
            alert(data.error || "Error obteniendo los detalles de la orden");
            return;
        }

        // Cargamos los datos de la orden en el panel de cobro
        document.getElementById("cajaPedidoId").textContent = data.id;
        document.getElementById("cajaTotal").textContent = data.total;

        // Inicializamos la variable `ventaActual` como null al principio
        ventaActual = data.id; // Aseguramos que no haya una venta en proceso aún

        // Habilitamos el botón de cobro
        actualizarEstadoBotones("habilitarCobrar");

    } catch (err) {
        console.error(err);
        alert("Error conectando con la caja");
    }
}

// 4. Función para cargar la lista de pedidos
async function cargarCaja() {
    const token = localStorage.getItem("token");

    const body = document.getElementById("adminBody");
    body.innerHTML = "Cargando pedidos listos para cobrar...";

    const res = await fetch("/api/caja/ordenes-listas/", {
        headers: { "Authorization": `Token ${token}` }
    });

    const ordenes = await res.json();

    body.innerHTML = `
        <div class="caja-layout">

            <!-- PEDIDOS LISTOS -->
            <div class="caja-pedidos">
                <h3>🧾 Pedidos Preparados</h3>
                <div id="listaOrdenesCaja">
                    ${ordenes.map(o => `
                        <div class="orden-item" onclick="seleccionarOrden(${o.id}, ${o.total})">
                            <strong>Pedido #${o.id}</strong>
                            <span>$${o.total}</span>
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- PANEL DE COBRO -->
            <div class="caja-cobro">
                <h3>💳 Cobrar Pedido</h3>

                <p><strong>Pedido:</strong> <span id="cajaPedidoId">—</span></p>
                <p><strong>Total:</strong> $<span id="cajaTotal">0.00</span></p>

                <label>Método de Pago</label>
                <select id="metodoPago">
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                </select>

                <div id="campoReferencia" style="display:none;">
                    <label>Referencia</label>
                    <input type="text" id="referenciaPago" placeholder="No. transacción">
                </div>

                <button class="btn-cobrar" id="btnCobrar" disabled onclick="procesarCobro()">💰 Cobrar</button>
                <button class="btn-ticket" id="btnTicket" disabled onclick="imprimirTicket()">🧾 Imprimir Ticket</button>
            </div>

        </div>
    `;

    document.getElementById("metodoPago").addEventListener("change", e => {
        document.getElementById("campoReferencia").style.display =
            e.target.value === "efectivo" ? "none" : "block";
    });

    // Inicialmente deshabilitar los botones
    actualizarEstadoBotones("deshabilitar");
}

// 5. Imprimir el ticket de la venta
function imprimirTicket() {
    if (!ventaActual) return;
    window.open(`/api/caja/ticket/${ventaActual}/`, "_blank");
}

// 6. Procesar el pago
async function procesarCobro() {
    if (!ventaActual) {
        alert("Selecciona una orden primero");
        return;
    }

    const metodo = document.getElementById("metodoPago").value;
    const referencia = document.getElementById("referenciaPago").value;
    const total = parseFloat(document.getElementById("cajaTotal").textContent);

    // Usamos la función `crearVenta` si no se ha creado la venta aún
    const ventaId = await crearVenta(ventaActual);  // Crea la venta

    if (ventaId) {
        await procesarPago(ventaId, metodo, total, referencia);  // Procesamos el pago con el `venta_id`
    }
}
