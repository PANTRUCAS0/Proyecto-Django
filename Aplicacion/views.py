from django.shortcuts import render, redirect, get_object_or_404
from django import forms
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from .models import Cliente, Producto, Boleta, DetalleBoleta

import json
import re
import logging
import traceback
import requests
from openpyxl import Workbook
import openai

# Configuración API
openai.api_key = settings.OPENAI_API_KEY
logger = logging.getLogger(__name__)

# ===============================
# Formularios
# ===============================
class ProductoForm(forms.ModelForm):
    class Meta:
        model = Producto
        fields = ['nombre', 'precio', 'url_imagen', 'descripcion']


class ClienteForm(forms.ModelForm):
    class Meta:
        model = Cliente
        fields = ['Usuario', 'Contraseña', 'Telefono', 'Email']


class LoginForm(forms.Form):
    Usuario = forms.CharField(max_length=15)
    Contraseña = forms.CharField(widget=forms.PasswordInput)

# ===============================
# Funciones de Validación
# ===============================
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

# ===============================
# Autenticación y Vistas Principales
# ===============================
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

def Registro(request):
    if request.method == 'POST':
        form = ClienteForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Registro exitoso. ¡Bienvenido a la tienda virtual!')
        else:
            messages.error(request, 'Error: Por favor complete correctamente todos los campos.')
    else:
        form = ClienteForm()
    return render(request, 'Registro.html', {'form': form})

def Pagina(request):
    productos = Producto.objects.all()
    return render(request, "Pagina.html", {'productos': productos})


def Inicio(request):
    return render(request, "Inicio.html")


def Admin(request):
    if 'user' not in request.session or request.session['user']['username'] != 'Admin':
        return redirect('LoginAdmin')

    datos = Cliente.objects.all()
    return render(request, 'Admin.html', {"DatosT": datos})

# ===============================
# Productos
# ===============================
def AgregarProducto(request):
    if request.method == 'POST':
        producto_form = ProductoForm(request.POST)
        if producto_form.is_valid():
            producto_form.save()
            return redirect('Admin')

    producto_form = ProductoForm()
    return render(request, 'AgregarProducto.html', {'producto_form': producto_form})


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


@csrf_exempt
def actualizar_producto(request, producto_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            producto = Producto.objects.get(id=producto_id)
            producto.nombre = data.get('nombre', producto.nombre)
            producto.descripcion = data.get('descripcion', producto.descripcion)
            producto.precio = data.get('precio', producto.precio)
            producto.url_imagen = data.get('url_imagen', producto.url_imagen)
            producto.save()
            return JsonResponse({'success': True})
        except Producto.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Producto no encontrado'})
    return JsonResponse({'success': False, 'error': 'Método no permitido'})

# ===============================
# Login Admin
# ===============================
def login_admin(request):
    if request.method == 'POST':
        username = request.POST.get('Usuario')
        password = request.POST.get('Contraseña')

        if username == 'Admin' and password == '123456':
            user = {'username': username, 'password': password}
            request.session['user'] = user
            return redirect('Admin')

        messages.error(request, 'Credenciales incorrectas para el superusuario')

    return render(request, 'LoginAdmin.html')

# ===============================
# Clientes
# ===============================
@csrf_exempt  # O puedes enviar el token CSRF desde fetch
def eliminar_cliente(request, id):
    if request.method == 'POST':
        try:
            Cliente.objects.get(id=id).delete()
            return JsonResponse({'status': 'ok'})
        except Cliente.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Cliente no encontrado'}, status=404)
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)

def actualizar_cliente(request, cliente_id):
    cliente = get_object_or_404(Cliente, id=cliente_id)
    if request.method == 'POST':
        form = ClienteForm(request.POST, instance=cliente)
        if form.is_valid():
            form.save()
            return redirect('Admin')
    else:
        form = ClienteForm(instance=cliente)
    return render(request, 'Actualizar.html', {'form': form})

# ===============================
# Chatbot
# ===============================
INFO_TIENDA = (
    "Horario: Lun–Vie 9:00–18:00; Sáb 10:00–14:00.\n"
    "Envíos: a todo Chile, 2–5 días hábiles.\n"
    "Cambios/Devoluciones: 10 días con boleta y sin uso.\n"
    "Tallas: 36 a 45.\n"
    "Métodos de pago: tarjetas y transferencias.\n"
)

def build_prompt(pregunta: str) -> str:
    return (
        "Eres el asistente de Zapatería Thomys. Usa SOLO la información provista abajo.\n"
        "⚠️ Responde en TEXTO PLANO, sin Markdown, sin tachados, sin símbolos especiales pero si puedes usar emojis amigables y que tengan que ver con la respuesta.\n"
        "Si la pregunta es ajena a la zapatería, responde exactamente: "
        "\"Lo siento, solo puedo ayudarte con dudas sobre la zapatería\".\n\n"
        f"INFO:\n{INFO_TIENDA}\n\nPREGUNTA:\n{pregunta}\n"
    )

