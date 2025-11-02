"""
URL configuration for ProyectoEva project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from Aplicacion import views
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('Registro/', views.Registro, name='Registro'),  
    
    path('Login/', views.login_view, name='Login'),  
    path('logout/', views.logout_view, name='logout'),

    path('carrito/', views.carrito, name='carrito'),

    path('', views.Pagina, name='Pagina'),  
    path('Perfil/', views.Perfil, name='Perfil'),

    path('Admin/', views.Admin, name='Admin'),
    path('admin/', views.Admin, name='admin'),
    path('LoginAdmin/', views.login_admin, name='LoginAdmin'),  

    path('ActulizarCL/<int:cliente_id>/', views.actualizar_cliente, name='ActulizarCL'),
    path('eliminar/<int:id>/', views.eliminar_cliente, name='EliminarCL'),
    
    path('AgregarProducto/', views.AgregarProducto, name='AgregarProducto'),
    path('Producto/', views.mostrar_productos, name='mostrarProductos'),

    path('eliminar-producto/<int:producto_id>/', views.eliminar_producto, name='eliminar_producto'),
    path('actualizar_producto/<int:producto_id>/', views.actualizar_producto, name='actualizar_producto'),

    path("chatbot/", views.chatbot, name="chatbot"),

    path('boleta/', views.boleta, name='boleta'),
    path('guardar_boleta/', views.guardar_boleta, name='guardar_boleta'),

    path('detalle_ordenes/', views.detalle_ordenes, name='detalle_ordenes'),

    path('exportar_excel/', views.exportar_excel, name='exportar_excel'),

    # Checkout y pagos
    path('checkout/', views.checkout, name='checkout'),
    path('procesar-pago/', views.procesar_pago, name='procesar_pago'),
    path('confirmacion/<int:orden_id>/', views.confirmacion_orden, name='confirmacion_orden'),
    
    # Órdenes del usuario
    path('mis-ordenes/', views.mis_ordenes, name='mis_ordenes'),
    path('orden/<int:orden_id>/', views.detalle_orden, name='detalle_orden'),

    path('api/ordenes/', views.exportar_datos_json, name='api_ordenes'),
]


