import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Eye, EyeOff, LogIn, BookOpen, Users2, ArrowLeft, Heart } from 'lucide-react';

const QUICK_ACCOUNTS = [
  { role: 'teacher',  email: 'teacher@lms.com',  password: 'teacher123',  icon: BookOpen,      color: 'from-blue-500 to-cyan-500',       label: 'Teacher' },
  { role: 'student',  email: 'student@lms.com',  password: 'student123',  icon: GraduationCap, color: 'from-emerald-500 to-teal-500',   label: 'Student' },
  { role: 'guardian', email: 'guardian@lms.com', password: 'guardian123', icon: Heart,         color: 'from-orange-500 to-amber-500',    label: 'Guardian' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-violet-700 to-purple-800 relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">eduCare LMS</h1>
                <p className="text-white/60 text-sm">ERM Platform</p>
              </div>
            </div>
            <Link to="/" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
              <ArrowLeft size={14} /> Back to home
            </Link>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Empowering<br />Education<br />Together
            </h2>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              A unified platform connecting admins, teachers, students, and guardians through
              intelligent relationship management.
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[
            { label: 'Guardian–Student Linking', desc: 'Smart family connections' },
            { label: 'Role-Based Access', desc: 'Fine-grained permissions' },
            { label: 'Academic Reports', desc: 'Detailed performance data' },
            { label: 'Learning Communities', desc: 'Self-enrolled groups' },
          ].map((f) => (
            <div key={f.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-white font-semibold text-sm">{f.label}</p>
              <p className="text-white/60 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-violet-700 rounded-xl flex items-center justify-center">
                <GraduationCap size={22} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">eduCare LMS</h1>
                <p className="text-gray-500 text-xs">ERM Platform</p>
              </div>
            </div>
            <Link to="/" className="flex items-center gap-1 text-gray-400 hover:text-primary-600 text-sm transition-colors">
              <ArrowLeft size={13} /> Home
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Quick login cards — Teacher / Student / Guardian only */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {QUICK_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  onClick={() => quickLogin(acc)}
                  title={`Quick login as ${acc.label}`}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all group"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center shadow-sm`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-primary-700">{acc.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 text-center mb-6">Click a role above to auto-fill credentials</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-slide-up">
                {error}
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-base font-semibold bg-gradient-to-r from-primary-600 to-violet-600 hover:from-primary-700 hover:to-violet-700 shadow-lg shadow-primary-500/25 border-0 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} />
                  Sign In
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              New to eduCare?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                Create an account
              </Link>
            </p>
            <p className="text-xs text-gray-400 mt-3">
              eduCare LMS — Educational Relationship Management Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
