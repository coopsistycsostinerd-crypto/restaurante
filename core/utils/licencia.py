from datetime import date
import json
import os
import hashlib
import hmac

from core.utils.hardware import get_hardware_id


LICENCIA_FILE = "core/utils/licencia.json"
ULTIMA_FECHA_FILE = "core/utils/ultima_fecha.txt"

SECRET_KEY = "LOS_VAGO_SUPER_SECRET"


def generar_firma(cliente, fecha_fin, hardware_id):

    datos = f"{cliente}|{fecha_fin}|{hardware_id}"

    return hmac.new(
        SECRET_KEY.encode(),
        datos.encode(),
        hashlib.sha256
    ).hexdigest()


def detectar_cambio_fecha():

    hoy = str(date.today())

    if not os.path.exists(ULTIMA_FECHA_FILE):

        with open(ULTIMA_FECHA_FILE, "w") as f:
            f.write(hoy)

        return False

    with open(ULTIMA_FECHA_FILE, "r") as f:
        ultima_fecha = f.read().strip()

    if hoy < ultima_fecha:
        return True

    with open(ULTIMA_FECHA_FILE, "w") as f:
        f.write(hoy)

    return False


def licencia_valida():

    if not os.path.exists(LICENCIA_FILE):
        return False

    try:

        with open(LICENCIA_FILE, "r") as f:
            licencia = json.load(f)

        cliente = licencia["cliente"]
        fecha_fin = licencia["fecha_fin"]
        hardware_id = licencia["hardware_id"]
        firma = licencia["firma"]

        # validar hardware
        if hardware_id != get_hardware_id():
            return False

        # validar firma
        firma_correcta = generar_firma(
            cliente,
            fecha_fin,
            hardware_id
        )

        if firma != firma_correcta:
            return False

        # validar fecha
        if date.today() > date.fromisoformat(fecha_fin):
            return False

        # detectar cambio de fecha
        if detectar_cambio_fecha():
            return False

        return True

    except:
        return False