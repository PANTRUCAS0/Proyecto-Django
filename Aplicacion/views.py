from django.shortcuts import render
from django import forms
from django.contrib.auth.signals import user_logged_in
from .models import Cliente
from django.contrib import messages
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

class ClienteForm(forms.ModelForm):
    class Meta:
        model = Cliente
        fields = ['Usuario', 'Contraseña', 'Telefono', 'Email']

class LoginForm(forms.Form):
    Usuario = forms.CharField(max_length=15)
    Contraseña = forms.CharField(widget=forms.PasswordInput)

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['Usuario']
            password = form.cleaned_data['Contraseña']

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('Pagina')  # Redirige a la página deseada después del inicio de sesión exitoso
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})

@login_required
def Perfil(request):
    return render (request,"Perfil.html")

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

def Pagina(request):
    return render (request,"Pagina.html")


def Inicio(request):
    return render (request,"Inicio.html")


