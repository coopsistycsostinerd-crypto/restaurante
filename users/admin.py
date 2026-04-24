from django.contrib import admin

# Register your models here.

from .models import Usuariohtp, UsuarioManager
@admin.register(Usuariohtp)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "username",
        "email",
        "nombre",
        "apellido",
        "telefono",
        "direccion",
        "rol",
        "is_admin",
        "is_active",
    )

    list_filter = ("rol", "is_admin", "is_active")  # ✅ SOLO CAMPOS REALES
    list_editable = ("rol", "is_active", "is_admin")  # ✅ SOLO CAMPOS REALES

    search_fields = ("username", "email", "nombre", "apellido")
    ordering = ("-id",)


