from django.contrib import admin
from django.utils.html import format_html
# Register your models here.
from django.contrib import admin
from .models import Bitacora


@admin.register(Bitacora)
class BitacoraAdmin(admin.ModelAdmin):
    list_display = (
        'fecha',
        'usuario',
        'accion_color',
        'modulo',
        'modelo',
        'objeto_id',
        'ip'
    )

    list_filter = (
        'accion',
        'modulo',
        'modelo',
        'fecha'
    )

    search_fields = (
        'usuario__username',
        'descripcion',
        'modelo',
        'objeto_id',
        'ip'
    )

    readonly_fields = (
        'usuario',
        'accion',
        'modulo',
        'descripcion',
        'modelo',
        'objeto_id',
        'ip',
        'fecha'
    )

    ordering = ('-fecha',)

    fieldsets = (
        ('Información General', {
            'fields': (
                'usuario',
                'accion',
                'modulo',
                'descripcion'
            )
        }),
        ('Objeto Afectado', {
            'fields': (
                'modelo',
                'objeto_id'
            )
        }),
        ('Conexión', {
            'fields': (
                'ip',
                'fecha'
            )
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def accion_color(self, obj):
        colores = {
            'CREAR': 'green',
            'EDITAR': 'orange',
            'ELIMINAR': 'red',
            'LOGIN': 'blue',
            'LOGOUT': 'gray'
        }

        color = colores.get(obj.accion, 'black')

        return format_html(
            '<strong style="color:{};">{}</strong>',
            color,
            obj.accion
        )

    accion_color.short_description = "Acción"