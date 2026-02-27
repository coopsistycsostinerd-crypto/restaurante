from django.shortcuts import render
from datetime import datetime
from django.utils.dateparse import parse_date
from django.db.models import Sum, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from ordenes.models import Orden
from caja.models import Venta
from reserva.models import Reserva
from users.models import Usuariohtp


@api_view(["GET"])
@permission_classes([IsAdminUser])
def reporte_general(request):

    tipo = request.GET.get("tipo")
    fecha_inicio = request.GET.get("from")
    fecha_fin = request.GET.get("to")

    fecha_inicio = parse_date(fecha_inicio) if fecha_inicio else None
    fecha_fin = parse_date(fecha_fin) if fecha_fin else None

    data = []
    columnas = []

    # =========================
    # ORDENES
    # =========================
    if tipo == "ordenes":

        queryset = Orden.objects.select_related("usuario").order_by("-creado")

        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(creado__date__range=[fecha_inicio, fecha_fin])

        columnas = ["ID", "Usuario", "Fecha", "Estado", "Total"]

        for obj in queryset:
            data.append([
                obj.id,
                obj.usuario.nombre if obj.usuario else "Consumidor Final",
                obj.creado.date(),
                obj.estado,
                float(obj.total)
            ])

    # =========================
    # VENTAS
    # =========================
    elif tipo == "ventas":

        queryset = Venta.objects.select_related(
            "orden",
            "reserva",
            "comprobante"
        ).prefetch_related("pagos").order_by("-fecha")

        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(fecha__date__range=[fecha_inicio, fecha_fin])

        columnas = ["ID Venta", "Fecha", "Comprobante", "Origen", "Método Pago", "Total"]

        for obj in queryset:

            # ORIGEN
            origen = "Venta directa"
            if obj.orden:
                origen = f"Orden #{obj.orden.id}"
            elif obj.reserva:
                origen = f"Reserva #{obj.reserva.id}"

            # COMPROBANTE
            comprobante = "-"
            if hasattr(obj, "comprobante"):
                comprobante = obj.comprobante.numero

            # MÉTODOS DE PAGO (pueden ser varios)
            metodos = ", ".join([p.metodo for p in obj.pagos.all()]) if obj.pagos.exists() else "-"

            data.append([
                obj.id,
                obj.fecha.date(),
                comprobante,
                origen,
                metodos,
                float(obj.total)
            ])
    # =========================
    # RESERVAS
    # =========================
    elif tipo == "reservas":

        queryset = Reserva.objects.select_related("user").order_by("-fecha")

        if fecha_inicio and fecha_fin:
            queryset = queryset.filter(fecha__range=[fecha_inicio, fecha_fin])

        columnas = ["ID", "Cliente", "Fecha", "Hora", "Personas", "Estado"]

        for obj in queryset:

            # Nombre del cliente
            if obj.user:
                cliente = obj.user.nombre  # si tu modelo Usuariohtp tiene campo nombre
            else:
                cliente = obj.nombre  # nombre manual que se guarda en la reserva

            data.append([
                obj.id,
                cliente,
                obj.fecha,
                f"{obj.hora_inicio} - {obj.hora_fin}",
                obj.sillas,
                obj.estado
            ])
    # =========================
    # CLIENTES
    # =========================
    elif tipo == "clientes":

        queryset = Usuariohtp.objects.all()

        columnas = ["Nombre", "Email", "Teléfono"]

        for obj in queryset:
            data.append([
                obj.nombre,
                obj.email,
                obj.telefono
            ])

    else:
        return Response({"error": "Tipo de reporte inválido"}, status=400)

    return Response({
        "columnas": columnas,
        "data": data,
        "total_registros": len(data)
    })