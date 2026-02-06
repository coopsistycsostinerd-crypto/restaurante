from rest_framework import serializers
from .models import Categoria, Producto


class ProductoSerializer(serializers.ModelSerializer):
    categoria = serializers.StringRelatedField()

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'precio', 'categoria', 'imagen']


class CategoriaSerializer(serializers.ModelSerializer):
    productos = ProductoSerializer(many=True, read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'productos']
        
class AdminProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = "__all__"