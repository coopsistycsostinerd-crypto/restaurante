from django.urls import path
from . import views

urlpatterns = [
    path("reportes/", views.reporte_general, name="reporte_general"),
]