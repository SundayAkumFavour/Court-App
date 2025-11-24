# Court Management System

A comprehensive React Native Expo app for managing court cases, documents, and users with role-based access control.

## Features

- **Role-Based Access Control**: Super Admin, Admin, and Staff roles with different permissions
- **Biometric Authentication**: Face ID/Touch ID for Super Admin and Admin users
- **Case Management**: Create, view, assign, and manage court cases
- **Document Management**: Upload, view, edit, and delete documents (with role restrictions)
- **User Management**: Create and manage users (Super Admin/Admin only)
- **Search & Filter**: Search cases and documents
- **Dark/Light Theme**: Automatic theme switching
- **Supabase Integration**: Backend powered by Supabase with Row Level Security

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorState.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSkeleton.tsx
│   ├── Typography.tsx
│   └── SettingsScreen.tsx
├── constants/           # Constants and theme
│   ├── index.ts
│   └── theme.ts
├── hooks/              # Custom React hooks
│   ├── useAppDispatch.ts
│   ├── useAppSelector.ts
│   ├── useTheme.ts
│   └── index.ts
├── lib/                # Services and utilities
│   ├── supabase.ts
│   └── services/
│       ├── authService.ts
│       ├── userService.ts
│       ├── caseService.ts
│       └── documentService.ts
├── navigation/          # Navigation configuration
│   └── AppNavigator.tsx
├── providers/           # Context providers
│   └── ThemeProvider.tsx
├── screens/            # Screen components
│   ├── auth/
│   │   └── LoginScreen.tsx
│   ├── cases/
│   │   ├── CasesListScreen.tsx
│   │   ├── CreateCaseScreen.tsx
│   │   └── CaseDetailScreen.tsx
│   ├── users/
│   │   ├── UsersListScreen.tsx
│   │   └── CreateUserScreen.tsx
│   └── documents/
│       └── UploadDocumentScreen.tsx
├── store/              # Redux store
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── usersSlice.ts
│       ├── casesSlice.ts
│       ├── documentsSlice.ts
│       └── themeSlice.ts
├── types/               # TypeScript types
│   └── index.ts
└── utils/               # Utility functions
    └── permissions.ts
```

## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Environment Variables**:
   The `.env` file is already configured with your Supabase credentials.

3. **Supabase Setup**:
   - Ensure your Supabase project has the schema from `supabase/migrations/001_schema_and_policies.sql`
   - Create a storage bucket named `documents` for file uploads
   - Configure RLS policies as per the migration file

4. **Run the app**:
   ```bash
   pnpm start
   ```

## User Roles & Permissions

### Super Admin
- Full system access
- Create/delete Admin and Staff accounts
- Biometric authentication required
- Cannot sign up (must be created manually)

### Admin (Chief Judge)
- Create/delete Staff accounts
- Manage all cases and documents
- Assign cases to Staff
- Biometric authentication required
- Cannot sign up (created by Super Admin)

### Staff
- View only assigned cases
- Upload/edit documents in assigned cases
- Cannot delete anything
- Email/password authentication
- Cannot sign up (created by Super Admin/Admin)

## Database Schema

The app uses the following main tables:
- `users` - User metadata and roles
- `cases` - Court cases
- `case_assignments` - Case-to-user assignments
- `documents` - Case documents
- `user_activity_logs` - Activity tracking

All tables have Row Level Security (RLS) enabled with policies enforcing role-based access.

## Storage

Documents are stored in Supabase Storage in the `documents` bucket, organized by case ID.

## Development

- **Package Manager**: pnpm (never use npm)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation
- **UI Library**: React Native Paper
- **Theme**: Custom theming system with light/dark mode support

## Notes

- Biometric authentication requires device support (Face ID/Touch ID/Fingerprint)
- Staff users cannot delete documents or cases
- All API calls respect RLS policies at the database level
- Search functionality is limited to assigned cases for Staff users

