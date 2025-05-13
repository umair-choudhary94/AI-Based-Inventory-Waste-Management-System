from django.shortcuts import render
from . models import *
from datetime import date, timedelta
from django.http import JsonResponse
import json

# Create your views here.
def index(request):
    
    inventory_notifications = InventoryNotification.objects.all()

    context = {
        'inventory_notifications': inventory_notifications
    }
    return render(request,'dashboard.html', context)

    
    
def dashboard(request):
    inventory_notifications = InventoryNotification.objects.all()
    low_quantity_notifications_count = InventoryNotification.objects.filter(notification_type='low_quantity').count()
    expired_notifications_count = InventoryNotification.objects.filter(notification_type='expired').count()
    total_recipes = Recipe.objects.all().count()
    total_inventory = Inventory.objects.all().count()
    inventory = Inventory.objects.all()
    inventory_data = [
        {
            'id': item.id,
            'name': item.name,
            'quantity': item.quantity,
            'unit': item.unit,
            'min_threshold': item.min_threshold,
            'expiry_date': item.expiry_date.strftime('%Y-%m-%d') if item.expiry_date else None,
        }
        for item in inventory
    ]

    
    context = {
        'inventory_notifications': inventory_notifications,
        'low_quantity_notifications_count' : low_quantity_notifications_count,
        'expired_notifications_count' : expired_notifications_count,
        'total_recipes' : total_recipes,
        'total_inventory' : total_inventory,
        'inventory' : inventory,
        'inventory_data_json': json.dumps(inventory_data),
    }
    return render(request,'dashboard.html', context)

    
def inventory(request):
    inventory_items = Inventory.objects.all()
    context = {
        'inventory_items': inventory_items,
        'today': date.today()
    }
    return render(request, 'inventory.html', context)
    
def orders(request):
    orders = OrderLog.objects.all()
    context = {
        'orders': orders
    }
    return render(request, 'Orders.html', context)
    
def recipes(request):
    recipes = Recipe.objects.all()
    context = {
        'recipes': recipes
    }
    return render(request, 'Recipes.html', context)
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        order_items = data.get('order_items', [])
        order = Order.objects.create()
        
        for item in order_items:
            recipe_id = item.get('recipe_id')
            quantity = item.get('quantity')
            recipe = Recipe.objects.get(id=recipe_id)
            OrderLog.objects.create(order=order, recipe=recipe, quantity_made=quantity)
        return JsonResponse({'message': 'success'})
    recipes = Recipe.objects.all()
    context = {
        'recipes': recipes
    }
    return render(request, 'create-order.html', context)

def add_recipe(request):
    return render(request, 'add-recipe.html')






