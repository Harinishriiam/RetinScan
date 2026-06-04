import {
  DRGrade,
  GlaucomaRisk,
  AMDRisk,
  OverallSeverity,
  ReferralRecommendation,
} from '../types';

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calcAge(dob: string | null): string {
  if (!dob) return 'N/A';
  const diff = Date.now() - new Date(dob).getTime();
  const age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  return `${age} yrs`;
}

export function confidencePct(val: number | null): string {
  if (val === null) return 'N/A';
  return `${Math.round(val * 100)}%`;
}

export function drGradeColor(grade: DRGrade | null): string {
  if (grade === null) return 'text-slate-400';
  const map: Record<DRGrade, string> = {
    0: 'text-emerald-600',
    1: 'text-yellow-500',
    2: 'text-orange-500',
    3: 'text-red-500',
    4: 'text-red-700',
  };
  return map[grade];
}

export function drGradeBg(grade: DRGrade | null): string {
  if (grade === null) return 'bg-slate-100';
  const map: Record<DRGrade, string> = {
    0: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    1: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    2: 'bg-orange-100 text-orange-800 border-orange-200',
    3: 'bg-red-100 text-red-800 border-red-200',
    4: 'bg-red-200 text-red-900 border-red-400',
  };
  return map[grade];
}

export function glaucomaBg(risk: GlaucomaRisk | null): string {
  if (!risk) return 'bg-slate-100 text-slate-500';
  const map: Record<GlaucomaRisk, string> = {
    low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
    suspect: 'bg-red-200 text-red-900 border-red-400',
  };
  return map[risk];
}

export function amdBg(risk: AMDRisk | null): string {
  if (!risk) return 'bg-slate-100 text-slate-500';
  const map: Record<AMDRisk, string> = {
    none: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    early: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    intermediate: 'bg-orange-100 text-orange-800 border-orange-200',
    advanced: 'bg-red-100 text-red-800 border-red-200',
  };
  return map[risk];
}

export function severityBg(severity: OverallSeverity | null): string {
  if (!severity) return 'bg-slate-100 text-slate-500';
  const map: Record<OverallSeverity, string> = {
    normal: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    mild: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    moderate: 'bg-orange-100 text-orange-800 border-orange-200',
    severe: 'bg-red-100 text-red-800 border-red-200',
    critical: 'bg-red-200 text-red-900 border-red-400',
  };
  return map[severity];
}

export function referralBg(rec: ReferralRecommendation | null): string {
  if (!rec) return 'bg-slate-100 text-slate-500';
  const map: Record<ReferralRecommendation, string> = {
    no_action: 'bg-emerald-50 border-emerald-300 text-emerald-800',
    monitor_6_months: 'bg-sky-50 border-sky-300 text-sky-800',
    schedule_3_months: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    urgent_1_month: 'bg-orange-50 border-orange-400 text-orange-800',
    immediate: 'bg-red-50 border-red-400 text-red-900',
  };
  return map[rec];
}

export function severityToNumber(severity: OverallSeverity | null): number {
  if (!severity) return 0;
  const map: Record<OverallSeverity, number> = {
    normal: 1,
    mild: 2,
    moderate: 3,
    severe: 4,
    critical: 5,
  };
  return map[severity];
}
