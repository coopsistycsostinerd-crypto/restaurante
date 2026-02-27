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
from emails.services import enviar_correo_bienvenida, notificar_cambio_password, notificar_login
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
            notificar_login(user)
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
        print("🔥 === INICIANDO CAMBIO DE PASSWORD ===")

        try:
            print("Datos recibidos:", request.data)

            serializer = CambiarPasswordSerializer(data=request.data)

            if not serializer.is_valid():
                print("❌ Serializer inválido:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            user = request.user
            print("Usuario autenticado:", user)
            print("Email usuario:", user.email)

            actual = serializer.validated_data["actual"]
            nueva = serializer.validated_data["nueva"]

            print("Password actual recibida:", actual)
            print("Password nueva recibida:", nueva)

            # 🔐 Verificar contraseña actual
            if not user.check_password(actual):
                print("❌ Password actual incorrecta")
                return Response(
                    {"error": "La contraseña actual es incorrecta"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            print("✅ Password actual correcta")

            # 🔄 Cambiar contraseña
            user.set_password(nueva)
            user.save()
            print("✅ Password guardada en BD")

            print("📧 Intentando enviar correo...")
            notificar_cambio_password(user)
            print("✅ Función notificar_cambio_password ejecutada")

            return Response(
                {"message": "Contraseña actualizada correctamente"},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            print("💥 ERROR GENERAL EN CAMBIAR PASSWORD:")
            print(str(e))
            return Response(
                {"error": "Error interno del servidor"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Usuariohtp

@csrf_exempt
def registro_cliente(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido"}, status=405)

    try:
        data = request.POST

        user = Usuariohtp.objects.create_user(
            email=data.get("email"),
            username=data.get("username"),
            nombre=data.get("nombre"),
            apellido=data.get("apellido"),
            password=data.get("password")
        )

        # 🔒 datos extra
        user.telefono = data.get("telefono")
        user.direccion = data.get("direccion")
        user.rol = "cliente"
        user.save()
        enviar_correo_bienvenida(user)

        return JsonResponse({"success": True})

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


# users/views.py
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAdminUser
from .serializers import AdminCrearUsuarioSerializer
from users.models import Usuariohtp


class AdminCrearUsuarioAPIView(CreateAPIView):
    queryset = Usuariohtp.objects.all()
    serializer_class = AdminCrearUsuarioSerializer
    permission_classes = [IsAdminUser]

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model
import json

User = get_user_model()


@csrf_exempt
@require_http_methods(["PATCH"])
def editar_usuario(request, user_id):
    # 🔐 Validación básica (ajústala si usas otra auth)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "No autorizado"}, status=401)

    # Solo admin / superuser pueden editar
    if request.user.rol not in ["admin", "superuser"]:
        return JsonResponse({"error": "Permisos insuficientes"}, status=403)

    try:
        usuario = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "Usuario no encontrado"}, status=404)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)

    # 🧠 Campos editables
    campos = {
        "username": "username",
        "email": "email",
        "nombre": "first_name",
        "apellido": "last_name",
        "telefono": "telefono",
        "direccion": "direccion",
        "rol": "rol",
        "is_active": "is_active",
    }

    for campo_front, campo_modelo in campos.items():
        if campo_front in data:
            setattr(usuario, campo_modelo, data[campo_front])

    usuario.save()

    return JsonResponse({
        "success": True,
        "message": "Usuario actualizado correctamente"
    })
