from django.db import models

# Create your models here.
# caja/models.py  (o crea app nueva llamada "configuracion")

from django.db import models

class Empresa(models.Model):
    nombre = models.CharField(max_length=200)
    razon_social = models.CharField(max_length=200, blank=True, null=True)
    rnc = models.CharField(max_length=20, blank=True, null=True)

    telefono = models.CharField(max_length=20, blank=True, null=True)
    whatsapp = models.CharField(max_length=20, blank=True, null=True)

    email = models.EmailField(blank=True, null=True)
    email_contacto = models.EmailField(blank=True, null=True)

    direccion = models.TextField(blank=True, null=True)
    horario = models.CharField(max_length=200, blank=True, null=True)

    slogan = models.CharField(max_length=255, blank=True, null=True)

    instagram = models.URLField(blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)

    google_maps_url = models.URLField(blank=True, null=True)

    logo = models.ImageField(upload_to="empresa/", blank=True, null=True)

    pie_factura = models.TextField(
        blank=True,
        null=True,
        help_text="Texto que aparecerá al final del ticket o factura"
    )
    activo = models.BooleanField(default=True)
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    ciudad = models.CharField(max_length=100, blank=True, null=True)
    pais = models.CharField(max_length=100, blank=True, null=True)



    def __str__(self):
        return f"{self.nombre} ({self.telefono})"





from django.db import models

class MensajeContacto(models.Model):
    nombre = models.CharField(max_length=150)
    email = models.EmailField()
    telefono = models.CharField(max_length=30, blank=True, null=True)
    mensaje = models.TextField()

    creado = models.DateTimeField(auto_now_add=True)
    leido = models.BooleanField(default=False)
    def __str__(self):
        return f"{self.nombre} - {self.email}"

from django.db import models

class Contacto(models.Model):
    nombre = models.CharField(max_length=120)
    email = models.EmailField()
    telefono = models.CharField(max_length=30, blank=True, null=True)
    mensaje = models.TextField()
    creado = models.DateTimeField(auto_now_add=True)
    leido = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre
