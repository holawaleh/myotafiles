from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import FirmwareSerializer
from .models import Firmware

class FirmwareListCreate(APIView):
    def get(self, request):
        qs = Firmware.objects.all().order_by("-created_at")
        serializer = FirmwareSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FirmwareSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
