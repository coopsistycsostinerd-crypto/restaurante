from django.urls import path
from .views import (
    cambiar_estado_reserva,
    disponibilidad,
    crear_reserva,
    mis_reservas,
    admin_reservas,
)

urlpatterns = [
    # 🔍 Consultar disponibilidad por fecha/hora
    path("disponibilidad/", disponibilidad, name="disponibilidad"),

    # 📝 Crear reserva (logueado o invitado)
    path("crear-reserva/", crear_reserva, name="crear_reserva"),

    # 👤 Mis reservas (solo usuario logueado)
    path("mis-reservas/", mis_reservas, name="mis_reservas"),

    # ⚙️ Panel admin – ver todas las reservas
    path("admin-reservas/", admin_reservas, name="admin_reservas"),

    path(
    "panel-admin/reservas/<int:reserva_id>/estado/",
    cambiar_estado_reserva,
    name="cambiar_estado_reserva"
),

    
]
