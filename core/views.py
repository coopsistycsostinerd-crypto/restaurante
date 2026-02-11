

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from .models import Empresa
from .serializers import EmpresaSerializer

from django.shortcuts import render
from productos.models import Categoria, Producto

def home(request):
    categorias = Categoria.objects.all()
    productos = Producto.objects.filter(disponible=True)

    return render(request, "home.html", {
        "categorias": categorias,
        "productos": productos
    })




from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import AllowAny

class EmpresaPublicAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        empresa, created = Empresa.objects.get_or_create(id=1)
        serializer = EmpresaSerializer(empresa)
        return Response(serializer.data)

class EmpresaConfigAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        empresa, created = Empresa.objects.get_or_create(id=1)
        serializer = EmpresaSerializer(empresa)
        return Response(serializer.data)

    def put(self, request):
        empresa, created = Empresa.objects.get_or_create(id=1)
        serializer = EmpresaSerializer(
            empresa,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.db.models import Sum, Count
from django.utils.timezone import now
from datetime import datetime
from ordenes.models import Orden
from reserva.models import Reserva

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    hoy = now().date()

    fecha_inicio = request.GET.get("from")
    fecha_fin = request.GET.get("to")

    ordenes = Orden.objects.all()
    reservas = Reserva.objects.all()

    if fecha_inicio and fecha_fin:
        ordenes = ordenes.filter(
            creado__date__range=[fecha_inicio, fecha_fin]
        )
        reservas = reservas.filter(
            fecha__range=[fecha_inicio, fecha_fin]
        )

    # KPIs
    total_ordenes = ordenes.count()
    total_ventas = ordenes.filter(
        estado="entregado"
    ).aggregate(total=Sum("total"))["total"] or 0

    ordenes_por_estado = (
        ordenes.values("estado")
        .annotate(total=Count("id"))
    )

    reservas_hoy = reservas.filter(fecha=hoy).count()

    reservas_por_estado = (
        reservas.values("estado")
        .annotate(total=Count("id"))
    )

    # 📈 Ventas por día
    ventas_por_dia = (
        ordenes.filter(estado="entregado")
        .values("creado__date")
        .annotate(total=Sum("total"))
        .order_by("creado__date")
    )

    # 📊 Reservas por día
    reservas_por_dia = (
        reservas.values("fecha")
        .annotate(total=Count("id"))
        .order_by("fecha")
    )

    return Response({
        "kpis": {
            "total_ordenes": total_ordenes,
            "total_ventas": total_ventas,
            "reservas_hoy": reservas_hoy
        },
        "ordenes_por_estado": list(ordenes_por_estado),
        "reservas_por_estado": list(reservas_por_estado),
        "ventas_por_dia": list(ventas_por_dia),
        "reservas_por_dia": list(reservas_por_dia),
    })



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .serializers import MensajeContactoSerializer


from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def enviar_mensaje_contacto(request):
    print("lo que llego al backen", request.data)
    serializer = MensajeContactoSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "Mensaje enviado correctamente"},
            status=status.HTTP_201_CREATED
        )

    print(serializer.errors)  # 👈 DEBUG
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





from .models import MensajeContacto
from .serializers import MensajeContactoAdminSerializer

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_mensajes_contacto(request):
    mensajes = MensajeContacto.objects.all().order_by("-creado")
    serializer = MensajeContactoAdminSerializer(mensajes, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def marcar_contacto_leido(request, pk):
    try:
        mensaje = MensajeContacto.objects.get(pk=pk)
    except MensajeContacto.DoesNotExist:
        return Response(
            {"error": "Mensaje no encontrado"},
            status=404
        )

    mensaje.leido = request.data.get("leido", False)
    mensaje.save()

    return Response(
        {
            "id": mensaje.id,
            "leido": mensaje.leido
        },
        status=200
    )



# views.py
from django.http import JsonResponse


def experiencias(request):
    return render(request, "experiencias.html")