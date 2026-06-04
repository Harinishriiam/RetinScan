/*
  # Retina Scan Platform - Complete Database Schema

  ## Overview
  Full schema for an AI-powered retinal screening platform supporting patients and clinic doctors.

  ## New Tables

  ### 1. profiles
  - Extends Supabase auth.users with role info
  - `id` - matches auth.uid()
  - `role` - 'patient' or 'doctor'
  - `full_name`, `email`, `phone`
  - `clinic_name`, `license_number` - doctor-specific fields
  - `date_of_birth`, `gender`, `diabetic`, `hypertensive` - patient-specific fields

  ### 2. patients
  - Patient records managed by doctors in clinics
  - `doctor_id` - references profiles (doctor)
  - `full_name`, `email`, `phone`, `date_of_birth`, `gender`
  - `diabetic`, `hypertensive`, `notes`

  ### 3. scans
  - Retinal scan uploads and AI analysis results
  - `patient_id` - references patients (or null if patient self-uploaded)
  - `uploaded_by` - references profiles
  - `image_path` - Supabase Storage path
  - `status` - 'pending' | 'processing' | 'completed' | 'failed'
  - Disease grades and findings stored as JSONB
  - `dr_grade` (0-4), `glaucoma_risk`, `amd_risk`
  - `referral_recommendation`, `patient_summary`, `clinical_findings`

  ## Security
  - RLS enabled on all tables
  - Patients can only read their own data
  - Doctors can manage their own patients and scans
  - Profiles are user-owned
*/

-- =====================
-- PROFILES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor')),
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  clinic_name text DEFAULT '',
  license_number text DEFAULT '',
  date_of_birth date,
  gender text DEFAULT '' CHECK (gender IN ('', 'male', 'female', 'other')),
  diabetic boolean DEFAULT false,
  hypertensive boolean DEFAULT false,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================
-- PATIENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  date_of_birth date,
  gender text DEFAULT '' CHECK (gender IN ('', 'male', 'female', 'other')),
  diabetic boolean DEFAULT false,
  hypertensive boolean DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can select own patients"
  ON patients FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete own patients"
  ON patients FOR DELETE
  TO authenticated
  USING (doctor_id = auth.uid());

-- =====================
-- SCANS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE SET NULL,
  uploaded_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_path text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  eye_side text DEFAULT 'unknown' CHECK (eye_side IN ('left', 'right', 'unknown')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Disease Detection Results
  dr_grade integer DEFAULT NULL CHECK (dr_grade IS NULL OR (dr_grade >= 0 AND dr_grade <= 4)),
  dr_confidence numeric DEFAULT NULL,
  glaucoma_risk text DEFAULT NULL CHECK (glaucoma_risk IS NULL OR glaucoma_risk IN ('low', 'moderate', 'high', 'suspect')),
  glaucoma_confidence numeric DEFAULT NULL,
  amd_risk text DEFAULT NULL CHECK (amd_risk IS NULL OR amd_risk IN ('none', 'early', 'intermediate', 'advanced')),
  amd_confidence numeric DEFAULT NULL,

  -- Overall Assessment
  overall_severity text DEFAULT NULL CHECK (overall_severity IS NULL OR overall_severity IN ('normal', 'mild', 'moderate', 'severe', 'critical')),
  referral_recommendation text DEFAULT NULL CHECK (referral_recommendation IS NULL OR referral_recommendation IN ('no_action', 'monitor_6_months', 'schedule_3_months', 'urgent_1_month', 'immediate')),

  -- Detailed Findings
  clinical_findings jsonb DEFAULT '[]'::jsonb,
  patient_summary text DEFAULT '',
  ai_notes text DEFAULT '',
  error_message text DEFAULT '',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own scans"
  ON scans FOR SELECT
  TO authenticated
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM patients p
      WHERE p.id = scans.patient_id AND p.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scans"
  ON scans FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update own scans"
  ON scans FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can delete own scans"
  ON scans FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_scans_uploaded_by ON scans(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_scans_patient_id ON scans(patient_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scans_updated_at
  BEFORE UPDATE ON scans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
