from django.contrib import admin

# Register your models here.

from .models import Orden, OrdenItem
class OrdenItemInline(admin.TabularInline):
    model = OrdenItem
    extra = 0

@admin.register(Orden)
class OrdenAdmin(admin.ModelAdmin):
    list_display = ('id', 'cliente_nombre', 'total', 'estado', 'estado_pago', 'creado')
    list_filter = ('estado', 'estado_pago', 'creado')
    search_fields = ('cliente_nombre', 'cliente_telefono', 'cliente_correo')
    inlines = [OrdenItemInline]


class OrdenItemAdmin(admin.ModelAdmin):
    list_display = ('orden', 'producto', 'cantidad', 'precio')
    list_filter = ('orden', 'producto')
    search_fields = ('orden__cliente_nombre', 'producto__nombre')

admin.site.register(OrdenItem, OrdenItemAdmin)  

