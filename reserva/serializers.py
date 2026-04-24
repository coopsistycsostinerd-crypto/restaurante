from rest_framework import serializers
from .models import Reserva, CapacidadLocal
from django.db.models import Sum
from django.utils import timezone
from datetime import datetime, timedelta

from datetime import datetime
from django.db.models import Sum
from django.utils import timezone
from rest_framework import serializers
from datetime import datetime, timedelta
from datetime import datetime, timedelta
from django.utils import timezone
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status

from rest_framework import serializers
from .models import Reserva, CapacidadLocal
from django.db.models import Sum
from django.utils import timezone
from datetime import datetime, timedelta


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
            "email",
            "estado",
            "creado",
        )
        read_only_fields = ("estado", "creado")

    def validate(self, data):
        request = self.context.get("request")

        # =========================
        # VALIDAR EMAIL
        # =========================
        if not request.user.is_authenticated:
            email = data.get("email")
            if not email:
                raise serializers.ValidationError({
                    "email": "El email es obligatorio."
                })

        fecha = data["fecha"]
        inicio = data["hora_inicio"]
        fin = data["hora_fin"]
        mesas = data["mesas"]
        sillas = data["sillas"]

        inicio_dt = datetime.combine(fecha, inicio)
        fin_dt = datetime.combine(fecha, fin)

        if fin_dt <= inicio_dt:
            fin_dt += timedelta(days=1)

        if fecha < timezone.localdate():
            raise serializers.ValidationError(
                "No puedes reservar en una fecha pasada."
            )

        now = timezone.localtime()

        if fecha == now.date() and inicio <= now.time():
            raise serializers.ValidationError(
                "La hora de inicio debe ser mayor a la actual."
            )

        capacidad = CapacidadLocal.objects.first()

        if not capacidad:
            raise serializers.ValidationError(
                "Capacidad no configurada."
            )

        reservas = Reserva.objects.filter(
            fecha=fecha,
            estado__in=["pendiente", "confirmada"],
            hora_inicio__lt=fin,
            hora_fin__gt=inicio,
        ).aggregate(
            mesas_ocupadas=Sum("mesas"),
            sillas_ocupadas=Sum("sillas"),
        )

        mesas_ocupadas = reservas["mesas_ocupadas"] or 0
        sillas_ocupadas = reservas["sillas_ocupadas"] or 0

        if mesas_ocupadas + mesas > capacidad.mesas_totales:
            raise serializers.ValidationError(
                "No hay mesas disponibles."
            )

        if sillas_ocupadas + sillas > capacidad.sillas_totales:
            raise serializers.ValidationError(
                "No hay sillas disponibles."
            )

        data["hora_fin"] = fin_dt.time()

        return data

    def create(self, validated_data):
        request = self.context.get("request")

        if request and request.user.is_authenticated:
            validated_data["user"] = request.user
            validated_data["email"] = request.user.email

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
