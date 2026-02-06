from rest_framework import serializers
from django.contrib.auth import authenticate
from django.conf import settings
from rest_framework.authtoken.models import Token

User = settings.AUTH_USER_MODEL

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    # Validación del usuario
    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            raise serializers.ValidationError("Debe proporcionar username y password")

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Credenciales inválidas")

        data["user"] = user  # Pasamos el usuario validado al view
        return data


from rest_framework import serializers
from .models import Usuariohtp

class AdminUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuariohtp
        fields = [
            "id",
            "username",
            "nombre",
            "apellido",
            "email",
            "telefono",
            "is_staff",
            "is_superuser",
            "is_active",
        ]


# users/serializers.py
from rest_framework import serializers
from .models import Usuariohtp

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuariohtp
        fields = [
            "username",
            "email",
            "rol",
            "is_active",
            "nombre",
            "apellido",
            "telefono",
            "direccion",
            "imagen",
        ]
        read_only_fields = [
            "username",
            "email",
            "rol",
            "is_active",
        ]





class CambiarPasswordSerializer(serializers.Serializer):
    actual = serializers.CharField(write_only=True, required=True)
    nueva = serializers.CharField(write_only=True, required=True)
    confirmar = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        if data["nueva"] != data["confirmar"]:
            raise serializers.ValidationError("Las contraseñas no coinciden")

        if len(data["nueva"]) < 8:
            raise serializers.ValidationError(
                "La nueva contraseña debe tener al menos 8 caracteres"
            )

        return data
