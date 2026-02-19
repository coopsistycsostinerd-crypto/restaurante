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
def api_crear_venta2(request):

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
        "venta_id": venta.id 
    })


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction
from decimal import Decimal

from ordenes.models import Orden, OrdenItem
from caja.models import Venta, Pago
from productos.models import Producto


class CrearVentaPOSAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        productos = request.data.get("productos", [])
        metodo_pago = request.data.get("metodo_pago")
        cliente_nombre = request.data.get("cliente_nombre", "")
        cliente_telefono = request.data.get("cliente_telefono", "")

        if not productos:
            return Response({"error": "No hay productos"}, status=400)

        if not metodo_pago:
            return Response({"error": "Método de pago requerido"}, status=400)

        total = Decimal("0.00")

        # 1️⃣ Calcular total primero
        productos_db = []

        for item in productos:
            producto = Producto.objects.get(id=item["id"])
            cantidad = int(item["cantidad"])

            subtotal = producto.precio * cantidad
            total += subtotal

            productos_db.append({
                "producto": producto,
                "cantidad": cantidad,
                "precio": producto.precio
            })

        # 2️⃣ Crear Orden con total
        orden = Orden.objects.create(
            usuario=request.user,
            total=total,
            estado="entregado",
            cliente_nombre=cliente_nombre,
            cliente_telefono=cliente_telefono,
            tipo_pedido="retirar"
        )

        # 3️⃣ Crear OrdenItems
        for item in productos_db:
            OrdenItem.objects.create(
                orden=orden,
                producto=item["producto"],
                cantidad=item["cantidad"],
                precio=item["precio"]
            )

            # Opcional: descontar inventario
   #         item["producto"].stock -= item["cantidad"]
    #        item["producto"].save()

        # 4️⃣ Crear Venta
        venta = Venta.objects.create(
            orden=orden,
            cajero=request.user,
            subtotal=total,
            impuestos=Decimal("0.00"),
            total=total,
            completada=True
        )
        print("la venta", venta)
        # 5️⃣ Crear Pago
        Pago.objects.create(
            venta=venta,
            metodo=metodo_pago,
            monto=total
        )

        return Response({
            "success": True,
            "venta_id": venta.id,
              "orden_id": orden.id, 
            
        }, status=201)



