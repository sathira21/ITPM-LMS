import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Users2, Plus, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/teacher').then((r) => setData(r.data));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm">Welcome back</p>
          <h1 className="text-2xl font-bold">{user?.name}</h1>
          <p className="text-white/70 text-sm mt-1">Subjects: {user?.subjects?.join(', ') || 'Not assigned'}</p>
        </div>
        <Link to="/dashboard/reports/new" className="bg-white text-blue-600 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors">
          <Plus size={15} /> New Report
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: data?.stats?.totalStudents ?? 0, icon: Users, color: 'from-emerald-500 to-teal-600' },
          { label: 'Reports Created', value: data?.stats?.totalReports ?? 0, icon: FileText, color: 'from-blue-500 to-cyan-500' },
          { label: 'My Groups', value: data?.stats?.totalGroups ?? 0, icon: Users2, color: 'from-violet-500 to-purple-600' },
        ].map((s) => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">My Learning Groups</h3>
            <Link to="/dashboard/groups" className="text-xs text-primary-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {data?.groups?.length > 0 ? (
            <div className="space-y-2">
              {data.groups.slice(0, 5).map((g) => (
                <Link key={g._id} to={`/dashboard/groups/${g._id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: g.coverColor }}>
                    {g.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{g.name}</p>
                    <p className="text-xs text-gray-400">{g.members?.length} / {g.maxMembers} members</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-6">No groups yet</p>}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
            <Link to="/dashboard/activity" className="text-xs text-primary-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          {data?.recentActivity?.length > 0 ? (
            <div className="space-y-2">
              {data.recentActivity.slice(0, 6).map((log) => (
                <div key={log._id} className="flex items-start gap-3 p-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{log.details || log.action}</p>
                    <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400 text-sm text-center py-6">No recent activity</p>}
        </div>
      </div>
    </div>
  );
}
