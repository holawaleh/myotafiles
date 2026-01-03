from django.http import JsonResponse
from .models import Firmware

def ota_check(request):
    device = request.GET.get("device")
    version = request.GET.get("version")

    if not device or not version:
        return JsonResponse({"error": "missing parameters"}, status=400)

    firmware = (
        Firmware.objects
        .filter(device_type=device, is_active=True)
        .order_by("-created_at")
        .first()
    )

    if not firmware:
        return JsonResponse({"update": False})

    if firmware.version != version:
        firmware_url = request.build_absolute_uri(firmware.bin_file.url)

        return JsonResponse({
            "update": True,
            "version": firmware.version,
            "url": firmware_url
        })

    return JsonResponse({"update": False})
