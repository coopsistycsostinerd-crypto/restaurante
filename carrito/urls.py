# carrito/urls.py
from django.urls import path
from .views import CarritoAPIView, AgregarItemAPIView, EliminarItemAPIView, SincronizarCarritoAPIView

urlpatterns = [
    path("carrito/", CarritoAPIView.as_view()),
    path("carrito/agregar/", AgregarItemAPIView.as_view()),
    path("carrito/eliminar/", EliminarItemAPIView.as_view()),
    path("sync/", SincronizarCarritoAPIView.as_view()),
]
