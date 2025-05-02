from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from django.core.mail import send_mail


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
            print(f"Low Inventory Alert: The stock for '{self.name}' is below the threshold. Quantity: {self.quantity}{self.unit}.")

        if self.expiry_date and self.expiry_date <= timezone.now().date():
            print(f"Expired Inventory Alert: The item '{self.name}' has expired on {self.expiry_date}. Please take action.")


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


# Order Log
class OrderLog(models.Model):
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
    
