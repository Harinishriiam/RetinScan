import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserPlus, Search, ChevronRight, X, Check,
  Calendar, Phone, Mail, Stethoscope
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Patient } from '../types';
import { formatDate, calcAge } from '../lib/utils';

export default function PatientList() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', date_of_birth: '',
    gender: '' as '' | 'male' | 'female' | 'other',
    diabetic: false, hypertensive: false, notes: '',
  });

  async function fetchPatients() {
    if (!user) return;
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('doctor_id', user.id)
      .order('full_name');
    setPatients((data as Patient[]) || []);
    setLoading(false);
  }

  useEffect(() => { fetchPatients(); }, [user]);

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.full_name.trim()) return;
    setSaving(true);
    setSaveError('');

    const { error } = await supabase.from('patients').insert({
      doctor_id: user.id,
      ...form,
      date_of_birth: form.date_of_birth || null,
    });

    if (error) {
      setSaveError(error.message);
    } else {
      setShowAdd(false);
      setForm({ full_name: '', email: '', phone: '', date_of_birth: '', gender: '', diabetic: false, hypertensive: false, notes: '' });
      fetchPatients();
    }
    setSaving(false);
  }

  const filtered = patients.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
            <p className="text-slate-500 mt-1">{patients.length} patient{patients.length !== 1 ? 's' : ''} registered</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Patient
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients by name or email..."
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-white"
          />
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-300" />
              </div>
              {patients.length === 0 ? (
                <>
                  <h3 className="font-semibold text-slate-700 mb-1">No patients yet</h3>
                  <p className="text-sm text-slate-400 mb-4">Add your first patient to start managing their retinal scans</p>
                  <button
                    onClick={() => setShowAdd(true)}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add First Patient
                  </button>
                </>
              ) : (
                <p className="text-slate-400">No patients match your search.</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(patient => (
                <Link
                  key={patient.id}
                  to={`/patients/${patient.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {patient.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-slate-700">{patient.full_name}</p>
                      <div className="flex gap-1">
                        {patient.diabetic && (
                          <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">D</span>
                        )}
                        {patient.hypertensive && (
                          <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">H</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      {patient.date_of_birth && <span>{calcAge(patient.date_of_birth)}</span>}
                      {patient.gender && <span className="capitalize">{patient.gender}</span>}
                      {patient.email && <span className="truncate max-w-[180px]">{patient.email}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-slate-400">
                    <span className="text-xs text-slate-400">Added {formatDate(patient.created_at)}</span>
                    <ChevronRight className="w-4 h-4 group-hover:text-slate-600 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                  <Stethoscope className="w-4.5 h-4.5 text-white w-5 h-5" />
                </div>
                <h2 className="font-bold text-slate-800">Add New Patient</h2>
              </div>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPatient} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    placeholder="Patient full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="patient@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={form.date_of_birth}
                      onChange={e => setForm(f => ({ ...f, date_of_birth: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>
                  <select
                    value={form.gender}
                    onChange={e => setForm(f => ({ ...f, gender: e.target.value as '' | 'male' | 'female' | 'other' }))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-700"
                  >
                    <option value="">— Select —</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.diabetic} onChange={e => setForm(f => ({ ...f, diabetic: e.target.checked }))} className="w-4 h-4 rounded accent-cyan-600" />
                  <span className="text-sm text-slate-600">Diabetic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.hypertensive} onChange={e => setForm(f => ({ ...f, hypertensive: e.target.checked }))} className="w-4 h-4 rounded accent-cyan-600" />
                  <span className="text-sm text-slate-600">Hypertensive</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                  rows={3}
                  placeholder="Medical history, medications, etc."
                />
              </div>

              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-700">{saveError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Add Patient
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
