import { useEffect, useState } from 'react';
import { Link2, Plus, Trash2, Users2, GraduationCap, RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';

const RELATIONSHIP_COLOR = {
  Father: 'bg-blue-100 text-blue-700', Mother: 'bg-pink-100 text-pink-700',
  Uncle: 'bg-indigo-100 text-indigo-700', Aunt: 'bg-purple-100 text-purple-700',
  Sibling: 'bg-teal-100 text-teal-700', 'Legal Guardian': 'bg-orange-100 text-orange-700',
  Other: 'bg-gray-100 text-gray-700',
};

const RELATIONSHIPS = ['Father', 'Mother', 'Uncle', 'Aunt', 'Sibling', 'Legal Guardian', 'Other'];

export default function GuardianLinks() {
  const [links, setLinks] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ guardianId: '', studentId: '', relationship: 'Father' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchLinks = async () => {
    setLoading(true);
    const { data } = await api.get('/guardians/links');
    setLinks(data.links);
    setLoading(false);
  };

  useEffect(() => {
    fetchLinks();
    api.get('/users?role=guardian&limit=100').then((r) => setGuardians(r.data.users));
    api.get('/users?role=student&limit=100').then((r) => setStudents(r.data.users));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/guardians/link', form);
      setShowForm(false);
      setForm({ guardianId: '', studentId: '', relationship: 'Father' });
      fetchLinks();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create link');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this guardian-student link?')) return;
    await api.delete(`/guardians/link/${id}`);
    fetchLinks();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guardian–Student Links</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage family connections and access permissions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLinks} className="btn-secondary"><RefreshCw size={14} /></button>
          <button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={15} /> Link Guardian</button>
        </div>
      </div>

      {/* Create link modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Link Guardian to Student</h3>
            <p className="text-gray-500 text-sm mb-5">Create a parent-child educational relationship</p>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Guardian *</label>
                <select className="input" value={form.guardianId} onChange={(e) => setForm((f) => ({ ...f, guardianId: e.target.value }))} required>
                  <option value="">Select guardian...</option>
                  {guardians.map((g) => <option key={g._id} value={g._id}>{g.name} — {g.email}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Student *</label>
                <select className="input" value={form.studentId} onChange={(e) => setForm((f) => ({ ...f, studentId: e.target.value }))} required>
                  <option value="">Select student...</option>
                  {students.map((s) => <option key={s._id} value={s._id}>{s.name} — {s.studentId || s.email}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Relationship</label>
                <select className="input" value={form.relationship} onChange={(e) => setForm((f) => ({ ...f, relationship: e.target.value }))}>
                  {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>

              {/* Permission checkboxes */}
              <div>
                <label className="label">Guardian Permissions</label>
                <div className="space-y-2 bg-gray-50 rounded-xl p-3">
                  {[
                    { key: 'viewGrades', label: 'View Grades & Scores' },
                    { key: 'viewAttendance', label: 'View Attendance' },
                    { key: 'viewReports', label: 'View Reports' },
                    { key: 'viewActivity', label: 'View Activity Log' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={key !== 'viewActivity'}
                        onChange={(e) => setForm((f) => ({
                          ...f,
                          permissions: { ...f.permissions, [key]: e.target.checked },
                        }))}
                        className="w-4 h-4 rounded text-primary-600"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError(''); }} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Linking...' : <><Link2 size={14} /> Create Link</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Links grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : links.length === 0 ? (
        <div className="card text-center py-16">
          <Link2 size={40} className="mx-auto mb-3 text-gray-200" />
          <h3 className="font-semibold text-gray-800">No links yet</h3>
          <p className="text-gray-500 text-sm mt-1">Create guardian-student links to enable family monitoring</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <div key={link._id} className="card hover:shadow-md transition-shadow">
              {/* Guardian */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                  <Users2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{link.guardian?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{link.guardian?.email}</p>
                </div>
              </div>

              {/* Link arrow */}
              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className={`badge ${RELATIONSHIP_COLOR[link.relationship] || 'bg-gray-100 text-gray-700'}`}>
                  {link.relationship}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Student */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                  <GraduationCap size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{link.student?.name}</p>
                  <p className="text-xs text-gray-400">{link.student?.studentId} · Grade {link.student?.grade}</p>
                </div>
              </div>

              {/* Permissions */}
              <div className="flex flex-wrap gap-1 mb-4">
                {Object.entries(link.permissions || {}).filter(([, v]) => v).map(([k]) => (
                  <span key={k} className="text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <ShieldCheck size={9} />
                    {k.replace('view', '')}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Linked by {link.linkedBy?.name || 'Admin'}
                </p>
                <button onClick={() => handleDelete(link._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
