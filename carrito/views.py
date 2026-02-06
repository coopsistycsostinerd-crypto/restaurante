from django.shortcuts import render

# Create your views here.
# carrito/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Carrito, ItemCarrito
from .serializers import CarritoSerializer
from productos.models import Producto

class CarritoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
        return Response(CarritoSerializer(carrito).data)

class AgregarItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        producto_id = request.data.get("producto_id")
        cantidad = int(request.data.get("cantidad", 1))

        carrito, _ = Carrito.objects.get_or_create(usuario=request.user)
        item, created = ItemCarrito.objects.get_or_create(carrito=carrito, producto_id=producto_id)

        if not created:
            item.cantidad += cantidad
        else:
            item.cantidad = cantidad

        item.save()
        return Response({"ok": True})

class EliminarItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        item_id = request.data.get("item_id")
        ItemCarrito.objects.filter(id=item_id, carrito__usuario=request.user).delete()
        return Response({"ok": True})


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from productos.models import Producto

class SincronizarCarritoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        items = request.data.get("items", [])

        for item in items:
            producto_id = item.get("id")
            cantidad = item.get("cantidad", 1)

            try:
                producto = Producto.objects.get(id=producto_id)
                carrito_item, created = ItemCarrito.objects.get_or_create(
                    usuario=request.user,
                    producto=producto
                )
                carrito_item.cantidad += cantidad
                carrito_item.save()
            except Producto.DoesNotExist:
                continue

        return Response({"detail": "Carrito sincronizado"})

