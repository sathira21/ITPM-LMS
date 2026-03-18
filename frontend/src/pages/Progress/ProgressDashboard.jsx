import { useEffect, useState, useCallback } from 'react';
import {
  BarChart3, Users, BookOpen, Clock, TrendingUp, Download,
  Search, ChevronDown, Eye, CheckCircle2, AlertCircle,
  RefreshCw, FileDown, User, BookMarked, ArrowRight,
  Grid3X3, List, Filter, X, Layers, GraduationCap,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/* ─── Helpers ─── */
const formatTime = (seconds) => {
  if (!seconds) return '0 min';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return `${hrs}h ${remainMins}m`;
};

const PIE_COLORS = ['#10b981', '#3b82f6', '#e5e7eb'];

/* ─── Tabs ─── */
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'courses', label: 'By Course', icon: Layers },
  { id: 'students', label: 'By Student', icon: Users },
  { id: 'materials', label: 'By Content', icon: BookOpen },
  { id: 'matrix', label: 'Progress Matrix', icon: Grid3X3 },
];

/* ─── Sub-components ─── */
const StatCard = ({ label, value, icon: Icon, color, subtitle }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value ?? '—'}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const ProgressBar = ({ percentage, size = 'md' }) => (
  <div className={`bg-gray-100 rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}>
    <div
      className={`h-full rounded-full transition-all duration-500 ${
        percentage >= 80 ? 'bg-emerald-500' : percentage >= 50 ? 'bg-blue-500' : percentage > 0 ? 'bg-amber-500' : 'bg-gray-300'
      }`}
      style={{ width: `${Math.min(percentage, 100)}%` }}
    />
  </div>
);

/* ─── Overview Tab ─── */
const OverviewTab = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const pieData = [
    { name: 'Completed', value: data.completedCount, color: '#10b981' },
    { name: 'In Progress', value: data.inProgressCount, color: '#3b82f6' },
    { name: 'Not Started', value: data.notStartedCount, color: '#e5e7eb' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={data.totalStudents}
          icon={Users}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          label="Completion Rate"
          value={`${data.overallCompletionRate}%`}
          icon={CheckCircle2}
          color="from-emerald-500 to-teal-600"
        />
        <StatCard
          label="Avg Time/Content"
          value={formatTime(data.averageTimeSpent)}
          icon={Clock}
          color="from-violet-500 to-purple-600"
        />
        <StatCard
          label="Total Materials"
          value={data.totalMaterials}
          icon={BookOpen}
          color="from-amber-400 to-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Completion by Subject */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Completions by Subject</h3>
          {data.completionBySubject?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.completionBySubject}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completions" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No data available</p>
          )}
        </div>

        {/* Progress Distribution */}
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Progress Distribution</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top/Bottom Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            Most Viewed Content
          </h3>
          <div className="space-y-3">
            {data.mostViewedMaterials?.slice(0, 5).map((m, i) => (
              <div key={m._id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                  <p className="text-xs text-gray-400">{m.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{m.viewCount} views</p>
                  <p className="text-xs text-emerald-600">{m.completions} completed</p>
                </div>
              </div>
            ))}
            {!data.mostViewedMaterials?.length && (
              <p className="text-gray-400 text-sm text-center py-4">No data available</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-500" />
            Low Engagement Content
          </h3>
          <div className="space-y-3">
            {data.leastEngagedMaterials?.slice(0, 5).map((m, i) => (
              <div key={m._id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                  <p className="text-xs text-gray-400">{m.subject}</p>
                </div>
                <p className="text-sm text-gray-500">{m.viewCount || 0} views</p>
              </div>
            ))}
            {!data.leastEngagedMaterials?.length && (
              <p className="text-gray-400 text-sm text-center py-4">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Completions */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">Recent Completions</h3>
        <div className="space-y-2">
          {data.recentCompletions?.slice(0, 8).map((c) => (
            <div key={c._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {c.student?.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{c.student?.name}</p>
                <p className="text-xs text-gray-500 truncate">Completed: {c.material?.title}</p>
              </div>
              <span className="text-xs text-gray-400">
                {c.completedAt ? new Date(c.completedAt).toLocaleDateString() : ''}
              </span>
            </div>
          ))}
          {!data.recentCompletions?.length && (
            <p className="text-gray-400 text-sm text-center py-4">No recent completions</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Students Tab ─── */
const StudentsTab = ({ onViewStudent }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('completion');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMaterials, setTotalMaterials] = useState(0);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, sortBy });
      if (search) params.append('search', search);
      const { data } = await api.get(`/progress/analytics/students?${params}`);
      setStudents(data.data);
      setTotalPages(data.pages);
      setTotalMaterials(data.totalMaterials);
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input pl-10"
              placeholder="Search students..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select
            className="input w-44"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="completion">Sort by Completion</option>
            <option value="time">Sort by Time Spent</option>
            <option value="recent">Sort by Recent Activity</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Student</th>
                <th className="text-center p-4 font-semibold text-gray-600">Progress</th>
                <th className="text-center p-4 font-semibold text-gray-600">Completed</th>
                <th className="text-center p-4 font-semibold text-gray-600">In Progress</th>
                <th className="text-center p-4 font-semibold text-gray-600">Time Spent</th>
                <th className="text-center p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {s.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar percentage={s.completionPercentage} size="sm" />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                        {s.completionPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="badge bg-emerald-100 text-emerald-700">{s.completed}/{totalMaterials}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="badge bg-blue-100 text-blue-700">{s.inProgress}</span>
                  </td>
                  <td className="p-4 text-center text-gray-600">{formatTime(s.totalTimeSpent)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onViewStudent?.(s._id)}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {students.length === 0 && (
            <div className="text-center py-12 text-gray-400">No students found</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                page === p ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Materials Tab ─── */
const MaterialsTab = ({ onViewMaterial }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [sortBy, setSortBy] = useState('views');
  const [subjects, setSubjects] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, sortBy });
      if (subject) params.append('subject', subject);
      const { data } = await api.get(`/progress/analytics/materials?${params}`);
      setMaterials(data.data);
      setTotalPages(data.pages);
      setSubjects(data.subjects || []);
      setTotalStudents(data.totalStudents);
    } finally {
      setLoading(false);
    }
  }, [page, subject, sortBy]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-3">
          <select
            className="input w-44"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setPage(1); }}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="input w-44"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="views">Sort by Views</option>
            <option value="completions">Sort by Completions</option>
            <option value="time">Sort by Avg Time</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Content</th>
                <th className="text-center p-4 font-semibold text-gray-600">Views</th>
                <th className="text-center p-4 font-semibold text-gray-600">Completions</th>
                <th className="text-center p-4 font-semibold text-gray-600">Completion Rate</th>
                <th className="text-center p-4 font-semibold text-gray-600">Avg Time</th>
                <th className="text-center p-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-800">{m.title}</p>
                      <p className="text-xs text-gray-400">{m.subject} · {m.fileType?.toUpperCase()}</p>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="badge bg-blue-50 text-blue-700">{m.totalViews}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="badge bg-emerald-100 text-emerald-700">{m.completions}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <ProgressBar percentage={m.completionRate} size="sm" />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                        {m.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-gray-600">{formatTime(m.averageTimeSpent)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onViewMaterial?.(m._id)}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {materials.length === 0 && (
            <div className="text-center py-12 text-gray-400">No materials found</div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                page === p ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Matrix Tab ─── */
const MatrixTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');

  const fetchMatrix = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ studentLimit: 30, materialLimit: 15 });
      if (subject) params.append('subject', subject);
      const { data } = await api.get(`/progress/analytics/matrix?${params}`);
      setData(data.data);
    } finally {
      setLoading(false);
    }
  }, [subject]);

  useEffect(() => {
    fetchMatrix();
  }, [fetchMatrix]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in_progress': return 'bg-blue-400';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="card py-4">
        <select
          className="input w-52"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">All Subjects</option>
          {data.subjects?.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Matrix Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-blue-400" />
          <span className="text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-gray-200" />
          <span className="text-gray-600">Not Started</span>
        </div>
      </div>

      {/* Matrix */}
      <div className="card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white z-10 text-left p-3 font-semibold text-gray-600 min-w-32">
                Student
              </th>
              {data.materials?.map((m) => (
                <th key={m._id} className="p-2 text-center min-w-16 max-w-20">
                  <div className="truncate font-medium text-gray-600" title={m.title}>
                    {m.title?.substring(0, 12)}...
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.students?.map((student) => (
              <tr key={student._id} className="border-t border-gray-100">
                <td className="sticky left-0 bg-white p-3 font-medium text-gray-800">
                  {student.name}
                </td>
                {data.materials?.map((material) => {
                  const progress = data.matrix?.[`${student._id}-${material._id}`];
                  return (
                    <td key={material._id} className="p-2 text-center">
                      <div
                        className={`w-6 h-6 rounded mx-auto cursor-help transition-transform hover:scale-110 ${getStatusColor(progress?.status)}`}
                        title={`${progress?.status || 'Not started'} - ${formatTime(progress?.timeSpent || 0)}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {(!data.students?.length || !data.materials?.length) && (
          <div className="text-center py-12 text-gray-400">No data available</div>
        )}
      </div>
    </div>
  );
};

