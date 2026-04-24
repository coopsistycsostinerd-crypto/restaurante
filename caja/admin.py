from django.contrib import admin

# Register your models here.


from caja.models import Venta
@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ("id", "cajero", "fecha", "subtotal", "impuestos", "total", "completada", "orden", "reserva")
    list_filter = ("fecha", "cajero", "completada")
    search_fields = ("cajero__username", "cajero__email")
