from django.db import models

# Create your models here.
# carrito/models.py
from django.db import models

from productos.models import Producto
from django.conf import settings
User = settings.AUTH_USER_MODEL
class Carrito(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    actualizado = models.DateTimeField(auto_now=True)

    def total(self):
        return sum(item.subtotal() for item in self.items.all())

class ItemCarrito(models.Model):
    carrito = models.ForeignKey(Carrito, related_name="items", on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)

    def subtotal(self):
        return self.producto.precio * self.cantidad
