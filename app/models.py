from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from django.core.mail import send_mail

class Supplier(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=50)
    state = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)

    def __str__(self):
        return self.name


# Inventory Model
class Inventory(models.Model):
    name = models.CharField(max_length=100)
    quantity = models.FloatField()
    unit = models.CharField(max_length=20, default='kg')
    min_threshold = models.FloatField()
    expiry_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.quantity}{self.unit}"

    def check_and_notify(self):
        if self.quantity < self.min_threshold:
            message = f"Low Inventory Alert: The stock for '{self.name}' is below the threshold. Quantity: {self.quantity}{self.unit}."
            print(message)
            InventoryNotification.objects.create(
                inventory_item=self,
                notification_type='low_quantity',
                message=message
            )

        if self.expiry_date and self.expiry_date <= timezone.now().date():
            message = f"Expired Inventory Alert: The item '{self.name}' has expired on {self.expiry_date}. Please take action."
            print(message)
            InventoryNotification.objects.create(
                inventory_item=self,
                notification_type='expired',
                message=message
            )
class InventoryNotification(models.Model):
    NOTIFICATION_TYPES = (
        ('low_quantity', 'Low Quantity'),
        ('expired', 'Expired'),
    )

    inventory_item = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.inventory_item.name} - {self.get_notification_type_display()} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


# Recipe Model
class Recipe(models.Model):
    name = models.CharField(max_length=100)


    def __str__(self):
        return self.name

    

   


# Ingredients Required per Recipe
class RecipeIngredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    inventory_item = models.ForeignKey(Inventory, on_delete=models.CASCADE)
    quantity_required = models.FloatField()

    def __str__(self):
        return f"{self.recipe.name} needs {self.quantity_required}{self.inventory_item.unit} of {self.inventory_item.name}"
class RecipePrice(models.Model):
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, related_name='price')
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.recipe.name} - ${self.price}"

class Order(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Order #{self.id} at {self.timestamp}"

# Order Log
class OrderLog(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE, null=True)
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=timezone.now)
    quantity_made = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.recipe.name} x{self.quantity_made} at {self.timestamp}"
    def save(self, *args, **kwargs):
        is_new = self.pk is None  # check if it's a new order
        super().save(*args, **kwargs)
        if is_new:
            self.reduce_inventory()
    def reduce_inventory(self):
        for ingredient in self.recipe.ingredients.all():
            total_required = ingredient.quantity_required * self.quantity_made
            inventory_item = ingredient.inventory_item
            inventory_item.quantity -= total_required
            inventory_item.save()
            inventory_item.check_and_notify()


    
