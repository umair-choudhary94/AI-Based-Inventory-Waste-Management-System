from django.contrib import admin

# Register your models here.
from .models import *
from django.contrib import admin
from .models import Inventory, Recipe, RecipeIngredient, OrderLog

class InventoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'quantity', 'unit', 'min_threshold', 'expiry_date')

class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name',)

class RecipeIngredientAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'inventory_item', 'quantity_required')

class OrderLogAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'timestamp', 'quantity_made')

admin.site.register(Inventory, InventoryAdmin)
admin.site.register(Recipe, RecipeAdmin)
admin.site.register(RecipeIngredient, RecipeIngredientAdmin)
admin.site.register(OrderLog, OrderLogAdmin)
admin.site.register(InventoryNotification)
admin.site.register(Supplier)