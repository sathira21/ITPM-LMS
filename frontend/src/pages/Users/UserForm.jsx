import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, User, Shield, BookOpen, GraduationCap, Users2 } from 'lucide-react';
import api from '../../utils/api';

const ROLES = [
  { value: 'admin',    label: 'Admin',    icon: Shield,       desc: 'Full system access' },
  { value: 'teacher',  label: 'Teacher',  icon: BookOpen,     desc: 'Manage students & reports' },
  { value: 'student',  label: 'Student',  icon: GraduationCap,desc: 'Access learning content' },
  { value: 'guardian', label: 'Guardian', icon: Users2,       desc: 'Monitor linked student' },
];

const RELATIONSHIPS = ['Father', 'Mother', 'Uncle', 'Aunt', 'Sibling', 'Legal Guardian', 'Other'];

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student',
    phone: '', address: '', studentId: '', grade: '',
    subjects: '', relationship: 'Father',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/users/${id}`).then(({ data }) => {
        const u = data.user;
        setForm({
          name: u.name || '', email: u.email || '', password: '',
          role: u.role || 'student', phone: u.phone || '',
          address: u.address || '', studentId: u.studentId || '',
          grade: u.grade || '', subjects: u.subjects?.join(', ') || '',
          relationship: u.relationship || 'Father',
        });
      });
    }
  }, [id, isEdit]);


  // add validations for user managment phone number
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (form.phone && form.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }
    try {
      const payload = {
        ...form,
        subjects: form.subjects ? form.subjects.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (!payload.password && isEdit) delete payload.password;

      if (isEdit) await api.put(`/users/${id}`, payload);
      else await api.post('/users', payload);
      navigate('/dashboard/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard/users')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit User' : 'Add New User'}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? 'Update user information' : 'Create a new platform user'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Role selector */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Select Role</h3>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: value }))}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  form.role === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${form.role === value ? 'bg-primary-100' : 'bg-gray-100'}`}>
                  <Icon size={17} className={form.role === value ? 'text-primary-600' : 'text-gray-500'} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${form.role === value ? 'text-primary-700' : 'text-gray-800'}`}>{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800">Basic Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Email Address *</label>
              <input className="input" type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required={!isEdit} minLength={6} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                type="tel"
                placeholder="0712345678"
                value={form.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm((f) => ({ ...f, phone: value }));
                }}
                maxLength={10}
              />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input className="input" placeholder="123 Main Street, Colombo" value={form.address} onChange={set('address')} />
          </div>
        </div>

        {/* Role-specific fields */}
        {form.role === 'student' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-800">Student Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Student ID</label>
                <input className="input" placeholder="STU-2024-001" value={form.studentId} onChange={set('studentId')} />
              </div>
              <div>
                <label className="label">Grade / Class</label>
                <input className="input" placeholder="Grade 10A" value={form.grade} onChange={set('grade')} />
              </div>
            </div>
          </div>
        )}
        {form.role === 'teacher' && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Teacher Details</h3>
            <label className="label">Subjects (comma-separated)</label>
            <input className="input" placeholder="Mathematics, Science, English" value={form.subjects} onChange={set('subjects')} />
          </div>
        )}
        {form.role === 'guardian' && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Guardian Details</h3>
            <label className="label">Relationship to Student</label>
            <select className="input" value={form.relationship} onChange={set('relationship')}>
              {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard/users')} className="btn-secondary flex-1 justify-center py-2.5">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2"><Save size={15} />{isEdit ? 'Save Changes' : 'Create User'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
