from django.shortcuts import render,redirect
from . models import *
from datetime import date, timedelta,datetime
from django.http import JsonResponse
import json
from google import genai
from django.contrib.auth import authenticate, login,logout
from django.contrib import messages


# Create your views here.
def index(request):
    
    return redirect('dashboard')

    
    


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
    if request.method == 'POST':
        recipe_name = request.POST.get('recipe_name')
        ingredients = zip(request.POST.getlist('ingredient_item[]'), request.POST.getlist('ingredient_quantity[]'))
        recipe = Recipe.objects.create(name=recipe_name)
        for item_id, quantity in ingredients:
            item = Inventory.objects.get(id=item_id)
            RecipeIngredient.objects.create(recipe=recipe, inventory_item=item, quantity_required=quantity)
        return redirect('recipes')
    inventory_items = Inventory.objects.all()
    context = {
        'inventory_items': inventory_items
    }
    return render(request, 'add-recipe.html',context)

def suppliers(request):
    suppliers = Supplier.objects.all()
    context = {
        'suppliers': suppliers
    }
    return render(request, 'suppliers.html', context)
def add_supplier(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone_number = request.POST.get('phone_number')
        address = request.POST.get('address')
        city = request.POST.get('city')
        state = request.POST.get('state')
        country = request.POST.get('country')
        zip_code = request.POST.get('zip_code')
        
        Supplier.objects.create(
            name=name,
            email=email,
            phone_number=phone_number,
            address=address,
            city=city,
            state=state,
            country=country,
            zip_code=zip_code
        )
        return redirect('suppliers')
    

    return render(request, 'add_supplier.html')

def ai(request):
    return render(request, 'ai.html')


def ai_fetch(request):
    inventory = Inventory.objects.all()
    orders = Order.objects.all()
    orders_data = [
        {
            'id': order.id,
            'timestamp': order.timestamp.strftime('%Y-%m-%d %H:%M'),
            'order_logs': [
                {
                    'id': log.id,
                    'recipe': log.recipe.name,
                    'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M'),
                    'quantity_made': log.quantity_made,
                }
                for log in order.items.all()
            ],
        }
        for order in orders
    ]

    orders_json_str = json.dumps(orders_data)
    print(orders_json_str)
    # Prepare inventory data as a JSON string (or as plain text if you prefer)
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

    inventory_json_str = json.dumps(inventory_data)

    # Initialize Gemini API client
    client = genai.Client(api_key='AIzaSyBwYTZfrC5oe5W7GB0eO03Xwrqkunuz-u0')
    today_date = datetime.now().strftime('%Y-%m-%d')
    # Create a prompt including your inventory data
    prompt = (
    f"Today Date : {today_date}\n\n"
    'Brand Name UTTU'
    "Present Data in table . Present data highlights as well . Response Should Start with Hi Chef. Use Different colors to highlight"
    "You are an AI assistant specialized in inventory and waste management for restaurants. You take everything serious and your are also strict. We all work together. "
    "Given the following current inventory data, analyze the stock levels, expiry dates, and quantities. "
    "Based on best practices in AI-powered inventory systems, provide clear, prioritized, and practical recommendations "
    "to reduce food waste, prevent ingredient spoilage, and optimize stock usage. "
    "Focus on actionable quick steps the restaurant staff or managers can implement immediately. "
    "Consider issues such as over-ordering, expiry tracking, slow-moving items, and supplier coordination. \n\n"
    "Inventory Data:\n"
    f"{inventory_json_str}\n\n"
    "Orders Data:\n"
    f"{orders_json_str}\n\n"
    "5 line Summarize your recommendations in a numbered list."
)


    # Call Gemini AI model
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    # The AI generated response text
    ai_summary = response.text
    print(ai_summary)
    data = {
        'ai_text': ai_summary
    }
    return JsonResponse(data)


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember-me', False)

        # Assuming there's a function to authenticate users
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            if remember_me:
                # Set session to remember user for a longer period
                request.session.set_expiry(1209600)  # 2 weeks
            else:
                # Set session to expire at browser close
                request.session.set_expiry(0)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password.')
            return render(request, 'login.html')
        pass
    return render(request, 'login.html')


def logout_view(request):
    logout(request)
    return redirect('login_view')














