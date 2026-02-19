const token = localStorage.getItem("token");

async function cargarResumen() {
    const res = await fetch("/api/analytics/resumen/", {
        headers: {
            "Authorization": `Token ${token}`
        }
    });

    const data = await res.json();

    document.getElementById("totalOrdenes").innerText = data.total_ordenes;
    document.getElementById("totalVentas").innerText = "$" + data.total_ventas;
    document.getElementById("ticketPromedio").innerText = "$" + data.ticket_promedio;
    document.getElementById("totalReservas").innerText = data.total_reservas;
}

async function cargarTopProductos() {
    const res = await fetch("/api/analytics/productos/", {
        headers: {
            "Authorization": `Token ${token}`
        }
    });

    const productos = await res.json();

    const lista = document.getElementById("topProductos");
    lista.innerHTML = "";

    productos.forEach(p => {
        lista.innerHTML += `
            <li>${p.nombre} - ${p.total_vendido}</li>
        `;
    });
}

async function cargarAnalytics() {

    const contenedor = document.getElementById("adminBody");

    contenedor.innerHTML = `
        <div class="analytics-container">
            <h1>Analytics</h1>

            <div class="cards">
                <div class="card">
                    <h3>Órdenes</h3>
                    <p id="totalOrdenes">Cargando...</p>
                </div>

                <div class="card">
                    <h3>Ventas</h3>
                    <p id="totalVentas">Cargando...</p>
                </div>

                <div class="card">
                    <h3>Ticket Promedio</h3>
                    <p id="ticketPromedio">Cargando...</p>
                </div>

                <div class="card">
                    <h3>Reservas</h3>
                    <p id="totalReservas">Cargando...</p>
                </div>
            </div>

            <div class="section">
                <h2>Top Productos</h2>
                <ul id="topProductos"></ul>
            </div>
        </div>
    `;

    await cargarResumen();
    await cargarTopProductos();
}
