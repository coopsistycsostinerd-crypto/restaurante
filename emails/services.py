# utils/email_service.py

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.template.loader import render_to_string
from django.conf import settings
import traceback


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
    
from django.utils.timezone import now


def enviar_correo_bienvenida(usuario):
    return enviar_email_sendgrid(
        destinatario=usuario.email,
        asunto="Bienvenido a nuestro sistema",
        template="emails/bienvenida.html",
        contexto={
            "nombre": usuario.nombre
        }
    )


def notificar_login(usuario, request=None):
    ip = request.META.get("REMOTE_ADDR") if request else "No disponible"

    return enviar_email_sendgrid(
        destinatario=usuario.email,
        asunto="Nuevo inicio de sesión",
        template="emails/login.html",
        contexto={
            "nombre": usuario.nombre,
            "fecha": now().strftime("%d/%m/%Y %H:%M"),
            "ip": ip,
        }
    )

def notificar_cambio_password(usuario):
    return enviar_email_sendgrid(
        destinatario=usuario.email,
        asunto="Tu contraseña fue actualizada",
        template="emails/password_changed.html",
        contexto={
            "nombre": usuario.nombre,
            "fecha": now().strftime("%d/%m/%Y %H:%M"),
        }
    )

def notificar_nueva_orden(orden):
    if not orden.usuario or not orden.usuario.email:
        return False

    return enviar_email_sendgrid(
        destinatario=orden.usuario.email,
        asunto=f"Nueva Orden #{orden.id}",
        template="emails/nueva_orden.html",
        contexto={"orden": orden}
    )

def notificar_cambio_estado_orden(orden):
    if not orden.usuario or not orden.usuario.email:
        return False

    return enviar_email_sendgrid(
        destinatario=orden.usuario.email,
        asunto=f"Actualización de tu Orden #{orden.id}",
        template="emails/cambio_estado_orden.html",
        contexto={"orden": orden}
    )