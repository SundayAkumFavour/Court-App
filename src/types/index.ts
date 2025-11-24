// User types
export type UserRole = 'super_admin' | 'admin' | 'staff';
export type UserStatus = 'active' | 'suspended' | 'deactivated';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_by?: string;
  biometric_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Case types
export type CaseStatus = 'open' | 'closed' | 'pending';

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description?: string;
  status: CaseStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Case Assignment types
export interface CaseAssignment {
  id: string;
  case_id: string;
  user_id: string;
  assigned_by?: string;
  assigned_at: string;
}

// Document types
export interface Document {
  id: string;
  case_id: string;
  filename: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

// Activity Log types
export type ActionType = 'create' | 'edit' | 'delete' | 'view' | 'upload';
export type ResourceType = 'case' | 'document' | 'user';

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: ActionType;
  resource_type: ResourceType;
  resource_id?: string;
  timestamp: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
}

// App types
export type ThemeMode = 'light' | 'dark';

