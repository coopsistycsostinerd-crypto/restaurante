import uuid


def get_hardware_id():
    return str(uuid.getnode())