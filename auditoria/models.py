from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings

class Bitacora(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    accion = models.CharField(max_length=50)
    modulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    modelo = models.CharField(max_length=100, null=True, blank=True)
    objeto_id = models.CharField(max_length=50, null=True, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-fecha']