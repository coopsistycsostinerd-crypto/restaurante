from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token, settings

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
            print("ANTES DE LLAMAR NOTIFICAR_LOGIN", flush=True)
            # notificar_login(user)
            print("DESPUÉS DE LLAMAR NOTIFICAR_LOGIN", flush=True)
            print("FROM:", settings.DEFAULT_FROM_EMAIL, flush=True)
            print("API KEY:", settings.EMAIL_HOST_PASSWORD, flush=True)
            # Crear o recuperar token
            token, _ = Token.objects.get_or_create(user=user)
            print("el ususario:", user.rol)
            return Response({
                    "message": "Login exitoso",
                "token": token.key,
                "nombre": user.nombre,
                "apellido": user.apellido,
                "email": user.email,
                "telefono": user.telefono,
                "direccion": user.direccion,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                  "is_admin": user.is_admin,
                     "rol": user.rol,


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
            #   notificar_cambio_password(user)
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
     #   enviar_correo_bienvenida(user)

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
@require_http_methods(["PATCH","PUT"])
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





from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail

def enviar_link_recuperacion(usuario):

    uid = urlsafe_base64_encode(force_bytes(usuario.pk))

    token = PasswordResetTokenGenerator().make_token(usuario)

    link = (
    f"{settings.FRONTEND_URL}"
    f"/recuperar-password.html"
    f"?uid={uid}&token={token}"
)

 #   send_mail(
        "Recuperación de contraseña",
        f"Hola {usuario.nombre},\n\n"
        f"Para cambiar tu contraseña entra aquí:\n\n{link}",
        "noreply@tudominio.com",
        [usuario.email],
        fail_silently=False,
    )


from django.core.mail import send_mail
from django.conf import settings


def enviar_correo_recuperacion(usuario, link):

  #  send_mail(
        subject="Recuperación de contraseña",
        message=f"""
Hola {usuario.nombre},

Se ha generado un enlace para restablecer tu contraseña.

Haz clic aquí:

{link}

Si no solicitaste este cambio puedes ignorar este mensaje.
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[usuario.email],
        fail_silently=False,
    )


from rest_framework.permissions import IsAdminUser
from rest_framework.views import APIView
from rest_framework.response import Response

from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

from users.models import Usuariohtp




class EnviarRecuperacionAPIView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):

        try:
            usuario = Usuariohtp.objects.get(id=user_id)

            uid = urlsafe_base64_encode(
                force_bytes(usuario.pk)
            )

            token = PasswordResetTokenGenerator().make_token(
                usuario
            )

            link = (
                f"{settings.FRONTEND_URL}"
                f"/api/reset-password/{uid}/{token}/"
            )

       #     enviar_correo_recuperacion(
                usuario,
                link
            )

            return Response({
                "success": True,
                "message": "Correo enviado"
            })

        except Usuariohtp.DoesNotExist:
            return Response(
                {"error": "Usuario no encontrado"},
                status=404
            )


from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import PasswordResetTokenGenerator

class ValidarTokenAPIView(APIView):

    permission_classes = []

    def post(self, request):

        uid = request.data.get("uid")
        token = request.data.get("token")
        nueva = request.data.get("password")

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = Usuariohtp.objects.get(pk=user_id)

        except:
            return Response(
                {"error": "Link inválido"},
                status=400
            )

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response(
                {"error": "Token inválido o expirado"},
                status=400
            )

        user.set_password(nueva)
        user.save()

        return Response({
            "message": "Contraseña actualizada"
        })



from django.shortcuts import render
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_decode

class ResetPasswordAPIView(APIView):
    permission_classes = []

    def get(self, request, uid, token):

        try:
            print("UID recibido:", uid)

            user_id = urlsafe_base64_decode(uid).decode()
            print("USER ID:", user_id)

            user = Usuariohtp.objects.get(pk=user_id)
            print("USUARIO:", user)

        except Exception as e:
            print("ERROR:", str(e))

            return render(
                request,
                "error.html",
                {"mensaje": f"Enlace inválido: {str(e)}"}
            )

        if not PasswordResetTokenGenerator().check_token(user, token):
            return render(
                request,
                "error.html",
                {"mensaje": "Token inválido o expirado"}
            )

        return render(
            request,
            "recuperar-password.html",
            {
                "uid": uid,
                "token": token
            }
        )
    def post(self, request, uid, token):

        try:

            print("UID:", uid)
            print("TOKEN:", token)

            user_id = urlsafe_base64_decode(uid).decode()
            print("USER_ID:", user_id)

            user = Usuariohtp.objects.get(pk=user_id)
            print("USER:", user)

            password = request.POST.get("password")
            password2 = request.POST.get("password2")

            print("PASSWORD:", password)
            print("PASSWORD2:", password2)

            if password != password2:
                return render(
                    request,
                    "recuperar-password.html",
                    {
                        "uid": uid,
                        "token": token,
                        "mensaje": "Las contraseñas no coinciden"
                    }
                )

            if not PasswordResetTokenGenerator().check_token(user, token):
                return render(
                    request,
                    "error.html",
                    {"mensaje": "Token inválido o expirado"}
                )

            user.set_password(password)
            user.save()

            print("PASSWORD ACTUALIZADA")

            return render(
                request,
                "success.html"
            )

        except Exception as e:

            print("ERROR POST:", str(e))

            return render(
                request,
                "error.html",
                {"mensaje": str(e)}
            )
