import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users2, Activity, TrendingUp, Star, ArrowRight, BookOpen } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const GRADE_COLOR = { A: 'text-emerald-600 bg-emerald-50', B: 'text-blue-600 bg-blue-50', C: 'text-yellow-600 bg-yellow-50', D: 'text-orange-600 bg-orange-50', F: 'text-red-600 bg-red-50' };

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/student').then((r) => setData(r.data));
  }, []);

  const radarData = data?.latestReport?.grades?.map((g) => ({
    subject: g.subject,
    score: Math.round((g.score / g.maxScore) * 100),
  })) || [];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-white/70 text-sm">Welcome back</p>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-white/80 text-sm">Grade: {user?.grade || 'N/A'}</span>
              {user?.studentId && <span className="text-white/80 text-sm">ID: {user.studentId}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Stats */}
        <div className="space-y-4">
          {[
            { label: 'Reports Available', value: data?.reports?.length ?? 0, icon: FileText, color: 'from-blue-500 to-cyan-500' },
            { label: 'Groups Joined',     value: data?.groups?.length ?? 0,   icon: Users2,  color: 'from-violet-500 to-purple-600' },
            { label: 'GPA',               value: data?.latestReport?.gpa?.toFixed(1) || 'N/A', icon: Star, color: 'from-amber-400 to-orange-500' },
          ].map((s) => (
            <div key={s.label} className="stat-card flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <s.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Radar chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Latest Performance</h3>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-2 text-gray-400">
              <BookOpen size={32} className="text-gray-300" />
              <p className="text-sm">No report data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Latest report subjects */}
      {data?.latestReport && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Latest Report — {data.latestReport.title}</h3>
            <Link to={`/dashboard/reports/${data.latestReport._id}`} className="text-xs text-primary-600 font-medium flex items-center gap-1">
              View full <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.latestReport.grades?.map((g) => (
              <div key={g.subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">{g.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{g.score}/{g.maxScore}</span>
                  <span className={`badge ${GRADE_COLOR[g.grade] || 'bg-gray-100 text-gray-600'}`}>{g.grade}</span>
                </div>
              </div>
            ))}
          </div>
          {data.latestReport.attendance && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center gap-3">
              <TrendingUp size={16} className="text-blue-600" />
              <span className="text-sm text-blue-700">
                Attendance: <strong>{data.latestReport.attendance.percentage?.toFixed(1)}%</strong>
                ({data.latestReport.attendance.presentDays}/{data.latestReport.attendance.totalDays} days)
              </span>
            </div>
          )}
        </div>
      )}

      {/* Groups & Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Groups</h3>
            <Link to="/dashboard/groups" className="text-xs text-primary-600 font-medium flex items-center gap-1">Explore <ArrowRight size={12} /></Link>
          </div>
          {data?.groups?.length > 0 ? (
            <div className="space-y-2">
              {data.groups.map((g) => (
                <Link key={g._id} to={`/dashboard/groups/${g._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: g.coverColor }}>
                    {g.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{g.name}</p>
                    <p className="text-xs text-gray-400">{g.members?.length} members · {g.subject}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No groups joined yet</p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
            <Link to="/dashboard/activity" className="text-xs text-primary-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {data?.recentActivity?.length > 0 ? (
            <div className="space-y-2">
              {data.recentActivity.slice(0, 5).map((log) => (
                <div key={log._id} className="flex items-start gap-3 p-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{log.details || log.action}</p>
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-6">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
