import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, Users2, FileText, Activity, TrendingUp, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="stat-card animate-slide-up">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
        <Icon size={20} className="text-white" />
      </div>
      <TrendingUp size={14} className="text-emerald-500" />
    </div>
    <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-emerald-600 font-medium mt-1">{sub}</p>}
  </div>
);

const PIE_COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = data?.monthlyRegistrations?.map((m) => ({
    name: MONTHS[m._id.month - 1],
    registrations: m.count,
  })) || [];

  const pieData = data ? [
    { name: 'Students',  value: data.stats.totalStudents },
    { name: 'Teachers',  value: data.stats.totalTeachers },
    { name: 'Guardians', value: data.stats.totalGuardians },
    { name: 'Admins',    value: data.stats.totalUsers - data.stats.totalStudents - data.stats.totalTeachers - data.stats.totalGuardians },
  ] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Educational Relationship Management Overview</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/users" className="btn-secondary"><Users size={15} />Manage Users</Link>
          <Link to="/dashboard/activity" className="btn-primary"><Activity size={15} />View Activity</Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Users"    value={data?.stats.totalUsers}    icon={Users}       color="from-primary-500 to-violet-600" />
        <StatCard label="Students"       value={data?.stats.totalStudents}  icon={GraduationCap} color="from-emerald-500 to-teal-600" />
        <StatCard label="Teachers"       value={data?.stats.totalTeachers}  icon={BookOpen}    color="from-blue-500 to-cyan-600" />
        <StatCard label="Guardians"      value={data?.stats.totalGuardians} icon={Users2}      color="from-orange-500 to-amber-500" />
        <StatCard label="Reports"        value={data?.stats.totalReports}   icon={FileText}    color="from-pink-500 to-rose-600" />
        <StatCard label="Active Groups"  value={data?.stats.totalGroups}    icon={Users2}      color="from-indigo-500 to-purple-600" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="card lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">User Registrations (Last 6 Months)</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Area type="monotone" dataKey="registrations" stroke="#6366f1" fill="url(#regGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No registration data yet</div>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-4">User Distribution</h3>
          {pieData.some((d) => d.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Recent Activity</h3>
          <Link to="/dashboard/activity" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {data?.recentActivity?.length > 0 ? (
          <div className="space-y-2">
            {data.recentActivity.slice(0, 6).map((log) => (
              <div key={log._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {log.user?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{log.details || log.action}</p>
                  <p className="text-xs text-gray-400">{log.user?.name} · {typeof log.user?.role === 'object' ? log.user?.role?.name : log.user?.role} · {new Date(log.createdAt).toLocaleString()}</p>
                </div>
                <span className={`badge ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No activity yet</p>
        )}
      </div>
    </div>
  );
}
