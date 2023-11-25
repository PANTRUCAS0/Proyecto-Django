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
    path('Inicio/', views.Inicio, name='Inicio'),  
    path('Registro/', views.Registro, name='Registro'),  
    
    path('Login/', views.login_view, name='Login'),  
    path('logout/', auth_views.LogoutView.as_view(next_page='/Pagina'), name='logout'),

    path('Pagina/', views.Pagina, name='Pagina'),  
    path('Perfil/', views.Perfil, name='Perfil'),

    path('Admin', views.Admin, name='Admin'),
    path('LoginAdmin', views.login_admin, name='LoginAdmin'),  

    
    path('ActulizarCL/<int:cliente_id>/', views.actualizar_cliente, name='ActulizarCL'),
    path('EliminarCL/<int:cliente_id>/', views.eliminar_cliente, name='EliminarCL')

]
