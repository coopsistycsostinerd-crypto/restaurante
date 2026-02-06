from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone

# -------------------------------
# Manager de usuario
# -------------------------------
class UsuarioManager(BaseUserManager):
    def create_user(self, email, username, nombre, apellido, password=None):
        if not email:
            raise ValueError("El usuario debe tener un correo electrónico")
        user = self.model(
            email=self.normalize_email(email),
            username=username,
            nombre=nombre,
            apellido=apellido,
            is_active=True
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, username, nombre, apellido, password):
        user = self.create_user(email, username, nombre, apellido, password)
        user.is_admin = True          # Para que sea staff
        user.is_superuser = True      # Permisos totales
        user.is_active = True
        user.save()
        return user



# -------------------------------
# Modelo de usuario
# -------------------------------
from django.contrib.auth.models import PermissionsMixin

class Usuariohtp(AbstractBaseUser, PermissionsMixin):
    identificacion = models.CharField(max_length=13, unique=True, null=True, blank=True)
    nombre = models.CharField(max_length=200)
    apellido = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100, unique=True)
    telefono = models.CharField(max_length=12, blank=True, null=True)
    direccion = models.CharField(max_length=256, blank=True, null=True)
    imagen = models.ImageField(upload_to="perfil/", default="perfil/avatar.png")

    # Flags de permisos
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    ROLES = (
        ("cliente", "Cliente"),
        ("empleado", "Empleado"),
        ("supervisor", "Supervisor"),
        ("admin", "Administrador"),
         ("superuser", "Superuser"),
    )

    rol = models.CharField(max_length=20, choices=ROLES, default="cliente")
    objects = UsuarioManager()

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email", "nombre", "apellido"]

    def __str__(self):
        return f"{self.nombre} {self.apellido}"

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin
