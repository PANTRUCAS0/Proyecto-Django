from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


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
    total = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        default=0,
        validators=[MaxValueValidator(5000000)]  # Límite $5M
    )

    def __str__(self):
        return f"Boleta #{self.id_boleta} - {self.fecha_creacion.strftime('%d/%m/%Y %H:%M')}"


class DetalleBoleta(models.Model):
    boleta = models.ForeignKey(Boleta, related_name="detalles", on_delete=models.CASCADE)
    nombre = models.CharField(max_length=30)
    descripcion = models.CharField(max_length=100)
    precio = models.DecimalField(max_digits=10, decimal_places=0)
    cantidad = models.IntegerField(default=1)
    subtotal = models.DecimalField(max_digits=12, decimal_places=0)
    url_imagen = models.URLField(default='https://ejemplo.com/imagen_por_defecto.jpg', max_length=400)

    def __str__(self):
        return f"{self.nombre} x{self.cantidad}"

# models.py - AGREGAR AL FINAL

class Orden(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('PAGADO', 'Pagado'),
        ('ENVIADO', 'Enviado'),
        ('ENTREGADO', 'Entregado'),
        ('CANCELADO', 'Cancelado'),
    ]
    
    METODO_PAGO_CHOICES = [
        ('TRANSFERENCIA', 'Transferencia Bancaria'),
        ('WEBPAY', 'WebPay'),
        ('EFECTIVO', 'Efectivo en tienda'),
    ]
    
    numero_orden = models.CharField(max_length=20, unique=True, editable=False)
    cliente = models.ForeignKey('Cliente', on_delete=models.CASCADE, related_name='ordenes', null=True, blank=True)
     # Datos de contacto
    email = models.EmailField(max_length=100)
    telefono = models.CharField(max_length=15)
    
    # Dirección de envío
    direccion = models.CharField(max_length=200)
    ciudad = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    codigo_postal = models.CharField(max_length=10, blank=True, null=True)
    
    # Información de pago
    metodo_pago = models.CharField(max_length=20, choices=METODO_PAGO_CHOICES, default='TRANSFERENCIA')
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='PENDIENTE')
    
    # Montos (CAMBIADO A DECIMAL)
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        validators=[MaxValueValidator(5000000)]
    )
    costo_envio = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    total = models.DecimalField(
        max_digits=12,
        decimal_places=0,
        validators=[MaxValueValidator(5000000)]  # Límite $5M
    )
    
    # Fechas
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    # Notas adicionales
    notas = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-fecha_creacion']
        verbose_name = 'Orden'
        verbose_name_plural = 'Órdenes'
    
    def __str__(self):
        return f"Orden {self.numero_orden} - {self.email}"
    
    def save(self, *args, **kwargs):
        if not self.numero_orden:
            from django.utils import timezone
            fecha = timezone.now().strftime('%Y%m%d')
            ultimo = Orden.objects.filter(numero_orden__startswith=f'ORD-{fecha}').count()
            self.numero_orden = f'ORD-{fecha}-{str(ultimo + 1).zfill(4)}'
        super().save(*args, **kwargs)


class ItemOrden(models.Model):
    orden = models.ForeignKey(Orden, related_name='items', on_delete=models.CASCADE)
    producto_nombre = models.CharField(max_length=100)
    producto_descripcion = models.CharField(max_length=200, blank=True)
    producto_imagen = models.URLField(max_length=400)
    talla = models.CharField(max_length=10, blank=True, null=True)
    marca = models.CharField(max_length=50, blank=True, null=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=0)
    cantidad = models.IntegerField(default=1)
    subtotal = models.DecimalField(max_digits=12, decimal_places=0)
    
    def __str__(self):
        return f"{self.producto_nombre} x{self.cantidad} - Orden {self.orden.numero_orden}"
    
    def save(self, *args, **kwargs):
        self.subtotal = self.precio_unitario * self.cantidad
        super().save(*args, **kwargs)