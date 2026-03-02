from django.db.models import Sum

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import CapacidadLocal, Reserva
from .serializers import ReservaSerializer

from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Reserva, CapacidadLocal
from emails.services import (
    notificar_nueva_reserva,
    notificar_cambio_estado_reserva
)


@api_view(["POST"])
@permission_classes([AllowAny])  # logueado o no
def disponibilidad(request):
    fecha = request.data.get("fecha")
    hora_inicio = request.data.get("hora_inicio")
    duracion = int(request.data.get("duracion", 1))

    if not fecha or not hora_inicio:
        return Response(
            {"error": "Fecha y hora son obligatorias"},
            status=status.HTTP_400_BAD_REQUEST
        )

    capacidad = CapacidadLocal.objects.first()
    if not capacidad:
        return Response(
            {"error": "Capacidad no configurada"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ⏰ calcular rango solicitado
    inicio = datetime.strptime(f"{fecha} {hora_inicio}", "%Y-%m-%d %H:%M")
    fin = inicio + timedelta(hours=duracion)

    # 🔥 buscar reservas que SE CRUCEN
    reservas = Reserva.objects.filter(
        fecha=fecha,
        estado__in=["pendiente", "confirmada"]
    )

    mesas_ocupadas = 0
    sillas_ocupadas = 0

    for r in reservas:
        r_inicio = datetime.combine(r.fecha, r.hora_inicio)
        r_fin = r_inicio + timedelta(hours=1)  # duración fija actual

        # 🔥 overlap
        if r_inicio < fin and inicio < r_fin:
            mesas_ocupadas += r.mesas
            sillas_ocupadas += r.sillas

    return Response({
        "mesas_disponibles": max(0, capacidad.mesas_totales - mesas_ocupadas),
        "sillas_disponibles": max(0, capacidad.sillas_totales - sillas_ocupadas),
        "hora_fin": fin.time()
    })





DEPOSITO_FIJO = 1000

@api_view(["POST"])
@permission_classes([AllowAny])
def crear_reserva(request):

    serializer = ReservaSerializer(
        data=request.data,
        context={"request": request}
    )

    if serializer.is_valid():

        # 🔥 Guardamos la reserva primero
        reserva = serializer.save()

        # Asignamos depósito fijo
        reserva.monto_deposito = DEPOSITO_FIJO
        reserva.estado = "pendiente"
        reserva.save()
        notificar_nueva_reserva(reserva)

        # 🔥 Creamos Orden asociada
   

        return Response(
            {
                "id": reserva.id,
                "mensaje": "Reserva creada y enviada a caja",
                "estado": reserva.estado,
         
            },
            status=status.HTTP_201_CREATED
        )
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mis_reservas(request):
    reservas = Reserva.objects.filter(
        user=request.user
    ).order_by("-fecha", "-hora_inicio", "-hora_fin")

    serializer = ReservaSerializer(reservas, many=True)
    return Response(serializer.data)


@api_view(["GET"])
#@permission_classes([IsAdminUser])
def admin_reservas(request):
    reservas = Reserva.objects.all().order_by("-fecha", "-hora_inicio")

    serializer = ReservaSerializer(reservas, many=True)
    return Response(serializer.data)

def enviar_whatsapp(reserva):
    import urllib.parse
    mensaje = f"""
📌 Nueva reserva
👤 {reserva.nombre}
📞 {reserva.telefono}
📅 {reserva.fecha} {reserva.hora}
🍽️ Mesas: {reserva.mesas}
🪑 Sillas: {reserva.sillas}
"""
    url = "https://wa.me/1809XXXXXXX?text=" + urllib.parse.quote(mensaje)
    return url
from django.core.mail import send_mail

def enviar_email_admin(reserva):
    send_mail(
        subject="Nueva reserva",
        message=f"""
Nombre: {reserva.nombre}
Teléfono: {reserva.telefono}
Fecha: {reserva.fecha} {reserva.hora}
Mesas: {reserva.mesas}
Sillas: {reserva.sillas}
""",
        from_email="reservas@tuapp.com",
        recipient_list=["admin@tuapp.com"]
    )

from django.utils.timezone import now

def cerrar_reservas_expiradas():
    hoy = now().date()

    reservas = Reserva.objects.filter(
        fecha__lt=hoy,
        estado__in=["pendiente", "confirmada"]
    )

    for r in reservas:
        r.estado = "cerrada"
        r.resultado = "no_show"
        r.save()
        notificar_cambio_estado_reserva(r)



from rest_framework.permissions import IsAdminUser

@api_view(["PATCH"])
@permission_classes([IsAdminUser])  # solo admin
def cambiar_estado_reserva(request, reserva_id):

    try:
        reserva = Reserva.objects.get(id=reserva_id)
    except Reserva.DoesNotExist:
        return Response(
            {"error": "Reserva no encontrada"},
            status=status.HTTP_404_NOT_FOUND
        )

    nuevo_estado = request.data.get("estado")

    if nuevo_estado not in ["pendiente", "confirmada", "cancelada", "cerrada"]:
        return Response(
            {"error": "Estado inválido"},
            status=status.HTTP_400_BAD_REQUEST
        )

    reserva.estado = nuevo_estado
    reserva.save()
    notificar_cambio_estado_reserva(reserva)

    return Response({
        "mensaje": "Estado actualizado",
        "estado": reserva.estado
    })
