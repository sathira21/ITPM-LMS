// UI layout
import { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare, Star, Send, Filter, Search, CheckCircle2,
  Clock, XCircle, ChevronDown, Trash2, Reply, RefreshCw,
  BarChart2, EyeOff, TrendingUp, AlertCircle, X, Sparkles,
  BookOpen, Users2, Monitor, Layers, MessageCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
//feedback categories for students and teachers
/* ── helpers ── */
const CATEGORIES = [
  { value: 'lesson',   label: 'Lesson',    icon: BookOpen,       color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'quiz',     label: 'Quiz',      icon: CheckCircle2,   color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'material', label: 'Material',  icon: Layers,         color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'session',  label: 'Session',   icon: Users2,         color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { value: 'platform', label: 'Platform',  icon: Monitor,        color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'general',  label: 'General',   icon: MessageCircle,  color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const STATUS_META = {
  pending:  { color: 'bg-amber-100 text-amber-700 border-amber-200',    icon: Clock,         label: 'Pending' },
  reviewed: { color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle2,  label: 'Reviewed' },
  resolved: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Resolved' },
};

const BAR_COLORS = ['#ef4444','#f97316','#f59e0b','#84cc16','#10b981'];

const getCat = (v) => CATEGORIES.find((c) => c.value === v) || CATEGORIES[5];

/* ── Star Rating Component ── */
const StarRating = ({ value, onChange, readonly = false, size = 20 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        disabled={readonly}
        onClick={() => !readonly && onChange?.(s)}
        className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
      >
        <Star
          size={size}
          className={s <= (value || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
        />
      </button>
    ))}
  </div>
);

/* ── Feedback Card ── */
const FeedbackCard = ({ fb, isAdmin, onRespond, onDelete, onStatusChange }) => {
  const [showReply, setShowReply] = useState(false);
  const [response, setResponse] = useState(fb.adminResponse || '');
  const [saving, setSaving] = useState(false);
  const cat = getCat(fb.category);
  const CatIcon = cat.icon;
  const statusMeta = STATUS_META[fb.status] || STATUS_META.pending;
  const StatusIcon = statusMeta.icon;

  const handleRespond = async () => {
    setSaving(true);
    await onRespond(fb._id, response);
    setSaving(false);
    setShowReply(false);
  };

  return (
    <div className="card hover:shadow-card-hover transition-all duration-300 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {fb.isAnonymous ? '?' : (fb.submittedBy?.name?.charAt(0) || '?')}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
              {fb.isAnonymous ? (
                <span className="flex items-center gap-1 text-gray-500"><EyeOff size={12}/> Anonymous</span>
              ) : fb.submittedBy?.name}
            </p>
            <p className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`badge border text-xs ${statusMeta.color}`}>
            <StatusIcon size={10} /> {statusMeta.label}
          </span>
          <span className={`badge border text-xs ${cat.color}`}>
            <CatIcon size={10} /> {cat.label}
          </span>
        </div>
      </div>

      {/* Title + rating */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-gray-900">{fb.title}</h3>
          {fb.rating && <StarRating value={fb.rating} readonly size={14} />}
        </div>
        {(fb.subject || fb.module) && (
          <p className="text-xs text-primary-600 font-medium mb-2">
            {fb.subject}{fb.subject && fb.module ? ' · ' : ''}{fb.module}
          </p>
        )}
        <p className="text-sm text-gray-600 leading-relaxed">{fb.message}</p>
      </div>

      {/* Admin response */}
      {fb.adminResponse && (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Reply size={12} className="text-primary-600" />
            <span className="text-xs font-semibold text-primary-700">Admin Response</span>
            {fb.respondedBy && <span className="text-xs text-gray-400">· {fb.respondedBy.name}</span>}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{fb.adminResponse}</p>
        </div>
      )}

      {/* Reply form */}
      {showReply && isAdmin && (
        <div className="space-y-2 animate-slide-up">
          <textarea
            className="input resize-none text-sm"
            rows={3}
            placeholder="Write your response..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => setShowReply(false)} className="btn-secondary flex-1 justify-center text-xs py-2">Cancel</button>
            <button onClick={handleRespond} disabled={saving || !response.trim()} className="btn-primary flex-1 justify-center text-xs py-2">
              {saving ? 'Saving...' : <><Reply size={12}/> Send Response</>}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
        {isAdmin && (
          <>
            <button
              onClick={() => setShowReply(!showReply)}
              className="btn-secondary text-xs py-1.5 flex-1 justify-center"
            >
              <Reply size={12} /> {fb.adminResponse ? 'Edit Reply' : 'Respond'}
            </button>
            {fb.status !== 'resolved' && (
              <button
                onClick={() => onStatusChange(fb._id, fb.status === 'pending' ? 'reviewed' : 'resolved')}
                className="btn-secondary text-xs py-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                <CheckCircle2 size={12} />
                {fb.status === 'pending' ? 'Mark Reviewed' : 'Resolve'}
              </button>
            )}
          </>
        )}
        <button
          onClick={() => onDelete(fb._id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ml-auto"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

/* ── Submit Form ── */
const SubmitForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    title: '', message: '', category: 'general',
    subject: '', module: '', isAnonymous: false,
  });
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setForm((f) => ({ ...f, [k]: !f[k] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return setError('Please write your feedback message');
    if (wordCount > 100) return setError('Feedback description must be 100 words or less');
    setError(''); setLoading(true);
    try {
      await api.post('/feedback', { ...form, rating: rating || null });
      setDone(true);
      setTimeout(() => { setDone(false); onSuccess?.(); }, 2000);
      setForm({ title: '', message: '', category: 'general', subject: '', module: '', isAnonymous: false });
      setRating(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="card text-center py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={32} className="text-emerald-500" />
      </div>
      <h3 className="font-bold text-gray-900 text-xl">Feedback Submitted!</h3>
      <p className="text-gray-500 text-sm mt-1">Thank you — your feedback has been recorded.</p>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="card space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Submit Feedback</h2>
          <p className="text-sm text-gray-500 mt-0.5">Share your thoughts on lessons, materials, or the platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={14}/> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category picker */}
          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm((f) => ({ ...f, category: value }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.category === value
                      ? `${color} border-current`
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14}/> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="label">Rating (optional)</label>
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={setRating} size={28} />
              {rating > 0 && (
                <button type="button" onClick={() => setRating(0)} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                  <X size={10}/> Clear
                </button>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Title *</label>
              <input className="input" placeholder="Brief summary of your feedback..." value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label className="label">Subject (optional)</label>
              <input className="input" placeholder="e.g. Mathematics" value={form.subject} onChange={set('subject')} />
            </div>
            <div>
              <label className="label">Module / Topic (optional)</label>
              <input className="input" placeholder="e.g. Week 3 – Algebra" value={form.module} onChange={set('module')} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Your Feedback *</label>
              <textarea
                className="input resize-none"
                rows={4}
                placeholder="Describe your experience, suggestions, or concerns..."
                value={form.message}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((f) => ({ ...f, message: value }));
                  setWordCount(value.trim().split(/\s+/).filter(word => word.length > 0).length);
                }}
                required
              />
              <p className={`text-xs mt-1 ${wordCount > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                {wordCount}/100 words
              </p>
            </div>
          </div>

          {/* Anonymous toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
            <div
              onClick={toggle('isAnonymous')}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.isAnonymous ? 'bg-primary-600' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.isAnonymous ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <EyeOff size={13} className="text-gray-500" /> Submit Anonymously
              </p>
              <p className="text-xs text-gray-400">Your name will be hidden from the feedback</p>
            </div>
          </label>

          <button type="submit" disabled={loading || wordCount > 100} className="btn-primary w-full justify-center py-3 text-base font-semibold">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <><Send size={16}/> Submit Feedback</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── Analytics Panel ── */
const AnalyticsPanel = ({ stats }) => {
  if (!stats) return null;
  const barData = [1,2,3,4,5].map((s) => ({
    star: `${s}★`,
    count: stats.recentRatings?.find((r) => r._id === s)?.count || 0,
  }));
  const catData = stats.byCategory?.map((c) => ({
    name: getCat(c._id).label,
    count: c.count,
    avg: c.avgRating?.toFixed(1),
  })) || [];

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Feedback', value: stats.total,    color: 'from-primary-500 to-violet-600', icon: MessageSquare },
          { label: 'Pending',        value: stats.pending,  color: 'from-amber-400 to-orange-500',   icon: Clock },
          { label: 'Reviewed',       value: stats.reviewed, color: 'from-blue-500 to-cyan-500',      icon: CheckCircle2 },
          { label: 'Resolved',       value: stats.resolved, color: 'from-emerald-500 to-teal-600',   icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card flex items-center gap-3 py-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
              <Icon size={17} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Avg rating */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Star size={16} className="text-amber-400 fill-amber-400" /> Overall Rating
          </h3>
          {stats.avgRating ? (
            <div className="flex items-center gap-6 mb-5">
              <div className="text-center">
                <p className="text-6xl font-black gradient-text">{stats.avgRating}</p>
                <StarRating value={Math.round(Number(stats.avgRating))} readonly size={18} />
                <p className="text-xs text-gray-400 mt-1">{stats.totalRated} ratings</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map((s) => {
                  const cnt = stats.recentRatings?.find((r) => r._id === s)?.count || 0;
                  const pct = stats.totalRated ? Math.round((cnt / stats.totalRated) * 100) : 0;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-4">{s}</span>
                      <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-7 text-right">{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No ratings yet</p>
          )}
        </div>

        {/* By category */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-primary-500" /> Feedback by Category
          </h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={catData} margin={{ bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {catData.map((_, i) => <Cell key={i} fill={['#6366f1','#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6'][i % 6]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
export default function FeedbackPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const TABS = [
    { id: 'feed',      label: isAdmin ? 'All Feedback' : 'My Feedback', icon: MessageSquare, roles: ['admin','teacher','student'] },
    { id: 'submit',    label: 'Submit Feedback',                          icon: Send,          roles: ['student','teacher'] },
    { id: 'analytics', label: 'Analytics',                                icon: BarChart2,     roles: ['admin'] },
  ].filter((t) => t.roles.includes(user?.role));

  const [tab, setTab] = useState(TABS[0]?.id || 'feed');
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 9 });
      if (search) params.append('search', search);
      if (filterCat) params.append('category', filterCat);
      if (filterStatus) params.append('status', filterStatus);
      const { data } = await api.get(`/feedback?${params}`);
      setFeedbacks(data.feedbacks);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [search, filterCat, filterStatus, page]);

  const fetchStats = useCallback(() => {
    if (isAdmin) api.get('/feedback/stats').then((r) => setStats(r.data.stats));
  }, [isAdmin]);

  useEffect(() => { fetchFeedbacks(); }, [fetchFeedbacks]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleRespond = async (id, response) => {
    await api.put(`/feedback/${id}/respond`, { adminResponse: response, status: 'reviewed' });
    fetchFeedbacks(); fetchStats();
    showToast('Response sent!');
  };

  const handleStatusChange = async (id, status) => {
    await api.put(`/feedback/${id}/status`, { status });
    fetchFeedbacks(); fetchStats();
    showToast(`Marked as ${status}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    await api.delete(`/feedback/${id}`);
    fetchFeedbacks(); fetchStats();
    showToast('Feedback deleted.');
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isAdmin
              ? 'Review, respond, and analyse all platform feedback'
              : 'Submit feedback on lessons, materials, and academic sessions'}
          </p>
        </div>
        <button onClick={() => { fetchFeedbacks(); fetchStats(); }} className="btn-secondary">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} /> {label}
            {id === 'feed' && stats?.pending > 0 && isAdmin && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── SUBMIT TAB ── */}
      {tab === 'submit' && (
        <SubmitForm onSuccess={() => { setTab('feed'); fetchFeedbacks(); }} />
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === 'analytics' && <AnalyticsPanel stats={stats} />}

      {/* ── FEED TAB ── */}
      {tab === 'feed' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="card py-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-10"
                  placeholder="Search feedback..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <select className="input w-auto" value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              {isAdmin && (
                <select className="input w-auto" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                </select>
              )}
              {(search || filterCat || filterStatus) && (
                <button onClick={() => { setSearch(''); setFilterCat(''); setFilterStatus(''); setPage(1); }} className="btn-secondary text-red-500 border-red-200 hover:bg-red-50">
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 font-medium">{total} feedback item{total !== 1 ? 's' : ''}</p>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading feedback...</p>
              </div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-800">No feedback found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {user?.role === 'student' ? 'You haven\'t submitted any feedback yet.' : 'No feedback matches your filters.'}
              </p>
              {user?.role === 'student' && (
                <button onClick={() => setTab('submit')} className="btn-primary mt-4 mx-auto">
                  <Send size={14} /> Submit Feedback
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedbacks.map((fb) => (
                <FeedbackCard
                  key={fb._id}
                  fb={fb}
                  isAdmin={isAdmin}
                  onRespond={handleRespond}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex justify-center gap-1 pt-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                    page === p ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
