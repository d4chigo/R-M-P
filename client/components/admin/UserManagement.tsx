"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  RotateCcw,
  Shield,
  ShieldOff,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
} from "lucide-react";

interface Usuario {
  id_usuario: number;
  username: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
  roles: string[];
  role_ids: number[];
}

interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
}

interface UserFormData {
  username: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  roles: number[];
  sendPassword: boolean;
}

export default function UserManagement() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Estados para formularios
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Formulario de datos
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    nombre_completo: "",
    email: "",
    telefono: "",
    roles: [],
    sendPassword: true,
  });

  const { token, isAdmin } = useAuth();
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  useEffect(() => {
    if (isAdmin) {
      loadUsuarios();
      loadRoles();
    }
  }, [isAdmin, token]);

  useEffect(() => {
    filterUsuarios();
  }, [usuarios, searchTerm, statusFilter, roleFilter]);

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/admin/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar usuarios");
      }

      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data);
      } else {
        setError(data.message || "Error al cargar usuarios");
      }
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      setError("Error de conexión al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRoles(data.data);
        }
      }
    } catch (err) {
      console.error("Error cargando roles:", err);
    }
  };

  const filterUsuarios = () => {
    let filtered = [...usuarios];

    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.nombre_completo.toLowerCase().includes(term) ||
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.roles.some((role) => role.toLowerCase().includes(term)),
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) =>
        statusFilter === "active" ? user.activo : !user.activo,
      );
    }

    // Filtro por rol
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.roles.includes(roleFilter));
    }

    setFilteredUsuarios(filtered);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      nombre_completo: "",
      email: "",
      telefono: "",
      roles: [],
      sendPassword: true,
    });
    setSubmitError("");
    setSelectedUser(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/usuarios`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadUsuarios();
        setIsCreateDialogOpen(false);
        resetForm();
      } else {
        setSubmitError(data.message || "Error al crear usuario");
      }
    } catch (err) {
      console.error("Error creando usuario:", err);
      setSubmitError("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/usuarios/${selectedUser.id_usuario}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            nombre_completo: formData.nombre_completo,
            email: formData.email,
            telefono: formData.telefono,
            roles: formData.roles,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await loadUsuarios();
        setIsEditDialogOpen(false);
        resetForm();
      } else {
        setSubmitError(data.message || "Error al actualizar usuario");
      }
    } catch (err) {
      console.error("Error actualizando usuario:", err);
      setSubmitError("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/usuarios/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await loadUsuarios();
      } else {
        setError(data.message || "Error al eliminar usuario");
      }
    } catch (err) {
      console.error("Error eliminando usuario:", err);
      setError("Error de conexión");
    }
  };

  const handleToggleActive = async (userId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/usuarios/${userId}/toggle-active`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        await loadUsuarios();
      } else {
        setError(data.message || "Error al cambiar estado del usuario");
      }
    } catch (err) {
      console.error("Error cambiando estado:", err);
      setError("Error de conexión");
    }
  };

  const handleResetPassword = async (userId: number) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/usuarios/${userId}/reset-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sendEmail: true }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Mostrar mensaje de éxito
        setError("");
        alert("Contraseña restablecida y enviada por email");
      } else {
        setError(data.message || "Error al restablecer contraseña");
      }
    } catch (err) {
      console.error("Error restableciendo contraseña:", err);
      setError("Error de conexión");
    }
  };

  const openEditDialog = (user: Usuario) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      nombre_completo: user.nombre_completo,
      email: user.email,
      telefono: user.telefono || "",
      roles: user.role_ids,
      sendPassword: false,
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toUpperCase()) {
      case "ADMINISTRADOR":
        return "bg-red-100 text-red-800 border-red-200";
      case "USUARIO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "OPERADOR":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              No tienes permisos para acceder a la administración de usuarios.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Administración de Usuarios
          </h1>
          <p className="text-gray-600">
            Gestiona usuarios, roles y permisos del sistema
          </p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nombre, usuario, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={statusFilter}
                onValueChange={(value: any) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id_rol} value={role.nombre}>
                      {role.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setRoleFilter("all");
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                {filteredUsuarios.length} de {usuarios.length} usuarios
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={loadUsuarios}
              disabled={isLoading}
            >
              <RotateCcw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsuarios.map((user) => (
                    <TableRow key={user.id_usuario}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.nombre_completo}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            {user.email}
                          </div>
                          {user.telefono && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {user.telefono}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className={getRoleBadgeColor(role)}
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={user.activo}
                            onCheckedChange={() =>
                              handleToggleActive(user.id_usuario)
                            }
                          />
                          <span
                            className={`text-sm ${user.activo ? "text-green-600" : "text-red-600"}`}
                          >
                            {user.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetPassword(user.id_usuario)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Eliminar usuario?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción desactivará al usuario{" "}
                                  <strong>{user.nombre_completo}</strong>. Esta
                                  acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteUser(user.id_usuario)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete la información del nuevo usuario. Se enviará una
              contraseña temporal por email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-username">Username *</Label>
                <Input
                  id="create-username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="usuario123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="usuario@empresa.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-nombre">Nombre Completo *</Label>
              <Input
                id="create-nombre"
                value={formData.nombre_completo}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_completo: e.target.value })
                }
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-telefono">Teléfono</Label>
              <Input
                id="create-telefono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                placeholder="+51 999 888 777"
              />
            </div>

            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id_rol}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`role-${role.id_rol}`}
                      checked={formData.roles.includes(role.id_rol)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            roles: [...formData.roles, role.id_rol],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            roles: formData.roles.filter(
                              (id) => id !== role.id_rol,
                            ),
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`role-${role.id_rol}`} className="text-sm">
                      {role.nombre}
                      {role.descripcion && (
                        <span className="text-gray-500 ml-1">
                          - {role.descripcion}
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="send-password"
                checked={formData.sendPassword}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, sendPassword: !!checked })
                }
              />
              <Label htmlFor="send-password" className="text-sm">
                Enviar contraseña por email
              </Label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  "Crear Usuario"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifique la información del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            {submitError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username *</Label>
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre Completo *</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre_completo}
                onChange={(e) =>
                  setFormData({ ...formData, nombre_completo: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-telefono">Teléfono</Label>
              <Input
                id="edit-telefono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Roles</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id_rol}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`edit-role-${role.id_rol}`}
                      checked={formData.roles.includes(role.id_rol)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            roles: [...formData.roles, role.id_rol],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            roles: formData.roles.filter(
                              (id) => id !== role.id_rol,
                            ),
                          });
                        }
                      }}
                    />
                    <Label
                      htmlFor={`edit-role-${role.id_rol}`}
                      className="text-sm"
                    >
                      {role.nombre}
                      {role.descripcion && (
                        <span className="text-gray-500 ml-1">
                          - {role.descripcion}
                        </span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Actualizando...
                  </>
                ) : (
                  "Actualizar Usuario"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
