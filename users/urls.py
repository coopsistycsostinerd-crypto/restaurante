# users/urls.py
from django.urls import path
from .views import AdminListaUsuariosAPIView, CambiarPasswordAPIView, LoginAPIView, LogoutAPIView, PerfilUsuarioAPIView

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
        path("logout/", LogoutAPIView.as_view()),
           path("panel-admin/clientes/", AdminListaUsuariosAPIView.as_view()),
               path("perfil/", PerfilUsuarioAPIView.as_view(), name="perfil-usuario"),
                  path("cambiar-password/", CambiarPasswordAPIView.as_view()),
]
