import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Eye, Activity, AlertTriangle, CheckCircle, Clock,
  AlertOctagon, Printer, RefreshCw, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Layout from '../components/layout/Layout';
import { Scan, DR_GRADE_LABELS, REFERRAL_LABELS } from '../types';
import {
  formatDateTime, confidencePct, drGradeBg, glaucomaBg, amdBg, severityBg, referralBg
} from '../lib/utils';

const REFERRAL_ICONS = {
  no_action: CheckCircle,
  monitor_6_months: Clock,
  schedule_3_months: Activity,
  urgent_1_month: AlertTriangle,
  immediate: AlertOctagon,
};

export default function ScanDetail() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchScan() {
    if (!id) return;
    const { data } = await supabase
      .from('scans')
      .select('*, patient:patients(*)')
      .eq('id', id)
      .maybeSingle();
    setScan(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchScan();
    // Poll if still processing
    const interval = setInterval(() => {
      if (scan?.status === 'processing' || scan?.status === 'pending') fetchScan();
    }, 3000);
    return () => clearInterval(interval);
  }, [id, scan?.status]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin border-[3px]" />
            <p className="text-slate-500 text-sm">Loading scan...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!scan) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-slate-500">Scan not found.</p>
            <Link to="/dashboard" className="text-cyan-600 text-sm mt-2 inline-block">Back to Dashboard</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const drGrade = scan.dr_grade;
  const ReferralIcon = REFERRAL_ICONS[scan.referral_recommendation || 'no_action'];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8 print:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 print:hidden">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Scan Report</h1>
              <p className="text-sm text-slate-500">{formatDateTime(scan.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(scan.status === 'pending' || scan.status === 'processing') && (
              <button onClick={fetchScan} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
          </div>
        </div>

        {/* Processing state */}
        {(scan.status === 'pending' || scan.status === 'processing') && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-8 text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">AI Analysis In Progress</h2>
            <p className="text-slate-500 text-sm">Your retinal scan is being analyzed. This page will auto-refresh.</p>
            <div className="mt-4 flex justify-center gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Failed state */}
        {scan.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-6 h-6 text-red-500" />
              <div>
                <h2 className="font-bold text-red-800">Analysis Failed</h2>
                <p className="text-sm text-red-600 mt-1">{scan.error_message || 'An error occurred during analysis.'}</p>
              </div>
            </div>
          </div>
        )}

        {scan.status === 'completed' && (
          <>
            {/* Print header */}
            <div className="hidden print:block mb-8 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">RetinaAI Screening Report</h1>
                  <p className="text-sm text-slate-500">{formatDateTime(scan.created_at)}</p>
                </div>
              </div>
              {scan.patient && <p className="text-sm text-slate-600 mt-2">Patient: <strong>{scan.patient.full_name}</strong></p>}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left: Image + Overview */}
              <div className="space-y-6">
                {/* Scan image */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-slate-900 flex items-center justify-center" style={{ minHeight: '220px' }}>
                    {scan.image_url ? (
                      <img src={scan.image_url} alt="Retinal scan" className="max-h-64 w-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400 py-12">
                        <Eye className="w-12 h-12 opacity-30" />
                        <p className="text-xs">Image unavailable</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-slate-500 capitalize">{scan.eye_side} eye</span>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Analysis Complete
                    </span>
                  </div>
                </div>

                {/* Overall severity */}
                <div className={`rounded-2xl border p-5 ${severityBg(scan.overall_severity)}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Overall Severity</p>
                  <p className="text-3xl font-bold capitalize">{scan.overall_severity || 'N/A'}</p>
                </div>

                {/* Referral */}
                <div className={`rounded-2xl border p-5 ${referralBg(scan.referral_recommendation)}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
                      <ReferralIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">Referral Recommendation</p>
                      <p className="font-bold text-lg leading-tight">
                        {REFERRAL_LABELS[scan.referral_recommendation || 'no_action']}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient summary */}
                {scan.patient_summary && (
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4 text-sky-600" />
                      <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Patient Summary</p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{scan.patient_summary}</p>
                  </div>
                )}
              </div>

              {/* Right: Disease Results */}
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Disease Screening Results</h2>

                {/* DR */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="font-semibold text-slate-700">Diabetic Retinopathy</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${drGradeBg(drGrade)}`}>
                      Grade {drGrade ?? 'N/A'}
                    </span>
                  </div>

                  {/* Grade bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                      <span>None</span>
                      <span>Proliferative</span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(g => (
                        <div
                          key={g}
                          className={`flex-1 h-3 rounded-full transition-all ${
                            drGrade !== null && g <= drGrade
                              ? g === 0 ? 'bg-emerald-400'
                              : g === 1 ? 'bg-yellow-400'
                              : g === 2 ? 'bg-orange-400'
                              : g === 3 ? 'bg-red-500'
                              : 'bg-red-700'
                              : 'bg-slate-100'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {[0, 1, 2, 3, 4].map(g => (
                        <div key={g} className="flex-1 text-center">
                          <span className={`text-[10px] ${drGrade === g ? 'font-bold text-slate-700' : 'text-slate-300'}`}>{g}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-700">{drGrade !== null ? DR_GRADE_LABELS[drGrade] : 'N/A'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">AI confidence: {confidencePct(scan.dr_confidence)}</p>
                </div>

                {/* Glaucoma */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <Eye className="w-4 h-4 text-cyan-600" />
                      </div>
                      <span className="font-semibold text-slate-700">Glaucoma</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${glaucomaBg(scan.glaucoma_risk)}`}>
                      {scan.glaucoma_risk || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">AI confidence: {confidencePct(scan.glaucoma_confidence)}</p>
                </div>

                {/* AMD */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      </div>
                      <span className="font-semibold text-slate-700">Macular Degeneration</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${amdBg(scan.amd_risk)}`}>
                      {scan.amd_risk || 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">AI confidence: {confidencePct(scan.amd_confidence)}</p>
                </div>

                {/* Clinical Findings */}
                {scan.clinical_findings?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-slate-700 mb-3">Clinical Findings</h3>
                    <ul className="space-y-2">
                      {scan.clinical_findings.map((finding, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-slate-500">
                            {i + 1}
                          </div>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Notes */}
                {scan.ai_notes && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">AI Notes</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{scan.ai_notes}</p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    This AI screening report is for assistance only. Always confirm findings with a qualified ophthalmologist.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
