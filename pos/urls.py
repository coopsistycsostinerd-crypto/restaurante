from django.urls import path
from . import views
from django.contrib.auth.decorators import login_required
urlpatterns = [

    # 🖥️ Pantalla POS
    path("pos/", login_required(views.pos_view), name="pos"),

    # 📦 API Productos para POS
    path("pos/productos/", views.api_productos_pos, name="api_productos_pos"),

    # 💳 API Crear Venta desde POS
    path("pos/crear-venta/", views.api_crear_venta2, name="api_crear_venta"),
   
    # 🧾 Ticket

   path("pos/crear-venta-pos/", views.CrearVentaPOSAPIView.as_view(), name="crear_venta_pos"),

]
