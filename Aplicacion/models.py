from django.db import models

class Cliente(models.Model):
    Usuario = models.CharField(max_length=15)
    Contraseña = models.CharField(max_length=10)
    Telefono = models.CharField(max_length=9)
    Email = models.CharField(max_length=20)