def call_openrouter(prompt: str) -> str:
    api_key = getattr(settings, "OPENROUTER_API_KEY", None)
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY no configurada")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Zapateria Thomys Chatbot",
    }

    models = [
        "openrouter/auto",
        "qwen/qwen2.5-7b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3.1-8b-instruct",
        "mistralai/mixtral-8x7b-instruct",
    ]

    for model in models:
        data = {"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2, "max_tokens": 200}
        try:
            resp = requests.post(url, headers=headers, json=data, timeout=30)
            if resp.status_code == 200:
                content = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")
                if content.strip():
                    return content.strip()
        except Exception:
            continue

    raise RuntimeError("No hay modelos OpenRouter disponibles.")


def call_gemini(prompt: str) -> str:
    import google.generativeai as genai
    from google.api_core.exceptions import NotFound, PermissionDenied, InvalidArgument

    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY no configurada")

    genai.configure(api_key=settings.GEMINI_API_KEY)

    models = [
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash",
        "gemini-1.5-pro-latest",
        "gemini-1.0-pro",
        "gemini-pro",
    ]

    for model in models:
        try:
            resp = genai.GenerativeModel(model).generate_content(prompt)
            text = getattr(resp, "text", "") or ""
            if text.strip():
                return text.strip()
        except (NotFound, PermissionDenied, InvalidArgument):
            continue

    raise RuntimeError("No hay modelos Gemini disponibles.")


def call_openai(prompt: str) -> str:
    from openai import OpenAI
    if not settings.OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY no configurada")
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    r = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=180
    )
    return (r.choices[0].message.content or "").strip()


def call_dummy(prompt: str) -> str:
    return "[MODO PRUEBA] Horario Lun–Vie 9–18, Sáb 10–14. Envíos 2–5 días hábiles. Cambios 10 días con boleta y sin uso."


def clean_response(text: str) -> str:
    text = re.sub(r'~~(.*?)~~', r'\1', text)
    return text.strip()


@csrf_exempt
def chatbot(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"respuesta": "JSON inválido."}, status=400)

    pregunta = (data.get("pregunta") or "").strip()
    if not pregunta:
        return JsonResponse({"respuesta": "¿Cómo puedo ayudarte?"})

    prompt = build_prompt(pregunta)
    provider = (settings.AI_PROVIDER or "gemini").lower()

    try:
        if provider == "gemini":
            texto = call_gemini(prompt)
        elif provider == "openai":
            texto = call_openai(prompt)
        elif provider == "openrouter":
            texto = call_openrouter(prompt)
        else:
            texto = call_dummy(prompt)

        texto = clean_response(texto)
        return JsonResponse({"respuesta": texto or "Lo siento, no pude generar una respuesta."})

    except Exception as e:
        logger.error("Error en chatbot con proveedor %s: %s", provider, e)
        logger.error(traceback.format_exc())
        texto = call_dummy(prompt)
        return JsonResponse({"respuesta": texto}, status=200)

# ===============================
# Boletas
# ===============================
def boleta(request):
    productos = Producto.objects.all()
    lista_productos = []
    total = 0

    for p in productos:
        cantidad = 1
        subtotal = p.precio * cantidad
        total += subtotal
        lista_productos.append({
            'nombre': p.nombre,
            'descripcion': p.descripcion,
            'precio': p.precio,
            'cantidad': cantidad,
            'subtotal': subtotal,
            'url_imagen': p.url_imagen,
        })

    return render(request, 'boleta.html', {'productos': lista_productos, 'total': total})


def guardar_boleta(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        productos = data.get('productos', [])
        total = data.get('total', 0)

        boleta = Boleta.objects.create(total=total)

        for p in productos:
            DetalleBoleta.objects.create(
                boleta=boleta,
                nombre=p['nombre'],
                descripcion=p['descripcion'],
                precio=p['precio'],
                cantidad=p['cantidad'],
                subtotal=p['subtotal'],
                url_imagen=p['url_imagen']
            )

        return JsonResponse({'status': 'ok', 'boleta_id': boleta.id_boleta})

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


def detalle_boleta(request):
    detalles = DetalleBoleta.objects.select_related('boleta').order_by('id')
    return render(request, 'detalle_boleta.html', {'detalles': detalles})


def exportar_excel(request):
    wb = Workbook()
    ws = wb.active
    ws.title = "Detalles de Boletas"

    ws.append(["ID", "Nombre", "Descripción", "Precio", "Cantidad", "Subtotal", "ID Boleta", "Fecha Boleta"])

    detalles = DetalleBoleta.objects.select_related('boleta').all()
    for d in detalles:
        ws.append([
            d.id,
            d.nombre,
            d.descripcion,
            d.precio,
            d.cantidad,
            d.subtotal,
            d.boleta.id_boleta if d.boleta else "",
            d.boleta.fecha_creacion.strftime("%d/%m/%Y") if d.boleta else "",
        ])

    response = HttpResponse(
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response['Content-Disposition'] = 'attachment; filename="detalle_boletas.xlsx"'
    wb.save(response)
    return response

def graficos_boletas(request):
    detalles = DetalleBoleta.objects.select_related('boleta').all()
    detalles_json = json.dumps([
        {
            'nombre': d.nombre,
            'cantidad': d.cantidad,
            'subtotal': float(d.subtotal),
            'boleta_id': d.boleta.id_boleta,
        } for d in detalles
    ])
    return render(request, 'graficos_boletas.html', {
        'detalles_json': detalles_json
    })