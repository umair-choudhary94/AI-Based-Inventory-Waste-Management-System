from django.shortcuts import render
from . models import *
from datetime import date, timedelta
# Create your views here.
def index(request):
    
 
    return render(request,'index.html')