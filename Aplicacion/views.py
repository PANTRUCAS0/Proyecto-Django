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

import openai 
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from django.conf import settings
import json
openai.api_key = settings.OPENAI_API_KEY

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

# --- Chatbot con IA (OpenAI) ---
import json, logging, traceback
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

# SDK OpenAI clásico
from openai import OpenAI
openai.api_key = settings.OPENAI_API_KEY

logger = logging.getLogger(__name__)
# --- Chatbot con selector de proveedor: Gemini / OpenAI / Dummy ---
import json, logging, traceback
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

import requests

logger = logging.getLogger(__name__)

# ====== PROMPT / POLÍTICAS DE TU TIENDA ======
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

# ====== ADAPTADORES DE PROVEEDOR ======

def call_openrouter(prompt: str) -> str:
    api_key = getattr(settings, "OPENROUTER_API_KEY", None)
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY no configurada")

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # OpenRouter recomienda enviar estos dos:
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Zapateria Thomys Chatbot",
    }

    # Intentamos varios modelos (algunos suelen tener free-tier).
    candidate_models = [
        "openrouter/auto",                          # auto-route a un modelo disponible
        "qwen/qwen2.5-7b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3.1-8b-instruct",         # sin :free (a veces disponible)
        "mistralai/mixtral-8x7b-instruct",          # alternativos por si tienes acceso
    ]

    last_err = None
    for model_name in candidate_models:
        data = {
            "model": model_name,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 200,
        }
        try:
            resp = requests.post(url, headers=headers, json=data, timeout=30)
            if resp.status_code != 200:
                last_err = f"{resp.status_code}: {resp.text}"
                # si es 404 (no endpoint), probamos siguiente modelo
                if resp.status_code in (404, 422):  # 422 a veces por modelo no soportado
                    continue
                # otros códigos (401 quota/clave, 429 rate) también provocan fallback abajo
                continue

            j = resp.json()
            content = (
                j.get("choices", [{}])[0]
                 .get("message", {})
                 .get("content", "")
            )
            text = (content or "").strip()
            if text:
                return text
            last_err = "Respuesta vacía"
        except Exception as e:
            last_err = str(e)
            continue

    # Si ninguno funcionó, corta con un error para que tu vista haga fallback a dummy
    raise RuntimeError(f"No hay modelos OpenRouter disponibles. Último error: {last_err}")

def call_gemini(prompt: str) -> str:
    import google.generativeai as genai
    from google.api_core.exceptions import NotFound, PermissionDenied, InvalidArgument

    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY no configurada")

    genai.configure(api_key=settings.GEMINI_API_KEY)

    # Intentamos varios nombres de modelo según disponibilidad de cuenta/región/versión
    candidate_models = [
        "gemini-1.5-flash-latest",  # recomendado (rápido)
        "gemini-1.5-flash",
        "gemini-1.5-pro-latest",
        "gemini-1.0-pro",
        "gemini-pro",               # más antiguo, suele estar habilitado
    ]

    last_err = None
    for model_name in candidate_models:
        try:
            model = genai.GenerativeModel(model_name)
            resp = model.generate_content(prompt)
            text = getattr(resp, "text", "") or ""
            text = text.strip()
            if text:
                return text
        except NotFound as e:
            # Modelo no disponible en tu cuenta/API → probamos el siguiente
            last_err = e
            continue
        except PermissionDenied as e:
            # La API Key no tiene permisos para ese modelo/proyecto
            raise RuntimeError(
                f"No tienes permiso para el modelo '{model_name}'. "
                "Revisa tu clave/proyecto en Google AI Studio."
            ) from e
        except InvalidArgument as e:
            # Petición inválida (por ejemplo, contenido vacío/param inválido)
            raise RuntimeError(f"Petición inválida para '{model_name}': {e}") from e
        except Exception as e:
            # Otro error (red, cuota, etc.) → guarda y prueba siguiente
            last_err = e
            continue

    raise RuntimeError(
        "No hay modelos Gemini disponibles con tu cuenta o versión de API. "
        f"Último error: {last_err}"
    )

def call_openai(prompt: str) -> str:
    # SDK nuevo de OpenAI (>=1.0)
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
    return ("[MODO PRUEBA] Horario Lun–Vie 9–18, Sáb 10–14. "
            "Envíos 2–5 días hábiles. Cambios 10 días con boleta y sin uso.")

@csrf_exempt
def chatbot(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método no permitido"}, status=405)

    # 1) Parseo
    try:
        data = json.loads(request.body.decode("utf-8"))
    except Exception:
        return JsonResponse({"respuesta": "JSON inválido."}, status=400)

    pregunta = (data.get("pregunta") or "").strip()
    if not pregunta:
        return JsonResponse({"respuesta": "¿Cómo puedo ayudarte?"})

    prompt = build_prompt(pregunta)

    # 2) Selector de proveedor
    provider = (settings.AI_PROVIDER or "gemini").lower()
    try:
        if provider == "gemini":
            texto = call_gemini(prompt)
        elif provider == "openai":
            texto = call_openai(prompt)
        elif provider == "openrouter":          # <--- NUEVO
            texto = call_openrouter(prompt)    
        else:
            texto = call_dummy(prompt)

        texto = clean_response(texto)    

        if not texto:
            texto = "Lo siento, no pude generar una respuesta."
        return JsonResponse({"respuesta": texto})

    # 3) Fallback robusto: siempre responde algo
    except Exception as e:
        logger.error("Error en /chatbot con proveedor %s: %s", provider, e)
        logger.error(traceback.format_exc())

        # si falla el proveedor (cuota, auth, etc.), uso dummy para no dejar el chat caído
        texto = call_dummy(prompt)
        return JsonResponse({"respuesta": texto}, status=200)
    

import re

def clean_response(text: str) -> str:
    # Elimina tachados de Markdown
    text = re.sub(r'~~(.*?)~~', r'\1', text)
    return text.strip()

def boleta(request):
    productos = Producto.objects.all()

    # Asignar una cantidad ficticia por ahora
    lista_productos = []
    total = 0
    for p in productos:
        cantidad = 1  # Puedes cambiar esto por una variable real del carrito
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


from .models import Boleta, DetalleBoleta

def guardar_boleta(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        productos = data.get('productos', [])
        total = data.get('total', 0)

        # Crear la boleta principal
        boleta = Boleta.objects.create(total=total)

        # Crear cada detalle de producto
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
