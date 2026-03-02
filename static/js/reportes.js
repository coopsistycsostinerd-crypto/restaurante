
let tipoActual = "ordenes";
function cargarReportes2() {
    console.log("se llamo cargar reporte")

    const contenedor = document.getElementById("adminBody");

    contenedor.innerHTML = `
        <div class="reporte-container">

            <div class="reporte-title">Módulo de Reportes</div>

            <div class="reporte-botones">
                <button onclick="cambiarTipo('ordenes')">Órdenes</button>
                <button onclick="cambiarTipo('ventas')">Ventas</button>
                <button onclick="cambiarTipo('reservas')">Reservas</button>
                <button onclick="cambiarTipo('clientes')">Clientes</button>
            </div>

            <div class="reporte-filtros">
                <label>Desde:</label>
                <input type="date" id="fechaDesde">

                <label>Hasta:</label>
                <input type="date" id="fechaHasta">

                <button onclick="cargarDatosReporte()">Filtrar</button>
            </div>

            <div class="reporte-exportar">
                <button onclick="imprimirReporte()">🖨 </button>
                <button onclick="exportarExcel()">📊 </button>
                <button onclick="exportarPDF()">📄 </button>
            </div>

            <div id="resumenReporte"></div>

            <div class="tabla-container">
                <table class="reporte-tabla">
                    <thead id="tablaHead"></thead>
                    <tbody id="tablaBody"></tbody>
                </table>
            </div>

        </div>
    `;

    cargarDatosReporte();
}

// CARGAR MODULO PRINCIPAL

// =============================
// CAMBIAR TIPO
// =============================
function cambiarTipo(tipo) {
    tipoActual = tipo;
    cargarDatosReporte();
}

// =============================
// CARGAR DATOS DESDE API
// =============================
async function cargarDatosReporte() {
// const token = localStorage.getItem("token");
    const token = sessionStorage.getItem("token");
    const desde = document.getElementById("fechaDesde")?.value;
    const hasta = document.getElementById("fechaHasta")?.value;

    let url = `/api/reportes/?tipo=${tipoActual}`;

    if (desde && hasta) {
        url += `&from=${desde}&to=${hasta}`;
    }

    const res = await fetch(url, {
        headers: {
            "Authorization": `Token ${token}`
        }
    });

    const data = await res.json();

    renderTabla(data.columnas, data.data);
    renderResumen(data.total_registros);
}

// =============================
// RENDER TABLA DINAMICA
// =============================
function renderTabla(columnas, filas) {

    const head = document.getElementById("tablaHead");
    const body = document.getElementById("tablaBody");

    head.innerHTML = "";
    body.innerHTML = "";

    // Crear encabezados
    head.innerHTML = `
        <tr>
            ${columnas.map(col => `<th>${col}</th>`).join("")}
        </tr>
    `;

    // Crear filas
    filas.forEach(fila => {
        body.innerHTML += `
            <tr>
                ${fila.map(valor => `<td>${valor}</td>`).join("")}
            </tr>
        `;
    });
}

// =============================
// RESUMEN
// =============================
function renderResumen(total) {
    document.getElementById("resumenReporte").innerHTML = `
        <p><strong>Total registros:</strong> ${total}</p>
    `;
}

// =============================
// IMPRIMIR
// =============================
function imprimirReporte() {

    const contenido = document.querySelector(".tabla-container").innerHTML;

    const ventana = window.open("", "", "width=900,height=700");

    ventana.document.write(`
        <html>
            <head>
                <title>Reporte</title>
                <style>
                    table { width:100%; border-collapse: collapse; }
                    th, td { border:1px solid #000; padding:8px; text-align:left; }
                </style>
            </head>
            <body>
                ${contenido}
            </body>
        </html>
    `);

    ventana.document.close();
    ventana.print();
}

// =============================
// EXPORTAR EXCEL
// =============================
function exportarExcel() {

    const tabla = document.querySelector("table");
    let contenido = tabla.outerHTML.replace(/ /g, '%20');

    const link = document.createElement("a");
    link.href = 'data:application/vnd.ms-excel,' + contenido;
    link.download = `reporte_${tipoActual}.xls`;

    link.click();
}

// =============================
// EXPORTAR PDF (basico frontend)
// =============================
function exportarPDF() {

    const contenido = document.querySelector(".tabla-container").innerHTML;

    const ventana = window.open("", "", "width=900,height=700");

    ventana.document.write(`
        <html>
            <head>
                <title>Reporte PDF</title>
                <style>
                    table { width:100%; border-collapse: collapse; }
                    th, td { border:1px solid #000; padding:8px; text-align:left; }
                </style>
            </head>
            <body>
                ${contenido}
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                <\/script>
            </body>
        </html>
    `);

    ventana.document.close();
}
