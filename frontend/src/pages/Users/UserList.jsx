import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Search, Filter, Edit2, Power, Trash2, Shield, BookOpen, GraduationCap, Users2, RefreshCw, Clock, CheckCircle2, XCircle, AlertTriangle, Heart, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const ROLE_META = {
  admin:    { color: 'bg-violet-100 text-violet-700', icon: Shield },
  teacher:  { color: 'bg-blue-100 text-blue-700',   icon: BookOpen },
  student:  { color: 'bg-emerald-100 text-emerald-700', icon: GraduationCap },
  guardian: { color: 'bg-orange-100 text-orange-700', icon: Users2 },
};

const ROLE_ICONS_MAP = { teacher: BookOpen, student: GraduationCap, guardian: Heart, admin: Shield };
const ROLE_COLORS_MAP = {
  teacher:  'from-blue-500 to-cyan-500',
  student:  'from-emerald-500 to-teal-500',
  guardian: 'from-orange-500 to-amber-500',
  admin:    'from-violet-600 to-purple-700',
};

function PendingApprovals({ onApproved }) {
  const [pending, setPending]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionId, setActionId]     = useState('');
  const [rejectModal, setRejectModal] = useState(null); // user object
  const [reason, setReason]         = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/users/pending').then(r => setPending(r.data.users || [])).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setActionId(id);
    try {
      await api.put(`/users/${id}/approve`);
      setPending(p => p.filter(u => u._id !== id));
      onApproved();
    } finally { setActionId(''); }
  };

  const reject = async () => {
    if (!rejectModal) return;
    setActionId(rejectModal._id);
    try {
      await api.put(`/users/${rejectModal._id}/reject`, { reason });
      setPending(p => p.filter(u => u._id !== rejectModal._id));
      setRejectModal(null); setReason('');
    } finally { setActionId(''); }
  };

  if (loading) return (
    <div className="card flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin text-primary-500" />
    </div>
  );

  if (!pending.length) return (
    <div className="card text-center py-12">
      <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
      <p className="font-semibold text-gray-700">No pending registrations</p>
      <p className="text-sm text-gray-400 mt-1">All registration requests have been reviewed</p>
    </div>
  );

  return (
    <>
      <div className="space-y-3">
        {pending.map(u => {
          const Icon = ROLE_ICONS_MAP[u.role] || Shield;
          const grad = ROLE_COLORS_MAP[u.role] || 'from-gray-400 to-gray-500';
          return (
            <div key={u._id} className="card !p-4 flex items-center gap-4 group hover:border-amber-200 transition-colors">
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-black text-base flex-shrink-0`}>
                {u.name.charAt(0)}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                  <span className={`badge text-xs bg-gradient-to-r ${grad} text-white px-2 py-0.5`}>
                    <Icon size={10} className="mr-0.5" />{u.role}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{u.email}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {u.studentId && <span className="text-xs text-gray-400">ID: {u.studentId}</span>}
                  {u.grade && <span className="text-xs text-gray-400">• {u.grade}</span>}
                  {u.relationship && <span className="text-xs text-gray-400">• {u.relationship}</span>}
                  {u.subjects?.length > 0 && <span className="text-xs text-gray-400">• {u.subjects.join(', ')}</span>}
                  <span className="text-xs text-gray-300">• Registered {new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => approve(u._id)}
                  disabled={actionId === u._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all border border-emerald-200 disabled:opacity-50"
                >
                  {actionId === u._id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                  Approve
                </button>
                <button
                  onClick={() => { setRejectModal(u); setReason(''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold transition-all border border-red-200"
                >
                  <XCircle size={12} />Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,10,40,0.6)', backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-float animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Reject Registration</p>
                <p className="text-xs text-gray-500">{rejectModal.name} · {rejectModal.role}</p>
              </div>
            </div>
            <label className="label">Reason (optional)</label>
            <textarea
              value={reason} onChange={e => setReason(e.target.value)}
              className="input resize-none text-sm" rows={3}
              placeholder="e.g. Duplicate account, Invalid information..."
            />
            <div className="flex gap-2 mt-4">
              <button onClick={() => setRejectModal(null)} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
              <button onClick={reject} disabled={!!actionId} className="btn-danger flex-1 justify-center text-sm">
                {actionId ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search) params.append('search', search);
      if (role) params.append('role', role);
      const { data } = await api.get(`/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [search, role, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    api.get('/users/stats').then((r) => setStats(r.data.stats));
  }, []);

  const handleToggle = async (id) => {
    setActionLoading(id);
    try {
      const { data } = await api.put(`/users/${id}/toggle-status`);
      setUsers((prev) => prev.map((u) => u._id === id ? data.user : u));
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    await api.delete(`/users/${id}`);
    fetchUsers();
  };

  const refreshStats = () => api.get('/users/stats').then(r => setStats(r.data.stats));

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage all platform users and their roles</p>
        </div>
        <Link to="/dashboard/users/new" className="btn-primary">
          <Plus size={15} /> Add User
        </Link>
      </div>

      {/* Stats bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-800' },
            { label: 'Admins', value: stats.admins, color: 'text-violet-700' },
            { label: 'Teachers', value: stats.teachers, color: 'text-blue-700' },
            { label: 'Students', value: stats.students, color: 'text-emerald-700' },
            { label: 'Guardians', value: stats.guardians, color: 'text-orange-700' },
            { label: 'Active', value: stats.active, color: 'text-emerald-700' },
            { label: 'Inactive', value: stats.inactive, color: 'text-red-700' },
            { label: 'Pending', value: stats.pending ?? 0, color: 'text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="card py-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white rounded-2xl border border-gray-100 shadow-soft w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-glow-purple' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
        >
          <Users size={14} /> All Users
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'pending' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}
        >
          <Clock size={14} /> Pending Approvals
          {stats?.pending > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeTab === 'pending' ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-700'}`}>
              {stats.pending}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'pending' ? (
        <PendingApprovals onApproved={refreshStats} />
      ) : (
      <>
      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search name, email, student ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="relative">
            <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="input pl-9 pr-8 appearance-none cursor-pointer min-w-36"
              value={role}
              onChange={(e) => { setRole(e.target.value); setPage(1); }}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="guardian">Guardian</option>
            </select>
          </div>
          <button onClick={fetchUsers} className="btn-secondary">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Role', 'Student ID / Grade', 'Status', 'Last Login', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    Loading users...
                  </div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">
                  <Users size={32} className="mx-auto mb-2 text-gray-200" />
                  No users found
                </td></tr>
              ) : users.map((u) => {
                const meta = ROLE_META[u.role] || ROLE_META.student;
                const RoleIcon = meta.icon;
                return (
                  <tr key={u._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${meta.color} gap-1`}>
                        <RoleIcon size={10} />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {u.studentId ? (
                        <div>
                          <p className="font-medium text-gray-700">{u.studentId}</p>
                          <p className="text-xs">{u.grade && `Grade ${u.grade}`}</p>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/dashboard/users/${u._id}/edit`} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => handleToggle(u._id)}
                          disabled={actionLoading === u._id}
                          className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'hover:bg-orange-50 text-gray-400 hover:text-orange-600' : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-600'}`}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {users.length} of {total} users</p>
            <div className="flex gap-1">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
