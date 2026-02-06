from django.urls import reverse
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveAPIView, UpdateAPIView

from reserva.views import cerrar_reservas_expiradas
from users.models import Usuariohtp
from .models import Orden
from .serializers import OrdenAdminSerializer
from carrito.models import Carrito, ItemCarrito
from rest_framework.views import APIView
from .models import Orden
from .serializers import OrdenSerializer
from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render


# 🛒 Crear orden (usuario logueado o invitado)
class OrdenListCreateAPIView(generics.ListCreateAPIView):
    queryset = Orden.objects.all().order_by("-creado")
    serializer_class = OrdenSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        """
        Si el usuario está autenticado se guarda en la orden.
        Si no, se guarda como invitado (usuario = None)
        """
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(usuario=user)


# 👤 Ver solo las órdenes del usuario logueado

class MisOrdenesAPIView(generics.ListAPIView):
    serializer_class = OrdenSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def get_queryset(self):
        return Orden.objects.filter(usuario=self.request.user).order_by("-creado")


class LimpiarCarritoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            carrito = Carrito.objects.get(usuario=request.user)
            carrito.items.all().delete()  # 👈 BORRA LOS ITEMS, NO EL CARRITO
            return Response({"detail": "Carrito limpiado correctamente"})
        except Carrito.DoesNotExist:
            return Response({"detail": "El usuario no tiene carrito"}, status=404)
        


def es_admin(user):
    return user.is_staff or user.is_superuser

# panel/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

class PanelAdminAccessAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Solo superuser o admin personalizado
        if user.is_superuser or getattr(user, "is_admin", False):
            return Response({
                "access": True,
                "url": "/api/panel-admin/"   # URL REAL que renderiza el HTML
            })

        return Response({
            "access": False,
            "url": "/"  # Home
        }, status=status.HTTP_403_FORBIDDEN)


# panel/views.py

# ordenes/views.py
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect

@login_required(login_url="/")
def panel_admin_view(request):

    user = request.user

    if not (user.is_staff or user.is_superuser or getattr(user, "is_admin", False)):
        return redirect("/")
    cerrar_reservas_expiradas()
    return render(request, "admin_panel.html", {"admin_user": user})







class EsStaff(IsAuthenticated):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class AdminOrdenListAPIView(ListAPIView):
    queryset = Orden.objects.all().order_by("-creado")
    serializer_class = OrdenAdminSerializer
    permission_classes = [EsStaff]

  


class AdminOrdenDetailAPIView(RetrieveAPIView):
    queryset = Orden.objects.all()
    serializer_class = OrdenAdminSerializer
    permission_classes = [EsStaff]






class AdminCambiarEstadoOrdenAPIView(UpdateAPIView):
    queryset = Orden.objects.all()
    serializer_class = OrdenAdminSerializer
    permission_classes = [EsStaff]

    def patch(self, request, *args, **kwargs):
        orden = self.get_object()
        nuevo_estado = request.data.get("estado")

        estados_validos = ["pendiente", "preparando", "entregado"]

        if nuevo_estado not in estados_validos:
            return Response({"error": "Estado inválido"}, status=400)

        orden.estado = nuevo_estado
        orden.save()

        return Response({"mensaje": "Estado actualizado", "estado": orden.estado})




