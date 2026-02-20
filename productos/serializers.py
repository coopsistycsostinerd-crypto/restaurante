from rest_framework import serializers
from .models import Categoria, Producto


class ProductoSerializer(serializers.ModelSerializer):
    categoria = serializers.StringRelatedField()

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'precio', 'categoria', 'imagen', 'descripcion']


class CategoriaSerializer(serializers.ModelSerializer):
    productos = ProductoSerializer(many=True, read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'productos']
        
class AdminProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(
        source="categoria.nombre",
        read_only=True
    )
    class Meta:
        model = Producto
        fields = "__all__"