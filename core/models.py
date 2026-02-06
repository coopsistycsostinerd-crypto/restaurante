from django.db import models

# Create your models here.
# caja/models.py  (o crea app nueva llamada "configuracion")

from django.db import models

class Empresa(models.Model):
    nombre = models.CharField(max_length=200)
    razon_social = models.CharField(max_length=200, blank=True, null=True)
    rnc = models.CharField(max_length=20, blank=True, null=True)

    telefono = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)

    logo = models.ImageField(upload_to="empresa/", blank=True, null=True)

    pie_factura = models.TextField(
        blank=True,
        null=True,
        help_text="Texto que aparecerá al final del ticket o factura"
    )

    def __str__(self):
        return self.nombre
