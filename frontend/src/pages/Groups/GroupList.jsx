import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users2, Plus, Search, LogIn, LogOut, BookOpen, Layers } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const CATEGORY_META = {
  study: { color: 'bg-blue-100 text-blue-700', label: 'Study' },
  project: { color: 'bg-purple-100 text-purple-700', label: 'Project' },
  discussion: { color: 'bg-orange-100 text-orange-700', label: 'Discussion' },
  practice: { color: 'bg-emerald-100 text-emerald-700', label: 'Practice' },
  'exam-prep': { color: 'bg-red-100 text-red-700', label: 'Exam Prep' },
};

const COVER_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

export default function GroupList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [viewJoined, setViewJoined] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', subject: '', category: 'study', coverColor: '#6366f1', maxMembers: 30, isPublic: true });
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (viewJoined) params.append('joined', 'true');
      const { data } = await api.get(`/groups?${params}`);
      setGroups(data.groups);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, [search, category, viewJoined]);

  const isMember = (g) => g.members?.some((m) => m.user?._id === user?._id || m.user === user?._id);
  const isOwner = (g) => g.members?.some((m) => (m.user?._id === user?._id || m.user === user?._id) && m.role === 'owner');

  const handleJoin = async (id) => {
    setActionLoading(id);
    try { await api.post(`/groups/${id}/join`); fetchGroups(); }
    catch (e) { alert(e.response?.data?.message || 'Failed to join'); }
    finally { setActionLoading(''); }
  };

  const handleLeave = async (id) => {
    if (!confirm('Leave this group?')) return;
    setActionLoading(id);
    try { await api.post(`/groups/${id}/leave`); fetchGroups(); }
    finally { setActionLoading(''); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/groups', createForm);
      setShowCreate(false);
      navigate(`/dashboard/groups/${data.group._id}`);
    } catch (err) { alert(err.response?.data?.message || 'Failed to create'); }
    finally { setCreating(false); }
  };

  const canCreate = ['admin', 'teacher', 'student'].includes(user?.role);

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Communities</h1>
          <p className="text-gray-500 text-sm mt-0.5">Self-enrolled study groups and collaborative spaces</p>
        </div>
        {canCreate && <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={15} /> Create Group</button>}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-gray-900 text-lg mb-5">Create Learning Group</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Group Name *</label>
                  <input className="input" placeholder="Advanced Mathematics Study Group" value={createForm.name} onChange={(e) => setCreateForm(f => ({...f, name: e.target.value}))} required />
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input className="input" placeholder="Mathematics" value={createForm.subject} onChange={(e) => setCreateForm(f => ({...f, subject: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={createForm.category} onChange={(e) => setCreateForm(f => ({...f, category: e.target.value}))}>
                    {Object.entries(CATEGORY_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <textarea className="input resize-none" rows={2} placeholder="What is this group about?" value={createForm.description} onChange={(e) => setCreateForm(f => ({...f, description: e.target.value}))} />
                </div>
                <div>
                  <label className="label">Max Members</label>
                  <input className="input" type="number" min="2" max="200" value={createForm.maxMembers} onChange={(e) => setCreateForm(f => ({...f, maxMembers: Number(e.target.value)}))} />
                </div>
                <div>
                  <label className="label">Cover Color</label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {COVER_COLORS.map((c) => (
                      <button key={c} type="button" onClick={() => setCreateForm(f => ({...f, coverColor: c}))}
                        className={`w-7 h-7 rounded-full transition-transform ${createForm.coverColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
                        style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1 justify-center">
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search groups..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {Object.entries(CATEGORY_META).map(([v, m]) => <option key={v} value={v}>{m.label}</option>)}
          </select>
          <button onClick={() => setViewJoined(!viewJoined)} className={`btn-secondary ${viewJoined ? 'bg-primary-50 border-primary-200 text-primary-700' : ''}`}>
            <Users2 size={14} /> {viewJoined ? 'All Groups' : 'My Groups'}
          </button>
        </div>
      </div>

      {/* Groups grid */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : groups.length === 0 ? (
        <div className="card text-center py-16">
          <Users2 size={40} className="mx-auto mb-3 text-gray-200" />
          <h3 className="font-semibold text-gray-800">No groups found</h3>
          <p className="text-gray-500 text-sm mt-1">Create a new group or adjust your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => {
            const joined = isMember(g);
            const owner = isOwner(g);
            const catMeta = CATEGORY_META[g.category] || { color: 'bg-gray-100 text-gray-700', label: g.category };
            const fillPct = Math.round((g.members?.length / g.maxMembers) * 100);
            return (
              <div key={g._id} className="card hover:shadow-md transition-all group">
                {/* Cover strip */}
                <div className="h-2 rounded-full mb-4 -mx-0 w-full" style={{ background: g.coverColor }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: g.coverColor }}>
                    {g.name.charAt(0)}
                  </div>
                  <span className={`badge ${catMeta.color}`}>{catMeta.label}</span>
                </div>
                <Link to={`/dashboard/groups/${g._id}`}>
                  <h3 className="font-bold text-gray-900 hover:text-primary-700 transition-colors">{g.name}</h3>
                </Link>
                {g.subject && <p className="text-xs text-primary-600 font-medium mt-0.5">{g.subject}</p>}
                {g.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{g.description}</p>}

                {/* Members */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{g.members?.length} / {g.maxMembers} members</span>
                    <span>{fillPct}% full</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, background: g.coverColor }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Link to={`/dashboard/groups/${g._id}`} className="btn-secondary flex-1 justify-center text-xs py-2">
                    <BookOpen size={13} /> View
                  </Link>
                  {!owner && joined && (
                    <button onClick={() => handleLeave(g._id)} disabled={actionLoading === g._id} className="btn-secondary flex-1 justify-center text-xs py-2 text-red-600 border-red-200 hover:bg-red-50">
                      <LogOut size={13} /> Leave
                    </button>
                  )}
                  {!joined && g.members?.length < g.maxMembers && ['student', 'teacher'].includes(user?.role) && (
                    <button onClick={() => handleJoin(g._id)} disabled={actionLoading === g._id} className="btn-primary flex-1 justify-center text-xs py-2">
                      <LogIn size={13} /> Join
                    </button>
                  )}
                  {joined && <span className="badge bg-emerald-100 text-emerald-700 self-center">{owner ? 'Owner' : 'Joined'}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
