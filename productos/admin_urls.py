from rest_framework.routers import DefaultRouter
from .views import AdminProductoViewSet

router = DefaultRouter()
router.register(r'panel-admin/productos', AdminProductoViewSet, basename='admin-productos')

urlpatterns = router.urls
