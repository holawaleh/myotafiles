from django.urls import path
from .views import ota_check, FirmwareListCreate

urlpatterns = [
    path("ota/check/", ota_check),
    path("firmware/", FirmwareListCreate.as_view()),
]
