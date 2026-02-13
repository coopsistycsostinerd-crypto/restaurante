from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Venta, Pago, ComprobanteFiscal
from .serializers import VentaSerializer, PagoSerializer, ComprobanteFiscalSerializer
from ordenes.models import Orden

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from .models import Venta
from django.template.loader import render_to_string


class CrearVentaDesdeOrdenAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, orden_id):
        orden = get_object_or_404(Orden, id=orden_id)

        # Verificar si la orden ya ha sido convertida a una venta
        if hasattr(orden, "venta"):
            return Response({"error": "Esta orden ya ha sido convertida a venta"}, status=status.HTTP_400_BAD_REQUEST)

        # Crear la venta a partir de la orden
        venta = Venta.objects.create(
            orden=orden,
            cajero=request.user,  # Suponiendo que el usuario que hace la solicitud es el cajero
            subtotal=orden.total,
            impuestos=0,  # Esto puede cambiar según tu lógica de impuestos
            total=orden.total
        )

        return Response(VentaSerializer(venta).data, status=status.HTTP_201_CREATED)


class OrdenDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, orden_id):
        orden = get_object_or_404(Orden, id=orden_id)

        data = {
            "id": orden.id,
            "total": orden.total,
            "cliente": orden.cliente_nombre,
            "estado": orden.estado
        }

        return Response(data)

class AgregarPagoAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, venta_id):
        # Obtener la venta asociada al ID proporcionado
        print(f"Recibiendo solicitud para procesar el pago de la venta con ID: {venta_id} ")
        venta = get_object_or_404(Venta, id=venta_id)
        
        # Verificar si la venta ya está completada
        if venta.completada:
            print(f"La venta con ID {venta_id} ya está completada.")
            return Response({"error": "Esta venta ya ha sido pagada completamente"}, status=400)

        # Obtener el método de pago y la referencia
        metodo = request.data.get("metodo")
        referencia = request.data.get("referencia", "")
        print(f"Método de pago: {metodo}")
        print(f"Referencia: {referencia}")

        # Validar que se haya pasado un método de pago
        if not metodo:
            print("Error: No se proporcionó un método de pago.")
            return Response({"error": "Método de pago requerido"}, status=400)

        # Calcular el monto restante a pagar
        total_pagado = sum(p.monto for p in venta.pagos.all())
        restante = venta.total - total_pagado
        print(f"Total pagado hasta el momento: {total_pagado}")
        print(f"Monto restante para completar el pago: {restante}")

        # Si el monto restante es menor o igual a 0, no se permite procesar el pago
        if restante <= 0:
            print("Error: La venta ya está saldada. No se puede procesar el pago.")
            return Response({"error": "La venta ya está saldada"}, status=400)

        # Crear el nuevo pago con los datos proporcionados
        print(f"Creando un pago por el monto restante: {restante}")
        pago = Pago.objects.create(
            venta=venta,
            metodo=metodo,
            monto=restante,  # El monto restante es lo que se pagará
            referencia=referencia  # Si no hay referencia, se pasará una cadena vacía
        )

        # Marcar la venta como completada si el monto se ha saldado
        if venta.total == total_pagado + restante:
            print(f"La venta con ID {venta_id} se marca como completada.")
            venta.completada = True
            venta.save()

        # Cambiar el estado de la orden asociada a "entregado"
        print(f"Cambiando el estado de la orden con ID {venta.orden.id} a 'entregado'.")
        venta.orden.estado = "entregado"
        venta.orden.save()

        # Responder con el éxito del pago
        print(f"Pago de {restante} aplicado exitosamente para la venta con ID {venta_id}.")
        return Response({"mensaje": "Pago aplicado", "monto": restante}, status=201)




class AgregarPagoAPIView2(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, venta_id):
        # Obtener la venta asociada al ID proporcionado
        venta = get_object_or_404(Venta, id=venta_id)

        # Verificar si la venta ya está completada
        if venta.completada:
            return Response({"error": "Esta venta ya ha sido pagada completamente"}, status=400)

        # Obtener el método de pago y la referencia
        metodo = request.data.get("metodo")
        referencia = request.data.get("referencia", "")

        # Validar que se haya pasado un método de pago
        if not metodo:
            return Response({"error": "Método de pago requerido"}, status=400)

        # Calcular el monto restante a pagar
        total_pagado = sum(p.monto for p in venta.pagos.all())
        restante = venta.total - total_pagado

        # Si el monto restante es menor o igual a 0, no se permite procesar el pago
        if restante <= 0:
            return Response({"error": "La venta ya está saldada"}, status=400)

        # Crear el nuevo pago con los datos proporcionados
        pago = Pago.objects.create(
            venta=venta,
            metodo=metodo,
            monto=restante,  # El monto restante es lo que se pagará
            referencia=referencia  # Si no hay referencia, se pasará una cadena vacía
        )

        # Marcar la venta como completada si el monto se ha saldado
        if venta.total == total_pagado + restante:
            venta.completada = True
            venta.save()

        # Cambiar el estado de la orden asociada a "entregado"
        venta.orden.estado = "entregado"
        venta.orden.save()

        return Response({"mensaje": "Pago aplicado", "monto": restante}, status=201)

    
class GenerarComprobanteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, venta_id):
        venta = get_object_or_404(Venta, id=venta_id)

        if not venta.completada:
            return Response({"error": "La venta aún no está pagada completamente"}, status=400)

        if hasattr(venta, "comprobante"):
            return Response({"error": "La venta ya tiene comprobante"}, status=400)

        serializer = ComprobanteFiscalSerializer(data=request.data)
        if serializer.is_valid():
            comprobante = serializer.save(venta=venta)
            return Response(ComprobanteFiscalSerializer(comprobante).data, status=201)

        return Response(serializer.errors, status=400)

class OrdenesParaCajaAPIView(APIView):


    permission_classes = [IsAuthenticated]

    def get(self, request):
        ordenes = Orden.objects.filter(estado="preparando").exclude(venta__isnull=False).order_by("-creado")


        data = [
            {
                "id": o.id,
                "cliente": o.cliente_nombre,
                "total": o.total,
                "tipo_pedido": o.tipo_pedido
            }
            for o in ordenes
        ]

        return Response(data)
    




from caja.models import Venta
from core.models import Empresa  # 👈 IMPORTANTE

def ticket_venta(request, venta_id):
    venta = get_object_or_404(Venta, orden=venta_id)

    # Traer empresa activa
    empresa = Empresa.objects.filter(activo=True).first()

    html = render_to_string("ticket.html", {
        "venta": venta,
        "empresa": empresa  # 👈 la enviamos al template
    })

    return HttpResponse(html)
