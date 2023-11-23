from django.contrib.auth.backends import BaseBackend
from .models import Cliente

class ClienteBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None):
        try:
            user = Cliente.objects.get(Usuario=username)

            
            if user.Contraseña == password:
                return user
        except Cliente.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return Cliente.objects.get(pk=user_id)
        except Cliente.DoesNotExist:
            return None