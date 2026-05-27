import json

from core.utils.hardware import get_hardware_id
from core.utils.licencia import generar_firma


cliente = "Los Vago'"
fecha_fin = "2026-06-30"

hardware_id = get_hardware_id()

firma = generar_firma(
    cliente,
    fecha_fin,
    hardware_id
)

licencia = {
    "cliente": cliente,
    "fecha_fin": fecha_fin,
    "hardware_id": hardware_id,
    "firma": firma
}

with open("core/utils/licencia.json", "w") as f:
    json.dump(licencia, f, indent=4)

print("Licencia generada.")