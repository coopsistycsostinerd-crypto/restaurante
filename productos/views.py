from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.viewsets import  ModelViewSet
from rest_framework.response import Response
from .models import Categoria, Producto
from .serializers import AdminProductoSerializer, CategoriaSerializer, ProductoSerializer
from rest_framework.permissions import IsAdminUser

class CategoriaListView(APIView):
    def get(self, request):
        categorias = Categoria.objects.filter(activa=True)
        serializer = CategoriaSerializer(categorias, many=True)
        return Response(serializer.data)


class ProductoListView(APIView):
    def get(self, request):
        productos = Producto.objects.filter(disponible=True)
      
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data)


class AdminProductoViewSet(ModelViewSet):
    queryset = Producto.objects.select_related("categoria").all().order_by("id")
    serializer_class = AdminProductoSerializer
    permission_classes = [IsAdminUser]
    