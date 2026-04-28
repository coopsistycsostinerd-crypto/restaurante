from .models import Bitacora
from .middleware import get_current_request

def obtener_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0]
    return request.META.get('REMOTE_ADDR')


def registrar_automatico(instancia, accion):
    request = get_current_request()

    usuario = None
    ip = None

    if request:
        if request.user.is_authenticated:
            usuario = request.user
        ip = obtener_ip(request)

    Bitacora.objects.create(
        usuario=usuario,
        accion=accion,
        modulo=instancia.__class__.__name__.upper(),
        descripcion=f"{accion} en {str(instancia)}",
        modelo=instancia.__class__.__name__,
        objeto_id=instancia.pk,
        ip=ip
    )