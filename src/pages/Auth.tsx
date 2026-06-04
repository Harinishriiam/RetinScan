import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, Mail, Lock, User, Building2, Stethoscope, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

type Mode = 'login' | 'register';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [diabetic, setDiabetic] = useState(false);
  const [hypertensive, setHypertensive] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/dashboard');
      } else {
        if (!fullName.trim()) throw new Error('Full name is required');
        const { error } = await signUp(email, password, {
          full_name: fullName,
          role,
          clinic_name: clinicName,
          license_number: licenseNumber,
          diabetic,
          hypertensive,
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-xl">RetinaAI</span>
            <p className="text-cyan-400 text-xs tracking-widest uppercase">Screening Platform</p>
          </div>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* Mode toggle */}
          <div className="flex border-b border-slate-100">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-4 text-sm font-semibold transition-all ${
                  mode === m
                    ? 'text-cyan-600 border-b-2 border-cyan-500 bg-cyan-50/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <div className="p-8">
            {mode === 'register' && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">I am a</p>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { v: 'patient', label: 'Patient', icon: User, desc: 'Personal screening' },
                    { v: 'doctor', label: 'Doctor / Clinic', icon: Stethoscope, desc: 'Manage patients' },
                  ] as { v: UserRole; label: string; icon: React.ElementType; desc: string }[]).map(({ v, label, icon: Icon, desc }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRole(v)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        role === v
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <div className="text-center">
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs opacity-70">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                      placeholder="Dr. Ramesh Patel / Priya Sharma"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {mode === 'register' && role === 'doctor' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Clinic / Hospital Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={clinicName}
                        onChange={e => setClinicName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        placeholder="City Eye Hospital"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Medical License Number</label>
                    <div className="relative">
                      <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={e => setLicenseNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        placeholder="MCI-12345"
                      />
                    </div>
                  </div>
                </>
              )}

              {mode === 'register' && role === 'patient' && (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={diabetic} onChange={e => setDiabetic(e.target.checked)} className="w-4 h-4 rounded accent-cyan-600" />
                    <span className="text-sm text-slate-600">Diabetic</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={hypertensive} onChange={e => setHypertensive(e.target.checked)} className="w-4 h-4 rounded accent-cyan-600" />
                    <span className="text-sm text-slate-600">Hypertensive</span>
                  </label>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          AI screening tool — not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}
