export type Role = "SUPERADMIN" | "ADMIN" | "PSYCHOLOGIST" | "CLIENT";

export const ROLES: Role[] = ["SUPERADMIN", "ADMIN", "PSYCHOLOGIST", "CLIENT"];

export const ROLE_LABEL: Record<Role, string> = {
  SUPERADMIN: "Super Admin",
  ADMIN: "Admin",
  PSYCHOLOGIST: "Psikolog",
  CLIENT: "Klien",
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  SUPERADMIN: "Akses penuh, termasuk membuat & menghapus semua akun.",
  ADMIN: "Mengelola data psikolog dan akun klien.",
  PSYCHOLOGIST: "Akun psikolog, hanya dapat dibuat oleh Super Admin.",
  CLIENT: "Portal klien: booking, tagihan, asesmen, dan mood.",
};

export function normalizeRole(value: unknown): Role {
  return ROLES.includes(value as Role) ? (value as Role) : "CLIENT";
}

export function isStaffRole(role: string): boolean {
  return role === "SUPERADMIN" || role === "ADMIN" || role === "PSYCHOLOGIST";
}

export function isAdminRole(role: string): boolean {
  return role === "SUPERADMIN" || role === "ADMIN";
}

export function isSuperadminRole(role: string): boolean {
  return role === "SUPERADMIN";
}
