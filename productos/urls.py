from django.urls import include, path
from .views import CategoriaListView, ProductoListView

urlpatterns = [
    path('categorias/', CategoriaListView.as_view()),
    path('productos/', ProductoListView.as_view()),
    path('', include('productos.admin_urls')),
]
