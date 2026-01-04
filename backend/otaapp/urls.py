from django.urls import path
from .views import ota_check, FirmwareListCreate, ActivateFirmware

urlpatterns = [
    path("ota/check/", ota_check),
    path("firmware/", FirmwareListCreate.as_view()),
    path("firmware/<int:firmware_id>/activate/", ActivateFirmware.as_view()),
]
