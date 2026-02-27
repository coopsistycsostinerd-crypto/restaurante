from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.timezone import now
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.timezone import now

from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.timezone import now
from django.utils.timezone import localtime
def enviar_correo_bienvenida(usuario):
    asunto = "Bienvenido a nuestro sistema"

    html_content = render_to_string(
        "emails/bienvenida.html",
        {
            "nombre": usuario.nombre
        }
    )

    email = EmailMultiAlternatives(
        asunto,
        "",  # texto plano opcional
        settings.EMAIL_HOST_USER,
        [usuario.email],
    )

    email.attach_alternative(html_content, "text/html")
    email.send()





import threading
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.timezone import now
from django.conf import settings





from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.timezone import now
from django.conf import settings


def notificar_login(usuario, request=None):
    print("=== INICIANDO notificar_login ===", flush=True)

    asunto = "Nuevo inicio de sesión"

    ip = request.META.get("REMOTE_ADDR") if request else "No disponible"

    print("Usuario:", usuario, flush=True)
    print("Email destino:", usuario.email, flush=True)
    print("From email:", settings.DEFAULT_FROM_EMAIL, flush=True)

    contexto = {
        "nombre": usuario.nombre,
        "fecha": now().strftime("%d/%m/%Y %H:%M"),
        "ip": ip,
    }

    try:
        html_content = render_to_string("emails/login.html", contexto)
        print("Template renderizado correctamente", flush=True)
    except Exception as e:
        print("ERROR RENDER TEMPLATE:", e, flush=True)
        return

    email = EmailMultiAlternatives(
        subject=asunto,
        body="",  # texto plano opcional
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[usuario.email],
    )

    email.attach_alternative(html_content, "text/html")

    print("ANTES DE ENVIAR EMAIL", flush=True)

    try:
        resultado = email.send(fail_silently=False)
        print("EMAIL ENVIADO, RESULTADO:", resultado, flush=True)
    except Exception as e:
        print("ERROR SMTP:", e, flush=True)

    print("=== FIN notificar_login ===", flush=True)
 


def notificar_cambio_password(usuario):
    print("🔥 Iniciando notificar_cambio_password")

    asunto = "Tu contraseña fue actualizada"

    contexto = {
        "nombre": usuario.nombre,
        "fecha": now().strftime("%d/%m/%Y %H:%M"),
    }

    html_content = render_to_string(
        "emails/password_changed.html",
        contexto
    )

    email = EmailMessage(
        subject=asunto,
        body=html_content,
        from_email=settings.EMAIL_HOST_USER,
        to=[usuario.email],
    )

    email.content_subtype = "html"

    resultado = email.send()
    print("Resultado envío password:", resultado)




from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import traceback


def notificar_nueva_orden(orden):
  

    try:
  
        html_content = render_to_string(
            "emails/nueva_orden.html",
            {"orden": orden}
        )
    

    except Exception as e:
       
        traceback.print_exc()
        return

    try:
      
        email = EmailMultiAlternatives(
            subject=f"Nueva Orden #{orden.id}",
            body="Nueva orden recibida",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[orden.usuario.email],
        )

        email.attach_alternative(html_content, "text/html")

        print("🚀 Enviando email...")
        resultado = email.send()

     

        if resultado == 1:
            print("✅ EMAIL ENVIADO CORRECTAMENTE")
        else:
            print("⚠️ Email NO enviado (resultado diferente de 1)")

    except Exception as e:
    
        traceback.print_exc()

 
    asunto = f"Nueva Orden #{orden.id}"

    html_content = render_to_string(
        "emails/nueva_orden.html",
        {"orden": orden}
    )

    email = EmailMultiAlternatives(
        asunto,
        "Nueva orden recibida",
        settings.DEFAULT_FROM_EMAIL,
        [settings.DEFAULT_FROM_EMAIL],
    )

    email.attach_alternative(html_content, "text/html")
    email.send()



    from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import traceback


def notificar_cambio_estado_orden(orden):
    print("\n🔥 === NOTIFICANDO CAMBIO DE ESTADO ===")
    print("Orden:", orden.id)
    print("Nuevo estado:", orden.estado)

    if not orden.usuario or not orden.usuario.email:
        print("❌ La orden no tiene usuario con email")
        return

    try:
        html_content = render_to_string(
            "emails/cambio_estado_orden.html",
            {"orden": orden}
        )

        email = EmailMultiAlternatives(
            subject=f"Actualización de tu Orden #{orden.id}",
            body="Tu orden cambió de estado",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[orden.usuario.email],
        )

        email.attach_alternative(html_content, "text/html")

        print("📧 Enviando a:", orden.usuario.email)
        resultado = email.send()
        print("Resultado envío:", resultado)

    except Exception:
        traceback.print_exc()