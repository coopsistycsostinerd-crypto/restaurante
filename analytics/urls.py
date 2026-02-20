# analytics/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path("analytics/resumen/", views.resumen_general),
    path("analytics/productos/", views.productos_mas_vendidos),
    path("analytics/ventas-dia/", views.ventas_por_dia),
]
