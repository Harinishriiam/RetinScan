import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Eye, CheckCircle, ChevronRight, Calendar, Phone, Mail, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Patient, Scan, DR_GRADE_LABELS, REFERRAL_LABELS } from '../types';
import { formatDate, formatDateTime, calcAge, severityBg, severityToNumber } from '../lib/utils';

const BAR_COLORS = ['#10b981', '#fbbf24', '#f97316', '#ef4444', '#991b1b'];

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    Promise.all([
      supabase.from('patients').select('*').eq('id', id).eq('doctor_id', user.id).maybeSingle(),
      supabase.from('scans').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
    ]).then(([{ data: patientData }, { data: scanData }]) => {
      setPatient(patientData);
      setScans((scanData as Scan[]) || []);
      setLoading(false);
    });
  }, [id, user]);

  const completedScans = scans.filter(s => s.status === 'completed');

  const chartData = [...completedScans].reverse().map((s, i) => ({
    label: `Scan ${i + 1}`,
    date: formatDate(s.created_at),
    severity: severityToNumber(s.overall_severity),
    dr: s.dr_grade ?? 0,
  }));

  function getTrend() {
    if (completedScans.length < 2) return null;
    const latest = severityToNumber(completedScans[0].overall_severity);
    const prev = severityToNumber(completedScans[1].overall_severity);
    if (latest < prev) return 'improving';
    if (latest > prev) return 'worsening';
    return 'stable';
  }
  const trend = getTrend();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="w-10 h-10 border-[3px] border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-slate-500">Patient not found.</p>
            <Link to="/patients" className="text-cyan-600 text-sm mt-2 inline-block">Back to Patients</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/patients" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xl font-bold">
                {patient.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{patient.full_name}</h1>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                  {patient.date_of_birth && <span>{calcAge(patient.date_of_birth)}</span>}
                  {patient.gender && <span className="capitalize">{patient.gender}</span>}
                  <span>{scans.length} scan{scans.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>
          <Link
            to={`/scan/new`}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
          >
            <Upload className="w-4 h-4" />
            New Scan
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Patient Info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Patient Info</h2>
            <div className="space-y-3">
              {patient.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600 truncate">{patient.email}</span>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">{patient.phone}</span>
                </div>
              )}
              {patient.date_of_birth && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">{formatDate(patient.date_of_birth)}</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {patient.diabetic && (
                  <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Diabetic</span>
                )}
                {patient.hypertensive && (
                  <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">Hypertensive</span>
                )}
              </div>
              {patient.notes && (
                <div className="pt-2 border-t border-slate-50">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{patient.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            {[
              { label: 'Total Scans', value: scans.length, icon: Eye, color: 'from-cyan-500 to-teal-600' },
              { label: 'Completed', value: completedScans.length, icon: CheckCircle, color: 'from-emerald-500 to-teal-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{value}</p>
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trend */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disease Trend</h2>
              {trend && (
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                  trend === 'improving' ? 'bg-emerald-50 text-emerald-700' :
                  trend === 'worsening' ? 'bg-red-50 text-red-700' :
                  'bg-slate-50 text-slate-500'
                }`}>
                  {trend === 'improving' ? <TrendingDown className="w-3 h-3" /> :
                   trend === 'worsening' ? <TrendingUp className="w-3 h-3" /> :
                   <Minus className="w-3 h-3" />}
                  {trend.charAt(0).toUpperCase() + trend.slice(1)}
                </div>
              )}
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={chartData} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} hide />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '11px' }}
                    formatter={(v, _, props) => [
                      ['normal', 'mild', 'moderate', 'severe', 'critical'][(v as number) - 1] || 'N/A',
                      (props.payload as { date?: string })?.date || ''
                    ]}
                  />
                  <Bar dataKey="severity" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={BAR_COLORS[Math.min(entry.severity - 1, 4)] || '#e2e8f0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <p className="text-slate-300 text-sm">No completed scans</p>
              </div>
            )}
          </div>
        </div>

        {/* Scan History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Scan History</h2>
          </div>
          {scans.length === 0 ? (
            <div className="py-12 text-center">
              <Eye className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No scans for this patient yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {scans.map(scan => (
                <Link
                  key={scan.id}
                  to={`/scan/${scan.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  {scan.image_url ? (
                    <img src={scan.image_url} alt="" className="w-12 h-12 rounded-xl object-cover bg-slate-900 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Eye className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-0.5">{formatDateTime(scan.created_at)} · {scan.eye_side} eye</p>
                    {scan.status === 'completed' && (
                      <p className="text-sm text-slate-600">
                        {scan.dr_grade !== null ? DR_GRADE_LABELS[scan.dr_grade] : 'DR: N/A'}
                        {scan.referral_recommendation && (
                          <span className="text-slate-400"> · {REFERRAL_LABELS[scan.referral_recommendation]}</span>
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {scan.status === 'completed' && scan.overall_severity && (
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${severityBg(scan.overall_severity)}`}>
                        {scan.overall_severity}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
