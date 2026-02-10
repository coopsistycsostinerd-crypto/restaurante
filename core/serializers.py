from rest_framework import serializers
from .models import Empresa

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = "__all__"


from .models import MensajeContacto

class MensajeContactoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MensajeContacto
        fields = (
            "id",
            "nombre",
            "email",
            "telefono",
            "mensaje",
            "creado",
        )
        read_only_fields = ("id", "creado")





class MensajeContactoAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = MensajeContacto
        fields = "__all__"
