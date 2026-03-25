import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, FileText, ArrowRight, Eye, Heart } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const GRADE_COLOR = { A: 'text-emerald-700 bg-emerald-50', B: 'text-blue-700 bg-blue-50', C: 'text-yellow-700 bg-yellow-50', D: 'text-orange-700 bg-orange-50', F: 'text-red-700 bg-red-50' };

export default function GuardianDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/guardian').then((r) => setData(r.data));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Heart size={22} className="text-white/80" />
          <div>
            <p className="text-white/70 text-sm">Guardian Portal</p>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-white/70 text-sm">{data?.linkedStudents?.length ?? 0} student(s) linked to your account</p>
          </div>
        </div>
      </div>

      {/* Linked Students */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-4">Your Linked Students</h3>
        {data?.linkedStudents?.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {data.linkedStudents.map((link) => (
              <div key={link._id} className="border border-gray-100 rounded-2xl p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold">
                    {link.student?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{link.student?.name}</p>
                    <p className="text-xs text-gray-500">Grade {link.student?.grade} · {link.student?.studentId}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 font-medium">{link.relationship}</span>
                  <Link
                    to={`/reports?studentId=${link.student?._id}`}
                    className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:underline"
                  >
                    <Eye size={12} /> View Reports
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <GraduationCap size={36} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No students linked yet. Contact your admin.</p>
          </div>
        )}
      </div>

      {/* Recent Reports */}
      {data?.recentReports?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Student Reports</h3>
            <Link to="/dashboard/reports" className="text-xs text-primary-600 font-medium flex items-center gap-1">View all <ArrowRight size={12} /></Link>
          </div>
          <div className="space-y-3">
            {data.recentReports.map((r) => (
              <Link
                key={r._id}
                to={`/dashboard/reports/${r._id}`}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.student?.name} · {r.period}</p>
                </div>
                <div className="flex items-center gap-2">
                  {r.overallGrade && (
                    <span className={`badge ${GRADE_COLOR[r.overallGrade] || 'bg-gray-100 text-gray-600'}`}>{r.overallGrade}</span>
                  )}
                  <ArrowRight size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
