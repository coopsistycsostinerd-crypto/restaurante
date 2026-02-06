from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from users.models import Usuariohtp
from .serializers import LoginSerializer
from rest_framework.authtoken.models import Token
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser
from .models import Usuariohtp
from .serializers import AdminUsuarioSerializer

from django.contrib.auth import login

class LoginAPIView(APIView):
    permission_classes = []  # AllowAny
    def get(self, request):
        return Response({"message": "Panel admin OK"})
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            login(request, user)
            # Crear o recuperar token
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "token": token.key,
                "nombre": user.nombre,
                "apellido": user.apellido,
                "email": user.email,
                "telefono": user.telefono,
                "direccion": user.direccion,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                  "is_admin": user.is_admin,

            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import logout

class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            token = Token.objects.get(user=request.user)
            token.delete()
            logout(request)
        except Token.DoesNotExist:
            pass

        return Response({"message": "Sesión cerrada correctamente"})



class AdminListaUsuariosAPIView(ListAPIView):
    serializer_class = AdminUsuarioSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        rol = self.request.query_params.get("rol")  # ?rol=cliente

        queryset = Usuariohtp.objects.all().order_by("-id")

        if rol:
            queryset = queryset.filter(rol=rol)

        return queryset






# users/views.py


from .serializers import PerfilUsuarioSerializer

class PerfilUsuarioAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = PerfilUsuarioSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = PerfilUsuarioSerializer(
            request.user,
            data=request.data,
            partial=True  # 👈 permite editar solo algunos campos
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



from django.contrib.auth import authenticate

from .serializers import CambiarPasswordSerializer


class CambiarPasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CambiarPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        actual = serializer.validated_data["actual"]
        nueva = serializer.validated_data["nueva"]

        # 🔐 Verificar contraseña actual
        if not user.check_password(actual):
            return Response(
                {"error": "La contraseña actual es incorrecta"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔄 Cambiar contraseña
        user.set_password(nueva)
        user.save()

        return Response(
            {"message": "Contraseña actualizada correctamente"},
            status=status.HTTP_200_OK
        )
