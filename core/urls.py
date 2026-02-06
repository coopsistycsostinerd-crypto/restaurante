from django.urls import path
from .views import EmpresaConfigAPIView, admin_dashboard, home

urlpatterns = [
    path('', home, name='home'),
     path("config/empresa/", EmpresaConfigAPIView.as_view()),
        path("dashboard/", admin_dashboard, name="admin_dashboard"),
]
