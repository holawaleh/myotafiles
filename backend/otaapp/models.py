from django.db import models

class Firmware(models.Model):
    device_type = models.CharField(max_length=50)
    version = models.CharField(max_length=20)
    bin_file = models.FileField(upload_to="firmware/")
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
