import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload, Activity, Eye, AlertTriangle, TrendingUp, TrendingDown, Minus,
  Clock, CheckCircle, AlertOctagon, ChevronRight
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Scan, DR_GRADE_LABELS, REFERRAL_LABELS } from '../types';
import { formatDate, formatDateTime, drGradeBg, severityBg, referralBg, severityToNumber } from '../lib/utils';

const STATUS_ICON = {
  pending: Clock,
  processing: Activity,
  completed: CheckCircle,
  failed: AlertOctagon,
};

const STATUS_COLOR = {
  pending: 'text-slate-400',
  processing: 'text-cyan-500',
  completed: 'text-emerald-500',
  failed: 'text-red-500',
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('scans')
      .select('*, patient:patients(*)')
      .eq('uploaded_by', user.id)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setScans((data as Scan[]) || []);
        setLoading(false);
      });
  }, [user]);

  const completedScans = scans.filter(s => s.status === 'completed');

  // Stats
  const totalScans = scans.length;
  const urgentCount = completedScans.filter(
    s => s.referral_recommendation === 'urgent_1_month' || s.referral_recommendation === 'immediate'
  ).length;
  const normalCount = completedScans.filter(s => s.overall_severity === 'normal').length;
  const latestScan = completedScans[0] || null;

  // Chart data
  const chartData = [...completedScans]
    .reverse()
    .slice(-10)
    .map(s => ({
      date: formatDate(s.created_at),
      severity: severityToNumber(s.overall_severity),
      dr: s.dr_grade ?? 0,
    }));

  // Trend
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

  return (
    <Layout>
      <div className="px-6 py-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-slate-500 mt-1">
              {profile?.role === 'doctor'
                ? profile?.clinic_name || 'Your clinic dashboard'
                : 'Your retinal screening history'}
            </p>
          </div>
          <Link
            to="/scan/new"
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
          >
            <Upload className="w-4 h-4" />
            New Scan
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Scans',
              value: totalScans,
              icon: Eye,
              color: 'from-cyan-500 to-teal-600',
              bg: 'bg-cyan-50',
            },
            {
              label: 'Completed',
              value: completedScans.length,
              icon: CheckCircle,
              color: 'from-emerald-500 to-teal-500',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Normal Results',
              value: normalCount,
              icon: Activity,
              color: 'from-sky-500 to-cyan-600',
              bg: 'bg-sky-50',
            },
            {
              label: 'Urgent Cases',
              value: urgentCount,
              icon: AlertTriangle,
              color: urgentCount > 0 ? 'from-red-500 to-orange-500' : 'from-slate-400 to-slate-500',
              bg: urgentCount > 0 ? 'bg-red-50' : 'bg-slate-50',
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 border border-white shadow-sm`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Latest Scan Summary */}
          {latestScan && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Latest Scan</h2>
              <div className="flex gap-4 mb-4">
                {latestScan.image_url ? (
                  <img src={latestScan.image_url} alt="Latest scan" className="w-20 h-20 rounded-xl object-cover bg-slate-900 flex-shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-8 h-8 text-slate-300" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-1">{formatDateTime(latestScan.created_at)}</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${severityBg(latestScan.overall_severity)}`}>
                    {latestScan.overall_severity}
                  </span>
                  {latestScan.dr_grade !== null && (
                    <p className="text-xs text-slate-500 mt-2">
                      DR Grade {latestScan.dr_grade}: {DR_GRADE_LABELS[latestScan.dr_grade]}
                    </p>
                  )}
                </div>
              </div>
              {latestScan.referral_recommendation && (
                <div className={`rounded-xl px-3 py-2 border text-xs font-semibold ${referralBg(latestScan.referral_recommendation)}`}>
                  {REFERRAL_LABELS[latestScan.referral_recommendation]}
                </div>
              )}
              <Link
                to={`/scan/${latestScan.id}`}
                className="mt-3 flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700 font-semibold"
              >
                View full report <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Trend Chart */}
          <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm p-6 ${latestScan ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Severity Trend</h2>
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

            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="severityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px' }}
                    formatter={(v) => [['normal', 'mild', 'moderate', 'severe', 'critical'][(v as number) - 1] || 'N/A', 'Severity']}
                  />
                  <Area type="monotone" dataKey="severity" stroke="#06b6d4" strokeWidth={2} fill="url(#severityGrad)" dot={{ fill: '#06b6d4', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Need 2+ scans to show trend</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scan History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Scan History</h2>
            <Link to="/scan/new" className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1">
              New Scan <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {scans.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">No scans yet</h3>
              <p className="text-sm text-slate-400 mb-4">Upload your first retinal scan to get started</p>
              <Link
                to="/scan/new"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
              >
                <Upload className="w-4 h-4" />
                Upload First Scan
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {scans.map(scan => {
                const StatusIcon = STATUS_ICON[scan.status];
                return (
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
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {scan.patient ? scan.patient.full_name : 'Personal Scan'}
                        </p>
                        <span className="text-xs text-slate-400 capitalize flex-shrink-0">{scan.eye_side} eye</span>
                      </div>
                      <p className="text-xs text-slate-400">{formatDateTime(scan.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {scan.status === 'completed' && scan.overall_severity && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${severityBg(scan.overall_severity)}`}>
                          {scan.overall_severity}
                        </span>
                      )}
                      {scan.status === 'completed' && scan.dr_grade !== null && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border hidden sm:inline-flex ${drGradeBg(scan.dr_grade)}`}>
                          DR {scan.dr_grade}
                        </span>
                      )}
                      <StatusIcon className={`w-4 h-4 ${STATUS_COLOR[scan.status]} ${scan.status === 'processing' ? 'animate-spin' : ''}`} />
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
