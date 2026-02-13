from django.shortcuts import render

from ordenes.models import Orden
from productos.models import Producto
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from productos.models import Producto
# Create your views here.
@login_required
def pos_view(request):
    productos = Producto.objects.filter(activo=True)
    return render(request, "pos.html", {
        "productos": productos
    })



@login_required
def api_productos_pos(request):
    productos = Producto.objects.filter(activo=True)

    data = [
        {
            "id": p.id,
            "nombre": p.nombre,
            "precio": float(p.precio),
            "imagen": p.imagen.url if p.imagen else ""
        }
        for p in productos
    ]

    return JsonResponse(data, safe=False)


import json
from django.http import JsonResponse
from django.db import transaction
from django.contrib.auth.decorators import login_required
from ordenes.models import Orden, OrdenItem
from productos.models import Producto
from caja.models import Venta

@login_required
@transaction.atomic
def api_crear_venta(request):

    data = json.loads(request.body)

    # 1️⃣ Crear Orden
    orden = Orden.objects.create(
        usuario=request.user,
        total=0,
        tipo_pedido="retirar",
        estado="pendiente"
    )

    total = 0

    # 2️⃣ Crear Items
    for item in data["productos"]:
        producto = Producto.objects.get(id=item["id"])

        OrdenItem.objects.create(
            orden=orden,
            producto=producto,
            cantidad=item["cantidad"],
            precio=producto.precio
        )

        total += producto.precio * item["cantidad"]

    # 3️⃣ Actualizar total de la orden
    orden.total = total
    orden.save()

    # 4️⃣ Crear Venta
    venta = Venta.objects.create(
        orden=orden,
        cajero=request.user,
        subtotal=total,
        total=total,
        completada=True
    )

    return JsonResponse({
        "success": True,
        "venta_id": venta.orden.id
    })

from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.template.loader import render_to_string
from caja.models import Venta

def ticket_venta(request, venta_id):
    venta = get_object_or_404(Venta, orden=venta_id)

    html = render_to_string("ticket.html", {
        "venta": venta
    })

    return HttpResponse(html)
