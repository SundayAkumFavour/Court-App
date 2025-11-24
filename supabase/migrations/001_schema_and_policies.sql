-- 001_schema_and_policies.sql
-- Create core tables and RLS policies for Court Management System

-- Create users metadata table (links to auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin','admin','staff')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deactivated')),
  created_by uuid NULL REFERENCES public.users(id),
  biometric_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cases
CREATE TABLE IF NOT EXISTS public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','pending')),
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Case assignments
CREATE TABLE IF NOT EXISTS public.case_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.users(id),
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (case_id, user_id)
);

-- Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size bigint,
  uploaded_by uuid REFERENCES public.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Optional activity logs
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  action text NOT NULL CHECK (action IN ('create','edit','delete','view','upload')),
  resource_type text NOT NULL CHECK (resource_type IN ('case','document','user')),
  resource_id uuid,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS on tables
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current auth user is assigned to a case
DROP FUNCTION IF EXISTS public.is_user_assigned_to_case(uuid);
CREATE FUNCTION public.is_user_assigned_to_case(case_uuid uuid) RETURNS boolean
  LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
      SELECT 1 FROM public.case_assignments ca WHERE ca.case_id = $1 AND ca.user_id = auth.uid()
    );
  $$;

-- Helper policy: check role in public.users for current auth user
-- Allow read of one's own user record, or allow admin/super_admin per policies below

-- Policies for cases
-- Staff: SELECT only when assigned
DROP POLICY IF EXISTS "staff_select_assigned_cases" ON public.cases;
DROP POLICY IF EXISTS "admin_select_all_cases" ON public.cases;
DROP POLICY IF EXISTS "admin_insert_cases" ON public.cases;
DROP POLICY IF EXISTS "admin_update_cases" ON public.cases;
DROP POLICY IF EXISTS "admin_delete_cases" ON public.cases;

CREATE POLICY "staff_select_assigned_cases" ON public.cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.case_assignments ca
      WHERE ca.case_id = public.cases.id AND ca.user_id = auth.uid()
    )
  );

-- Admin & Super Admin: can select all
CREATE POLICY "admin_select_all_cases" ON public.cases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );
-- nmmmnnmdsjdsnsfnnv 
-- Only Admin/Super Admin can INSERT/UPDATE/DELETE cases
CREATE POLICY "admin_insert_cases" ON public.cases
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

CREATE POLICY "admin_update_cases" ON public.cases
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

CREATE POLICY "admin_delete_cases" ON public.cases
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

-- Policies for case_assignments
DROP POLICY IF EXISTS "staff_select_own_assignments" ON public.case_assignments;
DROP POLICY IF EXISTS "admin_select_all_assignments" ON public.case_assignments;
DROP POLICY IF EXISTS "admin_insert_assignments" ON public.case_assignments;
DROP POLICY IF EXISTS "admin_update_assignments" ON public.case_assignments;
DROP POLICY IF EXISTS "admin_delete_assignments" ON public.case_assignments;

CREATE POLICY "staff_select_own_assignments" ON public.case_assignments
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "admin_select_all_assignments" ON public.case_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

CREATE POLICY "admin_insert_assignments" ON public.case_assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

CREATE POLICY "admin_update_assignments" ON public.case_assignments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

CREATE POLICY "admin_delete_assignments" ON public.case_assignments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

-- Policies for documents
DROP POLICY IF EXISTS "staff_select_documents_in_assigned_cases" ON public.documents;
DROP POLICY IF EXISTS "admin_select_all_documents" ON public.documents;
DROP POLICY IF EXISTS "staff_insert_documents_assigned_cases" ON public.documents;
DROP POLICY IF EXISTS "staff_update_documents_assigned_cases" ON public.documents;
DROP POLICY IF EXISTS "admin_insert_documents" ON public.documents;
DROP POLICY IF EXISTS "admin_update_documents" ON public.documents;
DROP POLICY IF EXISTS "admin_delete_documents" ON public.documents;

CREATE POLICY "staff_select_documents_in_assigned_cases" ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.case_assignments ca WHERE ca.case_id = public.documents.case_id AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "admin_select_all_documents" ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

-- Staff can insert only into assigned cases
-- NOTE: PostgreSQL does not allow subqueries referencing NEW inside WITH CHECK.
-- We'll enforce assignment for INSERT/UPDATE via a trigger instead.
DROP POLICY IF EXISTS "staff_insert_documents_assigned_cases" ON public.documents;

-- Staff can update documents only in assigned cases
CREATE POLICY "staff_update_documents_assigned_cases" ON public.documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.case_assignments ca WHERE ca.case_id = public.documents.case_id AND ca.user_id = auth.uid()
    )
  )
  -- WITH CHECK removed due to NEW-in-subquery limitation; trigger will enforce assignment on UPDATE
  ;

-- Trigger function to enforce that non-admin users can only insert/update documents for assigned cases
DROP FUNCTION IF EXISTS public.enforce_document_assignment();
CREATE FUNCTION public.enforce_document_assignment() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  _role text;
BEGIN
  SELECT role INTO _role FROM public.users WHERE id = auth.uid();
  IF _role IS NULL THEN
    RAISE EXCEPTION 'unauthenticated or user metadata missing';
  END IF;
  IF _role = 'admin' OR _role = 'super_admin' THEN
    RETURN NEW;
  END IF;
  -- For staff, ensure they are assigned to the case
  IF NOT EXISTS (SELECT 1 FROM public.case_assignments ca WHERE ca.case_id = NEW.case_id AND ca.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'user not assigned to case';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_document_assignment_trigger ON public.documents;
CREATE TRIGGER enforce_document_assignment_trigger
  BEFORE INSERT OR UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_document_assignment();

-- Staff cannot delete documents: no DELETE policy for staff. Provide admin delete policy below.
CREATE POLICY "admin_insert_documents" ON public.documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

CREATE POLICY "admin_update_documents" ON public.documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

CREATE POLICY "admin_delete_documents" ON public.documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    )
  );

-- Policies for users table
-- Super Admin: full access
DROP POLICY IF EXISTS "super_admin_select_users" ON public.users;
DROP POLICY IF EXISTS "super_admin_insert_users" ON public.users;
DROP POLICY IF EXISTS "super_admin_update_users" ON public.users;
DROP POLICY IF EXISTS "super_admin_delete_users" ON public.users;

CREATE POLICY "super_admin_select_users" ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_insert_users" ON public.users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_update_users" ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  );

CREATE POLICY "super_admin_delete_users" ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'super_admin'
    )
  );

-- Admin: can SELECT/UPDATE staff only
CREATE POLICY "admin_select_staff" ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','super_admin')
    ) AND role = 'staff'
  );

CREATE POLICY "admin_update_staff" ON public.users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ) AND role = 'staff'
  )
  WITH CHECK (role = 'staff');

CREATE POLICY "admin_delete_staff" ON public.users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
    ) AND role = 'staff'
  );

-- Allow users to SELECT their own metadata
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Ensure functions/triggers to keep `updated_at` current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.cases;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.cases
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_documents ON public.documents;
CREATE TRIGGER set_updated_at_documents
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_users ON public.users;
CREATE TRIGGER set_updated_at_users
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- End of migration
