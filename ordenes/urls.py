from django.urls import path
from .views import AdminCambiarEstadoOrdenAPIView,  AdminOrdenDetailAPIView, AdminOrdenListAPIView,  LimpiarCarritoAPIView, OrdenListCreateAPIView, MisOrdenesAPIView, PanelAdminAccessAPIView, panel_admin_view
from django.urls import path



urlpatterns = [
    path("ordenes/", OrdenListCreateAPIView.as_view(), name="ordenes"),
    path("mis-ordenes/", MisOrdenesAPIView.as_view(), name="mis-ordenes"),
    path("carrito/limpiar/", LimpiarCarritoAPIView.as_view(), name="limpiar_carrito"),


    path("panel-admin/access/", PanelAdminAccessAPIView.as_view(), name="panel-admin-access"),
   path("panel-admin/", panel_admin_view, name="panel-admin"),


      path("panel-admin/ordenes/", AdminOrdenListAPIView.as_view()),
    path("panel-admin/ordenes/<int:pk>/", AdminCambiarEstadoOrdenAPIView.as_view()),
    path("panel-admin/ordenes/<int:pk>/estado/", AdminCambiarEstadoOrdenAPIView.as_view()),
   

]



