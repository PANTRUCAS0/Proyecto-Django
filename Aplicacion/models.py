from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone



class ClienteManager(BaseUserManager):
    def create_user(self, Usuario, Contraseña=None, **extra_fields):
        if not Usuario:
            raise ValueError('El campo Usuario es obligatorio')

        user = self.model(
            Usuario=Usuario,
            **extra_fields
        )
        user.set_password(Contraseña)  # Usar Contraseña en lugar de password
        user.save(using=self._db)
        return user

    def create_superuser(self, Usuario, Contraseña=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')

        return self.create_user(Usuario, Contraseña, **extra_fields)
    
class Cliente(AbstractBaseUser):
    Usuario = models.CharField(max_length=30, unique=True)
    Contraseña = models.CharField(max_length=10)  # Manteniendo el nombre Contraseña
    Telefono = models.CharField(max_length=9)
    Email = models.CharField(max_length=30)
    last_login = models.DateTimeField(auto_now=True)

    objects = ClienteManager()

    USERNAME_FIELD = 'Usuario'

    def __str__(self):
        return self.Usuario

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):

        return self.is_superuser

url_por_defecto = 'https://ejemplo.com/imagen_por_defecto.jpg'

class Producto(models.Model):
    nombre = models.CharField(max_length=30)
    precio = models.IntegerField()
    url_imagen = models.URLField(default=url_por_defecto, max_length=400)
    descripcion = models.CharField(max_length=100)
    # Nuevos campos 
    talla = models.CharField(max_length=10, blank=True, null=True)
    marca = models.CharField(max_length=50, blank=True, null=True)
    

    def __str__(self):
        return f"{self.nombre} ({self.marca or 'Sin marca'})"


url_por_defecto = 'https://ejemplo.com/imagen_por_defecto.jpg'


class Boleta(models.Model):
    id_boleta = models.AutoField(primary_key=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    total = models.IntegerField(default=0)

    def __str__(self):
        return f"Boleta #{self.id_boleta} - {self.fecha_creacion.strftime('%d/%m/%Y %H:%M')}"


class DetalleBoleta(models.Model):
    boleta = models.ForeignKey(Boleta, related_name="detalles", on_delete=models.CASCADE)
    nombre = models.CharField(max_length=30)
    descripcion = models.CharField(max_length=100)
    precio = models.IntegerField()
    cantidad = models.IntegerField(default=1)
    subtotal = models.IntegerField()
    url_imagen = models.URLField(default=url_por_defecto, max_length=400)

    def __str__(self):
        return f"{self.nombre} x{self.cantidad}"