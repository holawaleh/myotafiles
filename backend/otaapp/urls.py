from django.urls import path
from .views import ota_check

urlpatterns = [
    path("ota/check/", ota_check),
]
