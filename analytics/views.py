from django.shortcuts import render

# Create your views here.
# analytics/views.py

from django.utils.timezone import now
from django.db.models import Sum, Count, F
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from ordenes.models import Orden, OrdenItem
from reserva.models import Reserva


@api_view(["GET"])
@permission_classes([IsAdminUser])
def resumen_general(request):
    hoy = now().date()

    fecha_inicio = request.GET.get("from")
    fecha_fin = request.GET.get("to")

    ordenes = Orden.objects.all()
    reservas = Reserva.objects.all()

    if fecha_inicio and fecha_fin:
        ordenes = ordenes.filter(creado__date__range=[fecha_inicio, fecha_fin])
        reservas = reservas.filter(fecha__range=[fecha_inicio, fecha_fin])

    total_ordenes = ordenes.count()
    total_entregadas = ordenes.filter(estado="entregado")
    total_ventas = total_entregadas.aggregate(total=Sum("total"))["total"] or 0

    ticket_promedio = 0
    if total_entregadas.count() > 0:
        ticket_promedio = total_ventas / total_entregadas.count()

    total_reservas = reservas.count()

    return Response({
        "total_ordenes": total_ordenes,
        "total_ventas": total_ventas,
        "ticket_promedio": round(ticket_promedio, 2),
        "total_reservas": total_reservas
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def productos_mas_vendidos(request):

    productos = (
        OrdenItem.objects
        .values(nombre=F("producto__nombre"))
        .annotate(total_vendido=Sum("cantidad"))
        .order_by("-total_vendido")[:5]
    )

    return Response(productos)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def ventas_por_dia(request):

    ventas = (
        Orden.objects
        .filter(estado="entregado")
        .values("creado__date")
        .annotate(total=Sum("total"))
        .order_by("creado__date")
    )

    return Response(ventas)
