import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Eye, LayoutDashboard, Upload, Users, LogOut, Menu, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const patientNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'New Scan', icon: Upload, to: '/scan/new' },
];

const doctorNav = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'New Scan', icon: Upload, to: '/scan/new' },
  { label: 'Patients', icon: Users, to: '/patients' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = profile?.role === 'doctor' ? doctorNav : patientNav;

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : ''}`}>
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md">
          <Eye className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-slate-800 text-sm leading-none">RetinaAI</span>
          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">Screening</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, icon: Icon, to }) => {
          const active = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-cyan-50 text-cyan-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-cyan-600' : 'text-slate-400'}`} />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-cyan-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-700 truncate">{profile?.full_name || 'User'}</p>
            <p className="text-[10px] text-slate-400 capitalize">{profile?.role || 'patient'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 shadow-sm flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50">
            <Sidebar mobile />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-50">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">RetinaAI</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
