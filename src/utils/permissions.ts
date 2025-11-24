import { UserRole } from '../types';
import { ROLE_HIERARCHY } from '../constants';

export const hasPermission = (userRole: UserRole | null, requiredRole: UserRole): boolean => {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const canCreateUsers = (role: UserRole | null): boolean => {
  return role === 'super_admin' || role === 'admin';
};

export const canCreateAdmins = (role: UserRole | null): boolean => {
  return role === 'super_admin';
};

export const canDeleteDocuments = (role: UserRole | null): boolean => {
  return role === 'super_admin' || role === 'admin';
};

export const canManageCases = (role: UserRole | null): boolean => {
  return role === 'super_admin' || role === 'admin';
};

