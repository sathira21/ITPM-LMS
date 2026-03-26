import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users2, LogIn, LogOut, Crown, User as UserIcon } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ROLE_META = { owner: 'bg-amber-100 text-amber-700', moderator: 'bg-blue-100 text-blue-700', member: 'bg-gray-100 text-gray-600' };

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetch = () => {
    setLoading(true);
    api.get(`/groups/${id}`).then((r) => setGroup(r.data.group)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [id]);

  const isMember = group?.members?.some((m) => m.user?._id === user?._id);
  const isOwner = group?.members?.some((m) => m.user?._id === user?._id && m.role === 'owner');

  const handleJoin = async () => {
    setActionLoading(true);
    try { await api.post(`/groups/${id}/join`); fetch(); }
    catch (e) { alert(e.response?.data?.message || 'Cannot join'); }
    finally { setActionLoading(false); }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this group?')) return;
    setActionLoading(true);
    try { await api.post(`/groups/${id}/leave`); navigate('/dashboard/groups'); }
    finally { setActionLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!group) return (
    <div className="text-center py-20 text-gray-400">
      <Users2 size={40} className="mx-auto mb-2 text-gray-200" />
      <p>Group not found</p>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard/groups')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1" />
        {!isMember && group.members?.length < group.maxMembers && (
          <button onClick={handleJoin} disabled={actionLoading} className="btn-primary">
            <LogIn size={15} /> Join Group
          </button>
        )}
        {isMember && !isOwner && (
          <button onClick={handleLeave} disabled={actionLoading} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50">
            <LogOut size={15} /> Leave
          </button>
        )}
      </div>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden shadow-sm">
        <div className="h-24 relative" style={{ background: `linear-gradient(135deg, ${group.coverColor}cc, ${group.coverColor})` }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
        </div>
        <div className="bg-white px-6 pb-6 -mt-8 relative">
          <div className="w-16 h-16 rounded-2xl border-4 border-white flex items-center justify-center text-white font-bold text-2xl shadow-md mb-3" style={{ background: group.coverColor }}>
            {group.name.charAt(0)}
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              {group.subject && <p className="text-primary-600 font-medium text-sm">{group.subject}</p>}
              {group.description && <p className="text-gray-600 text-sm mt-2 max-w-lg">{group.description}</p>}
            </div>
            <div className="flex gap-2">
              {isMember && <span className="badge bg-emerald-100 text-emerald-700">{isOwner ? 'Owner' : 'Member'}</span>}
              <span className="badge bg-gray-100 text-gray-700">{group.members?.length}/{group.maxMembers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users2 size={16} /> Members ({group.members?.length})
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {group.members?.map((m) => (
            <div key={m.user?._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {m.user?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{m.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{typeof m.user?.role === 'object' ? m.user?.role?.name : m.user?.role}</p>
              </div>
              <div className="flex items-center gap-1">
                {m.role === 'owner' && <Crown size={13} className="text-amber-500" />}
                <span className={`badge text-xs ${ROLE_META[m.role] || 'bg-gray-100 text-gray-600'}`}>{m.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