/* ─── Courses Tab ─── */
const CoursesTab = ({ onViewCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/progress/analytics/courses');
      setCourses(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card text-center py-12">
          <Layers size={40} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No published courses found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course._id} className="card hover:shadow-lg transition-shadow">
              {/* Course Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg">
                    {course.code}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-2 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{course.category}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Average Completion</span>
                  <span className="font-semibold">{course.averageCompletion}%</span>
                </div>
                <ProgressBar percentage={course.averageCompletion} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{course.enrolledCount}</p>
                  <p className="text-xs text-gray-500">Enrolled</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-emerald-700">{course.studentsCompleted}</p>
                  <p className="text-xs text-gray-500">Completed Course</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-700">{course.totalMaterials}</p>
                  <p className="text-xs text-gray-500">Materials</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-violet-700">{formatTime(course.averageTimePerStudent)}</p>
                  <p className="text-xs text-gray-500">Avg Time</p>
                </div>
              </div>

              {/* Course Completion Rate */}
              <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-4">
                <span className="text-gray-500">Course Completion Rate</span>
                <span className={`font-bold ${
                  course.courseCompletionRate >= 80 ? 'text-emerald-600' :
                  course.courseCompletionRate >= 50 ? 'text-blue-600' :
                  'text-amber-600'
                }`}>
                  {course.courseCompletionRate}%
                </span>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => onViewCourse?.(course._id)}
                className="btn-primary w-full justify-center mt-4 py-2"
              >
                <Eye size={14} /> View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Course Detail Modal ─── */
const CourseDetailModal = ({ courseId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await api.get(`/progress/analytics/courses/${courseId}`);
        setData(data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [courseId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-4xl my-8 bg-white rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Course Progress Detail</h2>
            {data?.course && (
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-semibold text-primary-600">{data.course.code}</span> · {data.course.title}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-gray-900">{data.summary.averageCompletion}%</p>
                <p className="text-xs text-gray-500">Avg Completion</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-blue-700">{data.summary.enrolledStudents}</p>
                <p className="text-xs text-gray-500">Students</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-emerald-700">{data.summary.studentsCompleted}</p>
                <p className="text-xs text-gray-500">Finished Course</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-violet-700">{data.summary.courseCompletionRate}%</p>
                <p className="text-xs text-gray-500">Completion Rate</p>
              </div>
            </div>

            {/* Module Analytics */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Module Progress</h3>
              <div className="space-y-2">
                {data.moduleAnalytics?.map((module, idx) => (
                  <div key={module._id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <span className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{module.title}</p>
                      <p className="text-xs text-gray-400">{module.totalMaterials} materials</p>
                    </div>
                    <div className="w-32">
                      <ProgressBar percentage={module.completionRate} size="sm" />
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-12 text-right">
                      {module.completionRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Progress Table */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Student Progress</h3>
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-600">Student</th>
                      <th className="text-center p-3 font-semibold text-gray-600">Progress</th>
                      <th className="text-center p-3 font-semibold text-gray-600">Completed</th>
                      <th className="text-center p-3 font-semibold text-gray-600">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.studentProgress?.map((s) => (
                      <tr key={s._id} className="border-b border-gray-100">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                              {s.name?.charAt(0)}
                            </div>
                            <span className="font-medium text-gray-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <ProgressBar percentage={s.completionPercentage} size="sm" />
                            </div>
                            <span className="text-xs font-semibold w-10 text-right">{s.completionPercentage}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="badge bg-emerald-100 text-emerald-700">{s.completed}/{data.summary.totalMaterials}</span>
                        </td>
                        <td className="p-3 text-center text-gray-600">{formatTime(s.timeSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!data.studentProgress?.length && (
                  <p className="text-gray-400 text-sm text-center py-4">No students enrolled</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ─── Student Detail Modal ─── */
const StudentDetailModal = ({ studentId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const { data } = await api.get(`/progress/analytics/students/${studentId}`);
        setData(data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [studentId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-3xl my-8 bg-white rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Student Progress Detail</h2>
            {data?.student && (
              <p className="text-sm text-gray-500 mt-0.5">{data.student.name} · {data.student.email}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-gray-900">{data.summary.completionPercentage}%</p>
                <p className="text-xs text-gray-500">Completion</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-emerald-700">{data.summary.completed}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-blue-700">{data.summary.inProgress}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-black text-violet-700">{formatTime(data.summary.totalTimeSpent)}</p>
                <p className="text-xs text-gray-500">Total Time</p>
              </div>
            </div>

            {/* Progress List */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Content Progress</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.progress?.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-2 h-8 rounded-full ${
                      p.status === 'completed' ? 'bg-emerald-500' : p.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.material?.title}</p>
                      <p className="text-xs text-gray-400">{p.material?.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${
                        p.status === 'completed' ? 'text-emerald-600' : p.status === 'in_progress' ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {p.status === 'completed' ? 'Completed' : p.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                      </p>
                      <p className="text-xs text-gray-400">{formatTime(p.totalTimeSpent)}</p>
                    </div>
                  </div>
                ))}
                {!data.progress?.length && (
                  <p className="text-gray-400 text-sm text-center py-4">No progress recorded</p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
export default function ProgressDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const { data } = await api.get('/progress/analytics/overview');
      setOverview(data.data);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleExport = async (format) => {
    try {
      const { data } = await api.get(`/progress/analytics/export?format=${format}&type=students`);
      if (format === 'csv') {
        const blob = new Blob([data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `progress-export-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Progress Analytics</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track student engagement and content completion</p>
        </div>
        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <button onClick={() => handleExport('csv')} className="btn-secondary">
              <FileDown size={14} /> Export CSV
            </button>
          )}
          <button onClick={fetchOverview} className="btn-secondary">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab data={overview} loading={loadingOverview} />}
      {tab === 'courses' && <CoursesTab onViewCourse={setSelectedCourse} />}
      {tab === 'students' && <StudentsTab onViewStudent={setSelectedStudent} />}
      {tab === 'materials' && <MaterialsTab onViewMaterial={setSelectedMaterial} />}
      {tab === 'matrix' && <MatrixTab />}

      {/* Detail Modals */}
      {selectedStudent && (
        <StudentDetailModal studentId={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
      {selectedCourse && (
        <CourseDetailModal courseId={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
}
