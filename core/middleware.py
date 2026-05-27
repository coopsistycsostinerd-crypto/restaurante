from django.shortcuts import redirect

from core.utils.licencia import licencia_valida


class LicenciaMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        rutas_permitidas = [
            "/bloqueado/"
        ]

        if (
            not licencia_valida()
            and request.path not in rutas_permitidas
        ):
            return redirect("/bloqueado/")

        return self.get_response(request)