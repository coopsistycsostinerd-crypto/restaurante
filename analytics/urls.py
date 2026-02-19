# analytics/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path("resumen/", views.resumen_general),
    path("productos/", views.productos_mas_vendidos),
    path("ventas-dia/", views.ventas_por_dia),
]
