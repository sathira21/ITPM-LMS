import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, User, Calendar, Award, TrendingUp, Printer, Send } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const GRADE_COLOR = { A: 'text-emerald-600', B: 'text-blue-600', C: 'text-yellow-600', D: 'text-orange-600', F: 'text-red-600' };
const BAR_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/reports/${id}`)
      .then((r) => setReport(r.data.report))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!report) return (
    <div className="text-center py-20 text-gray-400">
      <FileText size={40} className="mx-auto mb-2 text-gray-200" />
      <p>Report not found</p>
    </div>
  );

  const chartData = report.grades?.map((g) => ({
    subject: g.subject,
    score: g.score,
    maxScore: g.maxScore,
    percent: Math.round((g.score / g.maxScore) * 100),
  })) || [];

  const handlePublish = async () => {
    await api.put(`/reports/${id}/publish`);
    setReport((r) => ({ ...r, status: 'published' }));
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
          <p className="text-gray-500 text-sm">{report.period} · {report.academicYear}</p>
        </div>
        <div className="flex gap-2">
          {['admin', 'teacher'].includes(user?.role) && report.status === 'draft' && (
            <button onClick={handlePublish} className="btn-primary">
              <Send size={14} /> Publish
            </button>
          )}
          <button onClick={() => window.print()} className="btn-secondary">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Student info card */}
      <div className="card bg-gradient-to-r from-primary-50 to-violet-50 border-primary-100">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-2xl">
            {report.student?.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{report.student?.name}</h2>
            <div className="flex flex-wrap gap-4 mt-1">
              <span className="text-sm text-gray-600 flex items-center gap-1"><User size={13} />{report.student?.studentId}</span>
              <span className="text-sm text-gray-600">Grade: {report.student?.grade}</span>
              <span className="text-sm text-gray-600 flex items-center gap-1"><Calendar size={13} />{report.period}</span>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-4xl font-black ${GRADE_COLOR[report.overallGrade] || 'text-gray-700'}`}>
              {report.overallGrade || 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Overall Grade</p>
            {report.gpa > 0 && <p className="text-sm font-bold text-gray-800 mt-0.5">GPA: {report.gpa.toFixed(2)}</p>}
          </div>
        </div>
      </div>

      {/* Grades */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Score Distribution</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} angle={-35} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v, n, p) => [`${p.payload.score}/${p.payload.maxScore} (${v}%)`, 'Score']}
                  contentStyle={{ borderRadius: '10px', fontSize: 12 }}
                />
                <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No grade data</div>}
        </div>

        {/* Grade table */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">Subject Breakdown</h3>
          <div className="space-y-2">
            {report.grades?.map((g) => (
              <div key={g.subject} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{g.subject}</p>
                  {g.remarks && <p className="text-xs text-gray-400">{g.remarks}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{g.score}/{g.maxScore}</span>
                  <div className="w-14 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary-500 h-full rounded-full" style={{ width: `${(g.score / g.maxScore) * 100}%` }} />
                  </div>
                  <span className={`font-bold text-sm ${GRADE_COLOR[g.grade] || 'text-gray-600'}`}>{g.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance & Remarks */}
      <div className="grid sm:grid-cols-2 gap-4">
        {report.attendance && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary-600" /> Attendance
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-bold text-gray-800">{report.attendance.percentage?.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${report.attendance.percentage >= 90 ? 'bg-emerald-500' : report.attendance.percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${report.attendance.percentage}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Present Days</span>
                <span className="font-semibold text-gray-800">{report.attendance.presentDays} / {report.attendance.totalDays}</span>
              </div>
            </div>
          </div>
        )}

        {report.teacherRemarks && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Award size={16} className="text-primary-600" /> Teacher Remarks
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{report.teacherRemarks}</p>
            <p className="text-xs text-gray-400 mt-3">— {report.generatedBy?.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
