# utils/email_service.py

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.timezone import now
import traceback


# =====================================================
# 🔹 FUNCIÓN BASE PARA ENVIAR EMAIL CON SENDGRID
# =====================================================

def enviar_email_sendgrid(destinatario, asunto, template, contexto):
    try:
        html_content = render_to_string(template, contexto)

        message = Mail(
            from_email=settings.DEFAULT_FROM_EMAIL,
            to_emails=destinatario,
            subject=asunto,
            html_content=html_content,
        )

        sg = SendGridAPIClient(settings.EMAIL_HOST_PASSWORD)
        response = sg.send(message)

        print("📨 STATUS:", response.status_code)

        return response.status_code == 202

    except Exception:
        print("❌ ERROR ENVIANDO EMAIL")
        traceback.print_exc()
        return False


# =====================================================
# 🔹 FUNCIÓN AUXILIAR PARA OBTENER EMAIL DE UNA ORDEN
# =====================================================

def obtener_email_cliente_orden(orden):
    """
    Retorna el email correcto para una orden:
    - Usuario autenticado
    - Cliente invitado
    """
    if orden.usuario and orden.usuario.email:
        return orden.usuario.email

    if orden.cliente_correo:
        return orden.cliente_correo

    return None


# =====================================================
# 🔹 CORREOS DE USUARIO
# =====================================================

def enviar_correo_bienvenida(usuario):
    if not usuario.email:
        return False

    return enviar_email_sendgrid(
        destinatario=usuario.email,
        asunto="Bienvenido a nuestro sistema",
        template="emails/bienvenida.html",
        contexto={
            "nombre": getattr(usuario, "nombre", usuario.username)
        }
    )


def notificar_login(usuario, request=None):
    if not usuario.email:
        return False

    ip = request.META.get("REMOTE_ADDR") if request else "No disponible"

    return enviar_email_sendgrid(
        destinatario=usuario.email,
        asunto="Nuevo inicio de sesión",
        template="emails/login.html",
        contexto={
            "nombre": getattr(usuario, "nombre", usuario.username),
            "fecha": now().strftime("%d/%m/%Y %H:%M"),
            "ip": ip,
        }
    )


def notificar_cambio_password(usuario):
    if not usuario.email:
        return False

    return enviar_email_sendgrid(
        destinatario=usuario.email,
        asunto="Tu contraseña fue actualizada",
        template="emails/password_changed.html",
        contexto={
            "nombre": getattr(usuario, "nombre", usuario.username),
            "fecha": now().strftime("%d/%m/%Y %H:%M"),
        }
    )


# =====================================================
# 🔹 CORREOS DE ÓRDENES
# =====================================================

def notificar_nueva_orden(orden):

    destinatario = obtener_email_cliente_orden(orden)
    if not destinatario:
        return False

    return enviar_email_sendgrid(
        destinatario=destinatario,
        asunto=f"Confirmación de tu Orden #{orden.id}",
        template="emails/nueva_orden.html",
        contexto={
            "orden": orden
        }
    )


def notificar_cambio_estado_orden(orden):


    destinatario = obtener_email_cliente_orden(orden)
    if not destinatario:
        return False

    return enviar_email_sendgrid(
        destinatario=destinatario,
        asunto=f"Actualización de tu Orden #{orden.id}",
        template="emails/cambio_estado_orden.html",
        contexto={
            "orden": orden
        }
    )



# =====================================================
# 🔹 CORREOS DE RESERVAS
# =====================================================
def notificar_nueva_reserva(reserva):
    print("📩 [EMAIL] Intentando enviar nueva reserva...")
    print(f"➡ Reserva ID: {reserva.id}")

    if not reserva.email:
        print("❌ No hay email en la reserva")
        return False

    print(f"📧 Enviando a: {reserva.email}")
    print("🧾 Template: emails/nueva_reserva.html")

    resultado = enviar_email_sendgrid(
        destinatario=reserva.email,
        asunto=f"Reserva recibida #{reserva.id}",
        template="emails/nueva_reserva.html",
        contexto={
            "reserva": reserva
        }
    )

    print(f"✅ Resultado envío nueva reserva: {resultado}")
    return resultado


def notificar_cambio_estado_reserva(reserva):
    print("📩 [EMAIL] Cambio de estado de reserva...")
    print(f"➡ Reserva ID: {reserva.id}")
    print(f"🔄 Nuevo estado: {reserva.estado}")

    if not reserva.email:
        print("❌ No hay email en la reserva")
        return False

    print(f"📧 Enviando a: {reserva.email}")
    print("🧾 Template: emails/cambio_estado_reserva.html")

    resultado = enviar_email_sendgrid(
        destinatario=reserva.email,
        asunto=f"Actualización de tu reserva #{reserva.id}",
        template="emails/cambio_estado_reserva.html",
        contexto={
            "reserva": reserva
        }
    )

    print(f"✅ Resultado envío cambio estado: {resultado}")
    return resultado