from django.urls import path
from .views import EmpresaConfigAPIView, EmpresaPublicAPIView, admin_dashboard, admin_mensajes_contacto, enviar_mensaje_contacto, experiencias,   home, marcar_contacto_leido
from core import views

urlpatterns = [
    path('', home, name='home'),
 

path("config/empresa/", EmpresaConfigAPIView.as_view()),          # ADMIN
path("public/config/empresa/", EmpresaPublicAPIView.as_view()),  # PÚBLICO


        path("dashboard/", admin_dashboard, name="admin_dashboard"),
           path("contacto/", enviar_mensaje_contacto, name="contacto"),
           path("panel_admin/contacto/", admin_mensajes_contacto),
path(
  "panel_admin/contacto/<int:pk>/leido/",
  marcar_contacto_leido,
  name="marcar_contacto_leido"
),
    path('experiencias/', experiencias, name='experiencias'),


]
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
