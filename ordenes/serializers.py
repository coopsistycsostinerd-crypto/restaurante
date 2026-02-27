from rest_framework import serializers
from .models import Orden, OrdenItem
from productos.models import Producto


class OrdenItemSerializer(serializers.ModelSerializer):
    # 👉 Para CREAR (POST)
    producto_id = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(),
        source='producto',
        write_only=True
    )

    # 👉 Para LEER (GET)
    nombre_producto = serializers.CharField(source='producto.nombre', read_only=True)

    class Meta:
        model = OrdenItem
        fields = ['producto_id', 'nombre_producto', 'cantidad', 'precio']



class OrdenSerializer(serializers.ModelSerializer):
    items = OrdenItemSerializer(many=True)

    class Meta:
        model = Orden
        fields = [
            'id',
            'cliente_nombre',
            'cliente_telefono',
            'cliente_correo', 
            'tipo_pedido',
            'direccion',
            'total',
            'estado',
            'creado',
            'items'
        ]
        read_only_fields = ['estado', 'creado']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        orden = Orden.objects.create(**validated_data)

        for item in items_data:
            OrdenItem.objects.create(orden=orden, **item)

        return orden
    def validate(self, data):
        request = self.context.get("request")

        # Si es invitado, exigir correo
        if not request.user.is_authenticated:
            if not data.get("cliente_correo"):
                raise serializers.ValidationError({
                    "cliente_correo": "El correo es obligatorio para pedidos sin cuenta."
                })

        return data

class OrdenAdminSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    items = OrdenItemSerializer(many=True, read_only=True)

    class Meta:
        model = Orden
        fields = "__all__"

    def get_usuario_nombre(self, obj):
        if obj.usuario:
            return f"{obj.usuario.nombre} {obj.usuario.apellido}"
        return "Invitado"
