from rest_framework.permissions import BasePermission


# =========================================================
# 🔐 PERMISO BASE (REUTILIZABLE)
# =========================================================
class RolePermission(BasePermission):
    """
    Permiso base por roles.
    Solo define allowed_roles en las subclases.
    """

    allowed_roles = []

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.rol in self.allowed_roles
        )


# =========================================================
# 🔐 ADMIN SOLO
# =========================================================
class IsAdmin(RolePermission):
    allowed_roles = ["admin"]


# =========================================================
# 🔐 ADMIN + GERENTE
# =========================================================
class IsAdminOrGerente(RolePermission):
    allowed_roles = ["admin", "gerente"]


# =========================================================
# 🔐 ADMIN + GERENTE + EMPLEADO
# (gestión general del negocio)
# =========================================================
class CanManageStore(RolePermission):
    allowed_roles = ["admin", "gerente", "empleado"]


# =========================================================
# 🔐 CAJA (POS / COBROS)
# =========================================================
class CanAccessCaja(RolePermission):
    allowed_roles = ["admin", "cajero"]


# =========================================================
# 🔐 POS (PUNTO DE VENTA)
# =========================================================
class CanAccessPOS(RolePermission):
    allowed_roles = ["admin", "empleado"]


# =========================================================
# 🔐 CLIENTES (gestión de usuarios)
# =========================================================
class CanManageClients(RolePermission):
    allowed_roles = ["admin", "gerente", "empleado"]


# =========================================================
# 🔐 SOLO ADMIN (configuración del sistema)
# =========================================================
class IsSystemAdmin(RolePermission):
    allowed_roles = ["admin"]


# =========================================================
# 🔐 ANALÍTICA Y REPORTES
# =========================================================
class CanViewReports(RolePermission):
    allowed_roles = ["admin", "gerente"]


# =========================================================
# 🔐 MENSAJES / CONTACTO
# =========================================================
class CanViewMessages(RolePermission):
    allowed_roles = ["admin", "gerente"]


class IsAuthenticatedNotClient(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.rol != "cliente"
        )