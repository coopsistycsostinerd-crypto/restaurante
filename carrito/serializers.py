# carrito/serializers.py
from rest_framework import serializers
from .models import Carrito, ItemCarrito

class ItemCarritoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source="producto.nombre", read_only=True)
    precio = serializers.DecimalField(source="producto.precio", max_digits=8, decimal_places=2, read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = ItemCarrito
        fields = ["id", "producto", "nombre", "precio", "cantidad", "subtotal"]

    def get_subtotal(self, obj):
        return obj.subtotal()

class CarritoSerializer(serializers.ModelSerializer):
    items = ItemCarritoSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Carrito
        fields = ["id", "items", "total"]

    def get_total(self, obj):
        return obj.total()
