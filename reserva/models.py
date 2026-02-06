from django.db import models

# Create your models here.
class CapacidadLocal(models.Model):
    mesas_totales = models.PositiveIntegerField()
    sillas_totales = models.PositiveIntegerField()
from django.conf import settings
User = settings.AUTH_USER_MODEL

class Reserva(models.Model):

    ESTADOS = (
        ("pendiente", "Pendiente"),
        ("confirmada", "Confirmada"),
        ("en_uso", "En uso"),
        ("cerrada", "Cerrada"),
        ("cancelada", "Cancelada"),
    )

    RESULTADOS = (
        ("usada", "Usada"),
        ("no_show", "No se presentó"),
        ("cancelada", "Cancelada"),
        ("expirada", "Expirada"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL
    )

    nombre = models.CharField(max_length=100)
    telefono = models.CharField(max_length=30)

    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()

    mesas = models.PositiveIntegerField()
    sillas = models.PositiveIntegerField()

    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default="pendiente"
    )

    resultado = models.CharField(
        max_length=20,
        choices=RESULTADOS,
        null=True,
        blank=True
    )

    creado = models.DateTimeField(auto_now_add=True)
