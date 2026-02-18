from django.conf import settings
from django.db import models

# Create your models here.
class Venta(models.Model):
    orden = models.OneToOneField("ordenes.Orden", on_delete=models.PROTECT, related_name="venta",  null=True,
        blank=True)
    cajero = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    impuestos = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    reserva = models.OneToOneField(
        "reserva.Reserva",
        on_delete=models.PROTECT,
        related_name="venta",
        null=True,
        blank=True
    )
    completada = models.BooleanField(default=False)  # Se marca cuando el pago cubre el total

    def __str__(self):
        return f"Venta #{self.id} - Orden {self.orden.id}"



class Pago(models.Model):
    METODOS = (
        ("efectivo", "Efectivo"),
        ("tarjeta", "Tarjeta"),
        ("transferencia", "Transferencia"),
    )

    venta = models.ForeignKey(Venta, related_name="pagos", on_delete=models.CASCADE)
    metodo = models.CharField(max_length=20, choices=METODOS)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)

    # 🔽 Datos adicionales según el método
    referencia = models.CharField(max_length=100, blank=True, null=True)  # transferencia, tarjeta
    banco = models.CharField(max_length=100, blank=True, null=True)
    ultimos_digitos = models.CharField(max_length=4, blank=True, null=True)  # tarjeta

    def __str__(self):
        return f"{self.metodo} - ${self.monto}"
    


class TipoComprobante(models.Model):
    nombre = models.CharField(max_length=100)
    codigo = models.CharField(max_length=5)  # B01, B02, etc.

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class ComprobanteFiscal(models.Model):
    venta = models.OneToOneField(Venta, on_delete=models.CASCADE, related_name="comprobante")
    tipo = models.ForeignKey(TipoComprobante, on_delete=models.PROTECT)
    numero = models.CharField(max_length=20)  # NCF generado
    rnc_cliente = models.CharField(max_length=20, blank=True, null=True)
    razon_social = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.numero}"





class PagoOnline(models.Model):

    METODOS = (
        ("tarjeta", "Tarjeta"),
        ("transferencia", "Transferencia"),
    )

    ESTADOS = (
        ("pendiente", "Pendiente"),
        ("confirmado", "Confirmado"),
        ("rechazado", "Rechazado"),
    )

    orden = models.ForeignKey("ordenes.Orden", on_delete=models.CASCADE, related_name="pagos_online")

    metodo = models.CharField(max_length=20, choices=METODOS)
    estado = models.CharField(max_length=20, choices=ESTADOS, default="pendiente")

    monto = models.DecimalField(max_digits=10, decimal_places=2)

    # Datos opcionales
    referencia = models.CharField(max_length=100, blank=True, null=True)
    banco = models.CharField(max_length=100, blank=True, null=True)
    ultimos_digitos = models.CharField(max_length=4, blank=True, null=True)

    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"PagoOnline Orden {self.orden.id} - {self.metodo}"
