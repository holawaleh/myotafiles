from django.urls import path
from .views import (
    ota_check,
    FirmwareListCreate,
    ActivateFirmware,
    OTALogCreate,
)

urlpatterns = [
    path("ota/check/", ota_check),
    path("ota/log/", OTALogCreate.as_view()),   # ← ADD THIS
    path("firmware/", FirmwareListCreate.as_view()),
    path("firmware/<int:firmware_id>/activate/", ActivateFirmware.as_view()),
]
