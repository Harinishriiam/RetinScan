import { Link } from 'react-router-dom';
import {
  Eye, Activity, Shield, Clock, ChevronRight, Star, Users, Zap,
  AlertTriangle, CheckCircle, BarChart3, FileText, Upload
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-md">
              <Eye className="w-4.5 h-4.5 text-white w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800">RetinaAI</span>
              <span className="text-cyan-600 font-bold"> Scan</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-sm text-slate-600 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              Sign In
            </Link>
            <Link to="/auth" className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-5 py-2 rounded-lg hover:from-cyan-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-cyan-500 blur-3xl opacity-20" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 rounded-full bg-teal-400 blur-3xl opacity-20" />
        </div>

        {/* Eye scan visual */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden xl:block opacity-15 pointer-events-none">
          <div className="w-80 h-80 rounded-full border-2 border-cyan-400/50 flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border border-cyan-400/30 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border border-teal-400/30 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400/30 to-teal-400/30" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300 text-xs font-semibold uppercase tracking-wider">AI-Powered Eye Screening</span>
            </div>

            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              Detect Blindness{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">
                Before It Happens
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              Upload retinal fundus images to screen for diabetic retinopathy, glaucoma, and macular degeneration.
              AI-powered analysis with severity grading and referral recommendations in minutes.
            </p>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to="/auth"
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105"
              >
                Start Free Screening
                <ChevronRight className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>No credit card required</span>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-8">
              {[
                { val: '77M+', label: 'Indians with diabetes' },
                { val: '< 5 min', label: 'Analysis time' },
                { val: '3 diseases', label: 'Screened simultaneously' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{val}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Disease Cards */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Three Sight-Threatening Diseases, One Scan</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Our AI simultaneously screens for the leading causes of preventable blindness.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                color: 'from-red-500 to-orange-500',
                bg: 'bg-red-50',
                border: 'border-red-100',
                icon: Activity,
                title: 'Diabetic Retinopathy',
                desc: 'Leading cause of blindness in working-age adults. Affects blood vessels in the retina.',
                stat: 'Grades 0–4',
                badge: 'Most Critical',
                badgeColor: 'bg-red-100 text-red-700',
              },
              {
                color: 'from-cyan-500 to-teal-500',
                bg: 'bg-cyan-50',
                border: 'border-cyan-100',
                icon: Eye,
                title: 'Glaucoma',
                desc: 'Silent thief of sight — damages the optic nerve, often undetected until vision is lost.',
                stat: 'Risk Assessment',
                badge: 'Often Silent',
                badgeColor: 'bg-cyan-100 text-cyan-700',
              },
              {
                color: 'from-amber-500 to-yellow-500',
                bg: 'bg-amber-50',
                border: 'border-amber-100',
                icon: AlertTriangle,
                title: 'Macular Degeneration',
                desc: 'Progressive damage to the macula, affecting central vision needed for reading and faces.',
                stat: '4-Stage Grading',
                badge: 'Age-Related',
                badgeColor: 'bg-amber-100 text-amber-700',
              },
            ].map(({ color, bg, border, icon: Icon, title, desc, stat, badge, badgeColor }) => (
              <div key={title} className={`${bg} border ${border} rounded-2xl p-6 hover:shadow-lg transition-shadow`}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-bold text-slate-800">{title}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{desc}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">How It Works</h2>
            <p className="text-slate-500">Simple 4-step process from upload to report.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cyan-200 via-teal-200 to-cyan-200" />
            {[
              { step: '01', icon: Upload, title: 'Upload Scan', desc: 'Upload a fundus camera image (JPEG/PNG) of the retina.' },
              { step: '02', icon: Zap, title: 'AI Analysis', desc: 'Claude AI analyzes the image for disease markers and severity.' },
              { step: '03', icon: BarChart3, title: 'Graded Report', desc: 'Receive color-coded severity scores for all 3 diseases.' },
              { step: '04', icon: FileText, title: 'Referral Decision', desc: 'Get a plain-English summary and clear referral recommendation.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/20 relative z-10">
                  <Icon className="w-8 h-8 text-white" />
                  <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{step}</span>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-cyan-900 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Built for Clinics & Patients</h2>
            <p className="text-slate-400">Complete platform with tools for both individual patients and healthcare providers.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Severity Grading', desc: 'DR graded 0-4 with color-coded severity for quick triage.' },
              { icon: Users, title: 'Clinic Portal', desc: 'Manage multiple patients, bulk upload scans, download reports.' },
              { icon: BarChart3, title: 'History Tracking', desc: 'Track disease progression over time with trend charts.' },
              { icon: FileText, title: 'Patient Reports', desc: 'Plain-English summaries patients actually understand.' },
              { icon: Clock, title: 'Fast Results', desc: 'AI analysis completes in under 2 minutes per scan.' },
              { icon: Star, title: 'Referral System', desc: 'Clear 5-tier recommendation: from "no action" to "immediate referral".' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statement */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">A Genuine Life-Saving Impact</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            Over 77 million Indians have diabetes, yet most never get an eye screening.
            Diabetic retinopathy is the <strong>leading cause of blindness</strong> in working-age adults —
            but it is almost entirely <strong>preventable</strong> if detected early.
            RetinaAI brings expert-level screening to every clinic and every patient.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-cyan-600 hover:to-teal-700 transition-all shadow-xl shadow-cyan-500/25 text-lg"
          >
            Start Screening Today
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-600">RetinaAI Scan</span>
          </div>
          <p className="text-xs text-slate-400">
            For screening assistance only. Not a substitute for professional medical diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
}
