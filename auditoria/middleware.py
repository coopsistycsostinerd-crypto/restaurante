from threading import local

_user = local()

def get_current_request():
    return getattr(_user, 'request', None)

class AuditoriaMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _user.request = request
        response = self.get_response(request)
        return response