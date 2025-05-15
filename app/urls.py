
from django.urls import path
from . import views
urlpatterns = [
    
    path('',views.index,name='home'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('inventory/', views.inventory, name='inventory'),
    path('orders/', views.orders, name='orders'),
    path('recipes/', views.recipes, name='recipes'),
    path('create/order/', views.create_order, name='create_order'),
    path('add/recipe/', views.add_recipe, name='add_recipe'),
    path('suppliers/', views.suppliers, name='suppliers'),
    path('add/supplier/', views.add_supplier, name='add_supplier'),
    path('ai/', views.ai, name='ai'),
    path('ai_fetch/', views.ai_fetch, name='ai_fetch'),
]

