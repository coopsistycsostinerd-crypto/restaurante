from rest_framework import serializers
from .models import Reserva, CapacidadLocal
from django.db.models import Sum
from django.utils import timezone
from datetime import datetime, timedelta

from datetime import datetime
from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers

class ReservaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Reserva
        fields = (
            "id",
            "fecha",
            "hora_inicio",
            "hora_fin",
            "mesas",
            "sillas",
            "nombre",
            "telefono",
            "estado",
            "creado",
        )
        read_only_fields = ("estado", "creado")

    def validate(self, data):
        fecha = data["fecha"]
        inicio = data["hora_inicio"]
        fin = data["hora_fin"]
        mesas = data["mesas"]
        sillas = data["sillas"]

        # ===============================
        # 1️⃣ VALIDAR RANGO HORARIO
        # ===============================
        if inicio >= fin:
            raise serializers.ValidationError(
                "La hora de salida debe ser mayor a la de inicio."
            )

        # ===============================
        # 2️⃣ VALIDAR FECHA / HORA (LOCAL)
        # ===============================
        now = timezone.localtime()
        hoy = now.date()

        if fecha < hoy:
            raise serializers.ValidationError(
                "No puedes reservar en una fecha pasada."
            )

        if fecha == hoy and inicio <= now.time():
            raise serializers.ValidationError(
                "La hora de inicio debe ser mayor a la hora actual."
            )

        # ===============================
        # 3️⃣ VALIDAR CAPACIDAD (SOLAPAMIENTO)
        # ===============================
        capacidad = CapacidadLocal.objects.first()
        if not capacidad:
            raise serializers.ValidationError(
                "Capacidad del local no configurada."
            )

        reservas = Reserva.objects.filter(
            fecha=fecha,
            estado__in=["pendiente", "confirmada"],
            hora_inicio__lt=fin,
            hora_fin__gt=inicio,
        ).aggregate(
            mesas_ocupadas=Sum("mesas"),
            sillas_ocupadas=Sum("sillas")
        )

        mesas_ocupadas = reservas["mesas_ocupadas"] or 0
        sillas_ocupadas = reservas["sillas_ocupadas"] or 0

        if mesas_ocupadas + mesas > capacidad.mesas_totales:
            raise serializers.ValidationError(
                "No hay mesas disponibles en ese horario."
            )

        if sillas_ocupadas + sillas > capacidad.sillas_totales:
            raise serializers.ValidationError(
                "No hay sillas disponibles en ese horario."
            )

        return data

    def create(self, validated_data):
     request = self.context.get("request")

     if request and request.user.is_authenticated:
        validated_data["user"] = request.user

        validated_data["nombre"] = (
            validated_data.get("nombre")
            or request.user.get_full_name()
            or request.user.username
        )

        validated_data["telefono"] = (
            validated_data.get("telefono")
            or getattr(request.user, "telefono", "")
        )

     return super().create(validated_data)


class DisponibilidadSerializer(serializers.Serializer):
    fecha = serializers.DateField()
    hora = serializers.TimeField()
