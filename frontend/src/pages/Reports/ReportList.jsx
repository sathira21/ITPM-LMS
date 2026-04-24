import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileText, Plus, Eye, Send, Trash2, Search, Filter } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLOR = {
  draft: 'bg-gray-100 text-gray-600',
  published: 'bg-emerald-100 text-emerald-700',
  archived: 'bg-blue-100 text-blue-700',
};
const GRADE_COLOR = {
  A: 'bg-emerald-100 text-emerald-700', B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700', D: 'bg-orange-100 text-orange-700', F: 'bg-red-100 text-red-700',
};

export default function ReportList() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (statusFilter) params.append('status', statusFilter);
      const sid = searchParams.get('studentId');
      if (sid) params.append('studentId', sid);
      const { data } = await api.get(`/reports?${params}`);
      setReports(data.reports);
      setPages(data.pages);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReports(); }, [statusFilter, page]);

  const handlePublish = async (id) => {
    await api.put(`/reports/${id}/publish`);
    fetchReports();
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    await api.delete(`/reports/${id}`);
    fetchReports();
  };

  const canCreate = ['admin', 'teacher'].includes(user?.role);
  const canPublish = ['admin', 'teacher'].includes(user?.role);

  const filtered = search
    ? reports.filter((r) => r.title?.toLowerCase().includes(search.toLowerCase()) || r.student?.name?.toLowerCase().includes(search.toLowerCase()))
    : reports;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {user?.role === 'guardian' ? "Your linked student's reports" : user?.role === 'student' ? 'Your academic reports' : 'All student reports'}
          </p>
        </div>
        {canCreate && (
          <Link to="/dashboard/reports/new" className="btn-primary"><Plus size={15} /> New Report</Link>
        )}
      </div>

      <div className="card py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Report', 'Student', 'Period', 'Grade', 'GPA', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Loading reports...
                </div>
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12">
                <FileText size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-gray-400">No reports found</p>
              </td></tr>
            ) : filtered.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText size={15} className="text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-900 max-w-48 truncate">{r.title}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{r.student?.name}</p>
                  <p className="text-xs text-gray-400">{r.student?.studentId}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.period || '—'}</td>
                <td className="px-4 py-3">
                  {r.overallGrade
                    ? <span className={`badge ${GRADE_COLOR[r.overallGrade] || 'bg-gray-100 text-gray-600'}`}>{r.overallGrade}</span>
                    : '—'}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-700">{r.gpa ? r.gpa.toFixed(2) : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link to={`/dashboard/reports/${r._id}`} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                      <Eye size={14} />
                    </Link>
                    {canPublish && r.status === 'draft' && (
                      <button onClick={() => handlePublish(r._id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-colors" title="Publish">
                        <Send size={14} />
                      </button>
                    )}
                    {user?.role === 'admin' && (
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="flex justify-end gap-1 px-4 py-3 border-t border-gray-100">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
