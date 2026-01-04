from django.db import models

class Firmware(models.Model):
    device_type = models.CharField(max_length=50)
    version = models.CharField(max_length=20)
    bin_file = models.FileField(upload_to="firmware/")
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class OTALog(models.Model):
    STATUS_CHOICES = [
        ("success", "Success"),
        ("failure", "Failure"),
    ]

    device_id = models.CharField(max_length=100)   # MAC / chip id
    device_type = models.CharField(max_length=50)
    from_version = models.CharField(max_length=20)
    to_version = models.CharField(max_length=20)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.device_id} → {self.to_version} ({self.status})"
