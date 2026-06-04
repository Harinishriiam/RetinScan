export type UserRole = 'patient' | 'doctor';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone: string;
  clinic_name: string;
  license_number: string;
  date_of_birth: string | null;
  gender: '' | 'male' | 'female' | 'other';
  diabetic: boolean;
  hypertensive: boolean;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  doctor_id: string;
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  gender: '' | 'male' | 'female' | 'other';
  diabetic: boolean;
  hypertensive: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  scan_count?: number;
  last_scan?: Scan | null;
}

export type DRGrade = 0 | 1 | 2 | 3 | 4;
export type GlaucomaRisk = 'low' | 'moderate' | 'high' | 'suspect';
export type AMDRisk = 'none' | 'early' | 'intermediate' | 'advanced';
export type OverallSeverity = 'normal' | 'mild' | 'moderate' | 'severe' | 'critical';
export type ReferralRecommendation =
  | 'no_action'
  | 'monitor_6_months'
  | 'schedule_3_months'
  | 'urgent_1_month'
  | 'immediate';
export type ScanStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type EyeSide = 'left' | 'right' | 'unknown';

export interface Scan {
  id: string;
  patient_id: string | null;
  uploaded_by: string;
  image_path: string;
  image_url: string;
  eye_side: EyeSide;
  status: ScanStatus;
  dr_grade: DRGrade | null;
  dr_confidence: number | null;
  glaucoma_risk: GlaucomaRisk | null;
  glaucoma_confidence: number | null;
  amd_risk: AMDRisk | null;
  amd_confidence: number | null;
  overall_severity: OverallSeverity | null;
  referral_recommendation: ReferralRecommendation | null;
  clinical_findings: string[];
  patient_summary: string;
  ai_notes: string;
  error_message: string;
  created_at: string;
  updated_at: string;
  patient?: Patient | null;
}

export const DR_GRADE_LABELS: Record<DRGrade, string> = {
  0: 'No Diabetic Retinopathy',
  1: 'Mild DR',
  2: 'Moderate DR',
  3: 'Severe DR',
  4: 'Proliferative DR',
};

export const SEVERITY_COLORS: Record<OverallSeverity, string> = {
  normal: 'text-emerald-600',
  mild: 'text-yellow-600',
  moderate: 'text-orange-500',
  severe: 'text-red-600',
  critical: 'text-red-800',
};

export const SEVERITY_BG: Record<OverallSeverity, string> = {
  normal: 'bg-emerald-50 border-emerald-200',
  mild: 'bg-yellow-50 border-yellow-200',
  moderate: 'bg-orange-50 border-orange-200',
  severe: 'bg-red-50 border-red-200',
  critical: 'bg-red-100 border-red-400',
};

export const REFERRAL_LABELS: Record<ReferralRecommendation, string> = {
  no_action: 'No Action Needed',
  monitor_6_months: 'Monitor in 6 Months',
  schedule_3_months: 'Schedule Eye Exam (3 Months)',
  urgent_1_month: 'Urgent Referral (Within 1 Month)',
  immediate: 'Immediate Referral Required',
};

export const REFERRAL_COLORS: Record<ReferralRecommendation, string> = {
  no_action: 'emerald',
  monitor_6_months: 'yellow',
  schedule_3_months: 'orange',
  urgent_1_month: 'red',
  immediate: 'red',
};
