from django.shortcuts import render
from django import forms
from .models import Cliente
from django.core.exceptions import ValidationError
import re
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login


class ClienteForm(forms.ModelForm):
    class Meta:
        model = Cliente
        fields = ['Usuario', 'Contraseña', 'Telefono', 'Email']


def Telefono(self):
        telefono = self.cleaned_data.get('Telefono')

        if len(telefono) < 9:
            raise forms.ValidationError("El número de teléfono debe tener al menos 9 dígitos.")
        return telefono

def Email(self):
    email = self.cleaned_data.get('Email')

    patron_caracteres_especiales = re.compile(r'@') 

    if patron_caracteres_especiales.search(email):
            raise ValidationError("El email contiene caracteres especiales no permitidos.")

    return email

    
def Registro(request):
    if request.method == 'POST':
        form = ClienteForm(request.POST)

        if form.is_valid():
            form.save()
    else:
        form = ClienteForm()
    return render(request, 'Registro.html', {'form': form})

def Login(request):
     return render (request,"Login.html")



def Pagina(request):
    return render (request,"Pagina.html")

def DatosPersonales(request):
    return render (request,"DatosPersonales.html")

def Inicio(request):
    return render (request,"Inicio.html")


