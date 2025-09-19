export interface UserFormDataSimple {
  username: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  role_id?: number | null;
}

export function buildPayload(form: {
  username: string;
  nombre_completo: string;
  email: string;
  telefono: string;
  roles: number[];
}) {
  return {
    username: form.username,
    nombre_completo: form.nombre_completo,
    email: form.email,
    telefono: form.telefono,
    role_id: form.roles && form.roles.length > 0 ? form.roles[0] : null,
  } as UserFormDataSimple;
}

export function validateRoleSelected(form: { roles: number[] }) {
  return Array.isArray(form.roles) && form.roles.length > 0;
}
