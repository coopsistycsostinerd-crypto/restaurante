from rest_framework import serializers
from .models import Venta, Pago, ComprobanteFiscal, TipoComprobante
from ordenes.models import Orden


class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = "__all__"
        read_only_fields = ["cajero", "fecha", "completada"]


class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = "__all__"
        read_only_fields = ["fecha"]


class TipoComprobanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoComprobante
        fields = "__all__"


class ComprobanteFiscalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComprobanteFiscal
        fields = "__all__"