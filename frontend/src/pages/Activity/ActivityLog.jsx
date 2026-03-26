import { useEffect, useState } from 'react';
import { Activity, Search, Filter, RefreshCw, BarChart2, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLOR = {
  success: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  warning: 'bg-yellow-100 text-yellow-700',
};
const CATEGORY_COLOR = {
  auth: 'bg-violet-100 text-violet-700',
  user: 'bg-blue-100 text-blue-700',
  report: 'bg-cyan-100 text-cyan-700',
  group: 'bg-emerald-100 text-emerald-700',
  guardian: 'bg-orange-100 text-orange-700',
  dashboard: 'bg-indigo-100 text-indigo-700',
  system: 'bg-gray-100 text-gray-700',
};

export default function ActivityLog() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (status) params.append('status', status);
      const { data } = await api.get(`/activity?${params}`);
      setLogs(data.logs);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, [search, category, status, page]);
  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/activity/summary').then((r) => setSummary(r.data));
    }
  }, []);

  const chartData = summary?.byDay?.map((d) => ({ date: d._id, count: d.count })) || [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activity Monitor</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {user?.role === 'admin' ? 'Platform-wide user activity and audit trail' : 'Your recent activity'}
          </p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      {/* Summary charts — admin only */}
      {user?.role === 'admin' && summary && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-800 mb-4">Activity (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#actGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">By Category</h3>
            <div className="space-y-2">
              {summary.byCategory?.map((c) => (
                <div key={c._id} className="flex items-center justify-between">
                  <span className={`badge ${CATEGORY_COLOR[c._id] || 'bg-gray-100 text-gray-700'}`}>{c._id}</span>
                  <span className="text-sm font-semibold text-gray-800">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search activity..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input w-auto" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {['auth', 'user', 'report', 'group', 'guardian', 'dashboard', 'system'].map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="warning">Warning</option>
          </select>
        </div>
      </div>

      {/* Log table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium">{total} total events</p>
        </div>
        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading activity...
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-gray-400">No activity found</p>
            </div>
          ) : logs.map((log) => (
            <div key={log._id} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/80 transition-colors">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {log.user?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{log.details || log.action}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">{log.user?.name}</p>
                  <span className="text-gray-200">·</span>
                  <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`badge ${CATEGORY_COLOR[log.category] || 'bg-gray-100 text-gray-700'}`}>{log.category}</span>
                <span className={`badge ${STATUS_COLOR[log.status] || 'bg-gray-100 text-gray-700'}`}>{log.status}</span>
              </div>
            </div>
          ))}
        </div>
        {pages > 1 && (
          <div className="flex justify-end gap-1 px-4 py-3 border-t border-gray-100">
            {Array.from({ length: Math.min(pages, 8) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
