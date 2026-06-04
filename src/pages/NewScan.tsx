import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Eye, X, ChevronRight, AlertTriangle, Camera } from 'lucide-react';
import { supabase, getPublicImageUrl } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Patient } from '../types';

export default function NewScan() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [eyeSide, setEyeSide] = useState<'left' | 'right' | 'unknown'>('unknown');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState<'idle' | 'uploading' | 'analyzing' | 'done'>('idle');
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (profile?.role === 'doctor' && user) {
      supabase.from('patients').select('*').eq('doctor_id', user.id).order('full_name')
        .then(({ data }) => setPatients(data || []));
    }
  }, [user, profile]);

  function handleFile(f: File) {
    if (!f.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setError('Please upload a JPEG or PNG image.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }
    setError('');
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !user) return;

    setError('');
    setUploading(true);
    setStage('uploading');

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('retinal-scans')
        .upload(path, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const imageUrl = getPublicImageUrl(path);

      const { data: scan, error: scanError } = await supabase
        .from('scans')
        .insert({
          uploaded_by: user.id,
          patient_id: selectedPatient || null,
          image_path: path,
          image_url: imageUrl,
          eye_side: eyeSide,
          status: 'pending',
        })
        .select()
        .single();

      if (scanError) throw scanError;

      setStage('analyzing');

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-retina`;
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scan_id: scan.id, image_url: imageUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }

      setStage('done');

      setTimeout(() => navigate(`/scan/${scan.id}`), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStage('idle');
    } finally {
      setUploading(false);
    }
  }

  const stageInfo = {
    uploading: { label: 'Uploading image...', pct: 30 },
    analyzing: { label: 'AI analyzing retinal scan...', pct: 75 },
    done: { label: 'Analysis complete! Redirecting...', pct: 100 },
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">New Retinal Scan</h1>
          <p className="text-slate-500 mt-1">Upload a fundus camera image for AI screening</p>
        </div>

        {stage !== 'idle' ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Eye className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {stageInfo[stage as keyof typeof stageInfo]?.label}
            </h2>
            <p className="text-slate-500 text-sm mb-8">Please wait — do not close this window</p>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
              <div
                className="h-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all duration-700"
                style={{ width: `${stageInfo[stage as keyof typeof stageInfo]?.pct || 0}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">{stageInfo[stage as keyof typeof stageInfo]?.pct}% complete</p>

            {stage === 'analyzing' && (
              <div className="mt-6 bg-cyan-50 rounded-xl p-4 text-left">
                <p className="text-xs font-semibold text-cyan-700 mb-2">Screening for:</p>
                {['Diabetic Retinopathy (Grade 0–4)', 'Glaucoma indicators', 'Macular degeneration signs'].map(d => (
                  <div key={d} className="flex items-center gap-2 text-xs text-cyan-600 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Area */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Fundus Image *</label>
              <div
                className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                  dragOver ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50'
                } ${preview ? 'border-cyan-300 bg-cyan-50/50' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                />

                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Retinal scan preview" className="w-full h-64 object-contain rounded-2xl p-2" />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFile(null); setPreview(''); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                      {file?.name}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <Camera className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="font-semibold text-slate-700 mb-1">Drop your fundus image here</p>
                    <p className="text-sm text-slate-400 mb-3">or click to browse</p>
                    <p className="text-xs text-slate-400">JPEG, PNG, WebP — max 10MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Eye Side */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Eye Side</label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { v: 'left', label: 'Left Eye (OS)' },
                  { v: 'right', label: 'Right Eye (OD)' },
                  { v: 'unknown', label: 'Unknown' },
                ] as { v: 'left' | 'right' | 'unknown'; label: string }[]).map(({ v, label }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setEyeSide(v)}
                    className={`py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      eyeSide === v
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient Selection (doctors only) */}
            {profile?.role === 'doctor' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Assign to Patient (optional)</label>
                <select
                  value={selectedPatient}
                  onChange={e => setSelectedPatient(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 text-slate-700"
                >
                  <option value="">— Select patient —</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Screening Tool Only</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  AI results are for screening assistance. Always confirm with a qualified ophthalmologist before clinical decisions.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              <Upload className="w-5 h-5" />
              Analyze Retinal Scan
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}
