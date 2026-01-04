from rest_framework import serializers
from .models import Firmware, OTALog

class FirmwareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firmware
        fields = "__all__"

class OTALogSerializer(serializers.ModelSerializer):
    class Meta:
        model = OTALog
        fields = "__all__"