import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import {
  GraduationCap, BookOpen, Heart, Eye, EyeOff,
  ArrowLeft, CheckCircle2, User, Mail, Lock, Phone,
  Hash, Tag, BookMarked, Loader2, ArrowRight, Sparkles,
} from 'lucide-react';

const ROLES = [
  {
    id: 'teacher',
    label: 'Teacher',
    icon: BookOpen,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    activeBorder: 'border-blue-500',
    activeBg: 'bg-blue-50',
    text: 'text-blue-700',
    desc: 'Educators who manage classes, upload materials & generate reports',
  },
  {
    id: 'student',
    label: 'Student',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-50',
    text: 'text-emerald-700',
    desc: 'Learners who access study materials, reports & learning groups',
  },
  {
    id: 'guardian',
    label: 'Guardian',
    icon: Heart,
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    activeBorder: 'border-orange-500',
    activeBg: 'bg-orange-50',
    text: 'text-orange-700',
    desc: 'Parents & guardians who monitor linked students\' academic progress',
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(1); // 1=select role, 2=fill form, 3=success
  const [role, setRole]         = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm]         = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', studentId: '', grade: '', relationship: '', subjects: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRoleSelect = (r) => { setRole(r); setStep(2); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await api.post('/auth/public-register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        phone: form.phone,
        studentId: form.studentId,
        grade: form.grade,
        relationship: form.relationship,
        subjects: form.subjects ? form.subjects.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.id === role);

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary-600 via-violet-700 to-purple-800 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 dot-grid opacity-10" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-black text-lg tracking-tight">eduCare LMS</h1>
                <p className="text-white/55 text-xs">ERM Platform</p>
              </div>
            </div>
            <Link to="/" className="flex items-center gap-1.5 text-white/55 hover:text-white text-sm transition-colors">
              <ArrowLeft size={14} /> Home
            </Link>
          </div>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-semibold border border-white/15">
              <Sparkles size={12} /> Join eduCare
            </div>
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight">
              Start your<br />learning journey<br />today
            </h2>
            <p className="text-white/65 text-sm leading-relaxed max-w-xs">
              Register your account and an admin will approve it shortly.
              Once approved, you'll have full access to the platform.
            </p>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="relative z-10 space-y-3">
          {[
            { n: 1, label: 'Choose your role' },
            { n: 2, label: 'Fill in your details' },
            { n: 3, label: 'Wait for admin approval' },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                step > n ? 'bg-emerald-400 text-white' : step === n ? 'bg-white text-primary-700' : 'bg-white/15 text-white/50'
              }`}>
                {step > n ? <CheckCircle2 size={14} /> : n}
              </div>
              <span className={`text-sm font-medium ${step >= n ? 'text-white' : 'text-white/45'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile header */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-violet-700 rounded-xl flex items-center justify-center">
                <GraduationCap size={19} className="text-white" />
              </div>
              <span className="font-black text-gray-900">eduCare LMS</span>
            </div>
            <Link to="/" className="text-gray-400 hover:text-primary-600 text-sm transition-colors flex items-center gap-1">
              <ArrowLeft size={13} />Home
            </Link>
          </div>

          {/* ── Step 1: Role Selection ── */}
          {step === 1 && (
            <div className="animate-fade-in-up">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create an account</h2>
                <p className="text-gray-500 mt-1.5 text-sm">Choose your role to get started</p>
              </div>
              <div className="space-y-3">
                {ROLES.map(({ id, label, icon: Icon, gradient, bg, border, text, desc }) => (
                  <button
                    key={id}
                    onClick={() => handleRoleSelect(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-md hover:-translate-y-0.5 ${bg} ${border} hover:${border}`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${text}`}>{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
                    </div>
                    <ArrowRight size={16} className={`flex-shrink-0 ${text} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── Step 2: Registration Form ── */}
          {step === 2 && selectedRole && (
            <div className="animate-fade-in-up">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors">
                <ArrowLeft size={14} /> Back
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedRole.gradient} flex items-center justify-center shadow-sm`}>
                  <selectedRole.icon size={19} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 tracking-tight">Register as {selectedRole.label}</h2>
                  <p className="text-gray-400 text-xs">All fields marked * are required</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4 animate-slide-down">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Name */}
                <div>
                  <label className="label">Full Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.name} onChange={e => set('name', e.target.value)}
                      className="input pl-9" placeholder="John Fernando" required />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="label">Email Address *</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                      className="input pl-9" placeholder="john@example.com" required />
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Password *</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={showPass ? 'text' : 'password'} value={form.password}
                        onChange={e => set('password', e.target.value)}
                        className="input pl-9 pr-9" placeholder="Min 6 chars" required />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Confirm *</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="password" value={form.confirmPassword}
                        onChange={e => set('confirmPassword', e.target.value)}
                        className="input pl-9" placeholder="Repeat" required />
                    </div>
                  </div>
                </div>

                {/* Phone (all roles) */}
                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={form.phone} onChange={e => set('phone', e.target.value)}
                      className="input pl-9" placeholder="+94 77 123 4567" />
                  </div>
                </div>

                {/* Student-specific */}
                {role === 'student' && (
                  <div className="grid grid-cols-2 gap-3 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <div>
                      <label className="label">Student ID</label>
                      <div className="relative">
                        <Hash size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={form.studentId} onChange={e => set('studentId', e.target.value)}
                          className="input pl-9 text-sm" placeholder="STU-2025-..." />
                      </div>
                    </div>
                    <div>
                      <label className="label">Grade / Class</label>
                      <div className="relative">
                        <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input value={form.grade} onChange={e => set('grade', e.target.value)}
                          className="input pl-9 text-sm" placeholder="Grade 10A" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Teacher-specific */}
                {role === 'teacher' && (
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <label className="label">Subjects (comma-separated)</label>
                    <div className="relative">
                      <BookMarked size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input value={form.subjects} onChange={e => set('subjects', e.target.value)}
                        className="input pl-9 text-sm" placeholder="Mathematics, Science, English" />
                    </div>
                  </div>
                )}

                {/* Guardian-specific */}
                {role === 'guardian' && (
                  <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-100">
                    <label className="label">Relationship to Student</label>
                    <div className="relative">
                      <Heart size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 fill-gray-400" />
                      <select value={form.relationship} onChange={e => set('relationship', e.target.value)} className="input pl-9 text-sm">
                        <option value="">Select relationship</option>
                        <option>Father</option>
                        <option>Mother</option>
                        <option>Brother</option>
                        <option>Sister</option>
                        <option>Uncle</option>
                        <option>Aunt</option>
                        <option>Grandparent</option>
                        <option>Legal Guardian</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Info box */}
                <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                  <Sparkles size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    After submitting, an admin will review your request. You'll be able to login once approved.
                  </p>
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full justify-center py-3 text-sm font-bold mt-1">
                  {loading ? <><Loader2 size={15} className="animate-spin" />Submitting...</> : <>Submit Registration <ArrowRight size={15} /></>}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── Step 3: Success ── */}
          {step === 3 && (
            <div className="animate-scale-in text-center py-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-glow-emerald">
                <CheckCircle2 size={38} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Registration Submitted!</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                Your account is now <span className="font-bold text-amber-600">pending admin approval</span>.
                An admin will review and activate your account shortly.
              </p>

              <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2.5 border border-gray-100">
                {[
                  ['Role', selectedRole?.label || role],
                  ['Email', form.email],
                  ['Status', 'Pending Approval'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className={`font-semibold ${k === 'Status' ? 'text-amber-600' : 'text-gray-800'}`}>{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Link to="/login" className="btn-primary w-full justify-center py-3 text-sm">
                  Go to Sign In <ArrowRight size={15} />
                </Link>
                <Link to="/" className="btn-secondary w-full justify-center py-2.5 text-sm">
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
