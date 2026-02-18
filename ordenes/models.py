from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Orden(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    creado = models.DateTimeField(auto_now_add=True)

    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('preparando', 'Preparando'),
        ('entregado', 'Entregado'),
                ('canelado', 'Cancelado'),
    )
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')

    # Campos extra
    cliente_nombre = models.CharField(max_length=200, blank=True, null=True)
    cliente_telefono = models.CharField(max_length=20, blank=True, null=True)
    TIPO_PEDIDO = (
        ("delivery", "Delivery"),
        ("retirar", "Retirar en local"),
    )
    tipo_pedido = models.CharField(max_length=20, choices=TIPO_PEDIDO, default="retirar")
    direccion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Orden #{self.id} - {self.cliente_nombre or 'Anonimo'}"


class OrdenItem(models.Model):
    orden = models.ForeignKey(Orden, related_name='items', on_delete=models.CASCADE)
    producto = models.ForeignKey('productos.Producto', on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def total_linea(self):
        return self.cantidad * self.precio

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"
