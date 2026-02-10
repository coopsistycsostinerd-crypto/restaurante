# users/urls.py
from django.urls import path
from .views import AdminCrearUsuarioAPIView, AdminListaUsuariosAPIView, CambiarPasswordAPIView, LoginAPIView, LogoutAPIView, PerfilUsuarioAPIView, editar_usuario, registro_cliente

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
        path("logout/", LogoutAPIView.as_view()),
           path("panel-admin/clientes/", AdminListaUsuariosAPIView.as_view()),
               path("perfil/", PerfilUsuarioAPIView.as_view(), name="perfil-usuario"),
                  path("cambiar-password/", CambiarPasswordAPIView.as_view()),
                      path("registro/cliente/", registro_cliente, name="registro_cliente"),
    path("admin/usuarios/crear/", AdminCrearUsuarioAPIView.as_view(), name="admin-crear-usuario"),
        path("panel-admin/usuarios/<int:user_id>/", editar_usuario, name="editar_usuario"),


]
