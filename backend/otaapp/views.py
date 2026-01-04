from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse

from .serializers import FirmwareSerializer
from .models import Firmware


class FirmwareListCreate(APIView):
    def get(self, request):
        qs = Firmware.objects.all().order_by("-created_at")
        serializer = FirmwareSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FirmwareSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        is_active = serializer.validated_data.get("is_active", False)
        device_type = serializer.validated_data.get("device_type")

        if is_active:
            Firmware.objects.filter(
                device_type=device_type,
                is_active=True
            ).update(is_active=False)

        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


def ota_check(request):
    device = request.GET.get("device")
    version = request.GET.get("version")

    if not device or not version:
        return JsonResponse({"update": False})

    fw = (
        Firmware.objects
        .filter(device_type=device, is_active=True)
        .order_by("-created_at")
        .first()
    )

    if not fw or fw.version == version:
        return JsonResponse({"update": False})

    return JsonResponse({
        "update": True,
        "version": fw.version,
        "url": request.build_absolute_uri(fw.bin_file.url),
    })
