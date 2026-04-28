from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.apps import apps
from .utils import registrar_automatico

# para saber si es create o update
_estados_previos = {}

def guardar_estado_previo(sender, instance, **kwargs):
    if instance.pk:
        _estados_previos[(sender, instance.pk)] = True

def registrar_post_save(sender, instance, created, **kwargs):
    if sender.__name__ == "Bitacora":
        return

    accion = "CREAR" if created else "EDITAR"
    registrar_automatico(instance, accion)

def registrar_post_delete(sender, instance, **kwargs):
    if sender.__name__ == "Bitacora":
        return

    registrar_automatico(instance, "ELIMINAR")


def conectar_signals():
    for model in apps.get_models():
        if model.__name__ == "Bitacora":
            continue

        pre_save.connect(guardar_estado_previo, sender=model)
        post_save.connect(registrar_post_save, sender=model)
        post_delete.connect(registrar_post_delete, sender=model)