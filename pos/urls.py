from django.urls import path
from . import views
from django.contrib.auth.decorators import login_required
urlpatterns = [

    # 🖥️ Pantalla POS
    path("pos/", login_required(views.pos_view), name="pos"),

    # 📦 API Productos para POS
    path("pos/productos/", views.api_productos_pos, name="api_productos_pos"),

    # 💳 API Crear Venta desde POS
    path("api/pos/crear-venta/", views.api_crear_venta, name="api_crear_venta"),

    # 🧾 Ticket
    path("ticket/<int:venta_id>/", views.ticket_venta, name="ticket_venta"),

]
