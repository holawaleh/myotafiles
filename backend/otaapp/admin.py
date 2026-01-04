from django.contrib import admin
from .models import Firmware
from .models import OTALog

@admin.register(OTALog)
class OTALogAdmin(admin.ModelAdmin):
    list_display = ("device_id", "device_type", "to_version", "status", "created_at")
    list_filter = ("status", "device_type")
