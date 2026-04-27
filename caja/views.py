from decimal import Decimal

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


from reserva.models import Reserva
from ordenes.models import Orden

class CrearVentaAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        tipo = request.data.get("tipo")
        item_id = request.data.get("id")

        if not tipo or not item_id:
            return Response(
                {"error": "Debe enviar tipo e id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 🔹 Si es ORDEN
        if tipo == "orden":

            orden = get_object_or_404(Orden, id=item_id)

            if hasattr(orden, "venta"):
                return Response(
                    {"error": "Esta orden ya tiene venta"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            venta = Venta.objects.create(
                orden=orden,
                cajero=request.user,
                subtotal=orden.total,
                impuestos=0,
                total=orden.total
                
            )

        # 🔹 Si es RESERVA
        elif tipo == "reserva":

            reserva = get_object_or_404(Reserva, id=item_id)

            if hasattr(reserva, "venta"):
                return Response(
                    {"error": "Esta reserva ya tiene venta"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            venta = Venta.objects.create(
                reserva=reserva,
                cajero=request.user,
                subtotal=reserva.monto_deposito,
                impuestos=0,
                total=reserva.monto_deposito
            )

        else:
            return Response(
                {"error": "Tipo inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            VentaSerializer(venta).data,
            status=status.HTTP_201_CREATED
        )



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

        print(f"Recibiendo solicitud para procesar el pago de la venta con ID: {venta_id}")

        venta = get_object_or_404(Venta, id=venta_id)

        # 🔹 Verificar si ya está completada
        if venta.completada:
            print(f"La venta con ID {venta_id} ya está completada.")
            return Response(
                {"error": "Esta venta ya ha sido pagada completamente"},
                status=400
            )

        metodo = request.data.get("metodo")
        referencia = request.data.get("referencia", "")

        print(f"Método de pago: {metodo}")
        print(f"Referencia: {referencia}")

        if not metodo:
            return Response(
                {"error": "Método de pago requerido"},
                status=400
            )

        # 🔹 Calcular pagos
        total_pagado = sum(p.monto for p in venta.pagos.all())
        restante = venta.total - total_pagado

        print(f"Total pagado hasta el momento: {total_pagado}")
        print(f"Monto restante: {restante}")

        if restante <= 0:
            return Response(
                {"error": "La venta ya está saldada"},
                status=400
            )

        # 🔹 Crear pago
        pago = Pago.objects.create(
            venta=venta,
            metodo=metodo,
            monto=restante,
            referencia=referencia
        )

        # 🔹 Recalcular total después del pago
        total_pagado += restante

        # 🔹 Si ya quedó saldada
        if total_pagado >= venta.total:
            print(f"La venta con ID {venta_id} se marca como completada.")
            venta.completada = True
            venta.save()

            # ==============================
            # 🔥 ACTUALIZAR ORDEN SI EXISTE
            # ==============================
            if venta.orden:
                print(f"Cambiando estado de la orden {venta.orden.id} a 'entregado'")
             #   venta.orden.estado = "entregado"
                venta.orden.estado = "en preparacion"  # 🔥 Nuevo estado para que cocina sepa que ya se pagó pero falta entregar
                venta.orden.estado_pago = "pagado"  # 🔥 Nuevo estado para que cocina sepa que ya se pagó pero falta entregar
                venta.orden.save()

            # ==============================
            # 🔥 ACTUALIZAR RESERVA SI EXISTE
            # ==============================
            if hasattr(venta, "reserva") and venta.reserva:
                print(f"Cambiando estado de la reserva {venta.reserva.id} a 'finalizada'")
                venta.reserva.estado = "finalizada"
                venta.reserva.save()

        print(f"Pago aplicado exitosamente para la venta {venta_id}")

        return Response(
            {
                "mensaje": "Pago aplicado",
                "monto": restante
            },
            status=201
        )




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
        venta.orden.estado = "pendiente" 
        venta.orden.estado_pago = "pagado"  # 🔥 Nuevo estado para que cocina sepa que ya se pagó pero falta entregar
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

from reserva.models import Reserva
from caja.models import Venta
from django.db.models import Q


class OrdenesParaCajaAPIView(APIView):
  
    permission_classes = [IsAuthenticated]

    def get(self, request):
     
        # 🔹 Órdenes listas
        ordenes = Orden.objects.filter(
            estado="pendiente", venta__isnull=True
        ).exclude(
            venta__isnull=False
        )

        # 🔹 Reservas confirmadas sin cobrar
        reservas = Reserva.objects.filter(
            estado="confirmada"
        ).exclude(
            venta__isnull=False
        )

        data = []

        # Agregar órdenes
        for o in ordenes:
            data.append({
                "id": o.id,
                "tipo": "orden",
                "cliente": o.cliente_nombre,
                "total": o.total,
                "descripcion": f"Pedido #{o.id}"
            })

        # Agregar reservas
        for r in reservas:
            data.append({
                "id": r.id,
                "tipo": "reserva",
                "cliente": r.nombre,
                "total": r.monto_deposito,
                "descripcion": f"Reserva {r.fecha} {r.hora_inicio}"
            })
  #      print("lo que se va a pagar", data)
        return Response(data)


from caja.models import Venta
from core.models import Empresa  # 👈 IMPORTANTE


def ticket_venta(request, venta_id):
    venta = get_object_or_404(Venta, id=venta_id)

    # Traer empresa activa
    empresa = Empresa.objects.filter(activo=True).first()

    html = render_to_string("ticket.html", {
        "venta": venta,
        "empresa": empresa,  # 👈 la enviamos al template
        "usuario": request.user



        
    })

    return HttpResponse(html)






# recibir pagos online (simulado)

from users.models import Usuariohtp


from decimal import Decimal
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response

from ordenes.models import Orden
from .models import Venta, Pago, PagoOnline



from decimal import Decimal

from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response

from ordenes.models import Orden
from .models import Venta, Pago, PagoOnline



class RecibirPagoOnlineAPIView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, orden_id):
        orden = get_object_or_404(Orden, id=orden_id)

        # Validar método de pago
        metodo = request.data.get("metodo")
        referencia = request.data.get("referencia", "")
        ultimos_digitos = request.data.get("ultimos_digitos", "")

        if not metodo:
            return Response({
                "error": "Debe seleccionar un método de pago"
            }, status=400)

        # Solo métodos válidos para pago online
        if metodo not in ["tarjeta", "transferencia"]:
            return Response({
                "error": "Método de pago inválido"
            }, status=400)

        # Evitar doble pago
        if hasattr(orden, "venta") and orden.venta.completada:
            return Response({
                "error": "Esta orden ya fue pagada"
            }, status=400)

        # Usuario automático para ventas online
        usuario_pago_online = Usuariohtp.objects.filter(
            username="pogosonline"
        ).first()

        if not usuario_pago_online:
            return Response({
                "error": "El usuario 'pogosonline' no existe"
            }, status=500)

        # =====================================================
        # 1. Registrar intento de pago online
        # =====================================================

        pago_online = PagoOnline.objects.create(
            orden=orden,
            metodo=metodo,
            monto=orden.total,
            referencia=referencia,
            ultimos_digitos=ultimos_digitos,
            estado="confirmado"  # simulado por ahora
        )

        # =====================================================
        # 2. Crear venta si no existe
        # =====================================================

        venta, creada = Venta.objects.get_or_create(
            orden=orden,
            defaults={
                "cajero": usuario_pago_online,
                "subtotal": orden.total,
                "impuestos": Decimal("0.00"),
                "total": orden.total,
                "completada": False
            }
        )

        # =====================================================
        # 3. Validar si ya está saldada
        # =====================================================

        total_pagado = sum(
            p.monto for p in venta.pagos.all()
        ) or Decimal("0.00")

        restante = venta.total - total_pagado

        if restante <= 0:
            venta.completada = True
            venta.save()

            return Response({
                "error": "La venta ya está saldada"
            }, status=400)

        # =====================================================
        # 4. Crear pago real en caja
        # =====================================================

        Pago.objects.create(
            venta=venta,
            metodo=metodo,
            monto=restante,
            referencia=referencia,
            ultimos_digitos=ultimos_digitos
        )

        # =====================================================
        # 5. Finalizar venta y actualizar orden
        # =====================================================

        venta.completada = True
        venta.save()

        # Pagó → cocina debe preparar
        orden.estado = "en preparacion"
        orden.estado_pago = "pagado"
        orden.save()

        return Response({
            "mensaje": "Pago online registrado correctamente",
            "orden_id": orden.id,
            "venta_id": venta.id,
            "pago_online_id": pago_online.id,
            "monto_pagado": restante,
            "estado_orden": orden.estado
        }, status=201)