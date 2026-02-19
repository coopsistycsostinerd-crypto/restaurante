from django.urls import path
from .views import *

urlpatterns = [
    path("caja/ordenes-listas/", OrdenesParaCajaAPIView.as_view()),
       path("caja/orden/<int:orden_id>/", OrdenDetailAPIView.as_view()),
    path("caja/crear-venta/<int:orden_id>/", CrearVentaDesdeOrdenAPIView.as_view()),
     path('caja/agregar-pago/<int:venta_id>/', AgregarPagoAPIView.as_view(), name='agregar_pago'),

    path("caja/generar-comprobante/<int:venta_id>/", GenerarComprobanteAPIView.as_view()),
     path('caja/ticket/<int:venta_id>/', ticket_venta),
     path("caja/crear-venta/", CrearVentaAPIView.as_view()),

]
