from django.shortcuts import render, redirect
from django import forms
from django.contrib.auth.signals import user_logged_in
from .models import Cliente
from django.contrib import messages
from django.contrib.auth.hashers import check_password
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from .models import Producto
from django.views.decorators.csrf import csrf_exempt


class ProductoForm(forms.ModelForm):
    class Meta:
        model = Producto
        fields = ['nombre','precio','url_imagen','descripcion']

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
                return redirect('Pagina')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})

@login_required
def Perfil(request):
    usuario = request.user
    perfil_usuario = Cliente.objects.get(Usuario=usuario.Usuario)
    return render(request, 'perfil.html', {'Perfil_usuario': perfil_usuario})


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
    productos = Producto.objects.all()
    return render (request,"Pagina.html",{'productos': productos})

def Inicio(request):
    return render (request,"Inicio.html")

def Admin(request):
    if 'user' not in request.session or request.session['user']['username'] != 'Admin':
        return redirect('LoginAdmin')

    datos = Cliente.objects.all()  # Supongamos que aquí obtienes los datos de los clientes, no los productos
    Datos = {"DatosT" : datos}

    return render(request, 'Admin.html', Datos)

def AgregarProducto(request):
    if request.method == 'POST':
        producto_form = ProductoForm(request.POST)
        if producto_form.is_valid():
            producto_form.save()
            return redirect('Admin')  # Redirigir a la vista 'Admin' después de guardar el producto
        


    producto_form = ProductoForm()
    context = {'producto_form': producto_form}
    
    return render(request, 'AgregarProducto.html', context)

def mostrar_productos(request):
    productos = Producto.objects.all()
    return render(request, 'Producto.html', {'productos': productos})

@csrf_exempt
def eliminar_producto(request, producto_id):
    if request.method == 'DELETE':
        try:
            producto = Producto.objects.get(id=producto_id)
            producto.delete()
            return JsonResponse({'message': 'Producto eliminado correctamente'})
        except Producto.DoesNotExist:
            return JsonResponse({'error': 'Producto no encontrado'}, status=404)


def login_admin(request):
    if request.method == 'POST':
        username = request.POST.get('Usuario')
        password = request.POST.get('Contraseña')

        print("Username:", username)
        print("Password:", password)

        # Verificar las credenciales estáticas
        if username == 'Admin' and password == '123456':
            # Si las credenciales coinciden, considera el usuario como autenticado
            user = {
                'username': username,
                'password': password
            }
            request.session['user'] = user  # Guardar el usuario en la sesión

            print("Superusuario autenticado")
            return redirect('Admin')

        print("Autenticación fallida")
        messages.error(request, 'Credenciales incorrectas para el superusuario')

    return render(request, 'LoginAdmin.html')

def eliminar_cliente(request, cliente_id):
    cliente = get_object_or_404(Cliente, id=cliente_id)
    cliente.delete()
    return redirect('Admin') 

def actualizar_cliente(request, cliente_id):
    cliente = get_object_or_404(Cliente, id=cliente_id)

    if request.method == 'POST':
        form = ClienteForm(request.POST, instance=cliente)
        if form.is_valid():
            form.save()
            return redirect('Admin')  # Redirecciona al administrador después de guardar los cambios
    else:
        form = ClienteForm(instance=cliente)

    return render(request, 'Actualizar.html', {'form': form})

