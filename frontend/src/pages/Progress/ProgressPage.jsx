import { useEffect, useState, useCallback, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, Zap, Award, Bell, BellOff,
  RefreshCw, BookOpen, Users2, MessageSquare, Star, Shield,
  ChevronRight, Activity, Target, Flame, Calendar, Trophy,
  AlertTriangle, CheckCircle, Info, X, Eye, GraduationCap,
  BarChart2, Sparkles, ArrowUp, ArrowDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

/* ══════════════════ HELPERS ══════════════════ */

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const scoreColor = (s) =>
  s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : s >= 25 ? '#ef4444' : '#94a3b8';

const scoreGradient = (s) =>
  s >= 75 ? 'from-emerald-500 to-teal-500'
  : s >= 50 ? 'from-amber-500 to-orange-500'
  : s >= 25 ? 'from-red-500 to-rose-500'
  : 'from-gray-400 to-gray-500';

const scoreLabel = (s) =>
  s >= 90 ? 'Excellent' : s >= 75 ? 'Good' : s >= 50 ? 'Average' : s >= 25 ? 'Needs Work' : 'Inactive';

/* ══════════════════ SVG PROGRESS RING ══════════════════ */
function ProgressRing({ score = 0, size = 168, strokeWidth = 14 }) {
  const r      = (size - strokeWidth) / 2;
  const circum = 2 * Math.PI * r;
  const filled = (score / 100) * circum;
  const offset = circum - filled;
  const cx = size / 2;
  const gradId = `ring-grad-${score}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'} />
            <stop offset="100%" stopColor={score >= 75 ? '#06b6d4' : score >= 50 ? '#f97316' : '#f43f5e'} />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circum}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-gray-900 leading-none">{score}</span>
        <span className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Score</span>
      </div>
    </div>
  );
}

/* ══════════════════ MINI SPARKLINE ══════════════════ */
function Sparkline({ data = [], width = 80, height = 32, color = '#6366f1' }) {
  if (!data.length) return <div style={{ width, height }} className="opacity-20 bg-gray-200 rounded" />;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${height} ${pts} ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polygon fill={`url(#sg-${color.replace('#','')})`} points={area} />
      <polyline fill="none" stroke={color} strokeWidth={1.5} points={pts} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ══════════════════ ACTIVITY HEATMAP ══════════════════ */
function ActivityHeatmap({ chartData = [] }) {
  const last28 = chartData.slice(-28);
  const weeks  = [];
  for (let i = 0; i < 4; i++) weeks.push(last28.slice(i * 7, i * 7 + 7));

  const colorFor = (score) =>
    score === 0  ? 'bg-gray-100'
    : score < 25 ? 'bg-indigo-100'
    : score < 50 ? 'bg-indigo-300'
    : score < 75 ? 'bg-indigo-500'
    :               'bg-indigo-700';

  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">Activity Heatmap — last 28 days</p>
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={`${fmtDate(day.date)}: ${day.score} pts`}
                className={`w-6 h-6 rounded-sm ${colorFor(day.score)} cursor-default transition-transform hover:scale-125`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs text-gray-400">Less</span>
        {['bg-gray-100','bg-indigo-100','bg-indigo-300','bg-indigo-500','bg-indigo-700'].map((c,i) => (
          <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-gray-400">More</span>
      </div>
    </div>
  );
}

/* ══════════════════ ACHIEVEMENT BADGES ══════════════════ */
const ALL_BADGES = [
  { key: 'streak-3',  icon: Flame,    label: '3-Day Streak',   color: 'from-orange-400 to-amber-400',  desc: '3 days active' },
  { key: 'streak-7',  icon: Flame,    label: '7-Day Streak',   color: 'from-orange-500 to-red-500',    desc: '7 days active' },
  { key: 'streak-14', icon: Zap,      label: '2-Week Streak',  color: 'from-violet-500 to-purple-600', desc: '14 days active' },
  { key: 'streak-30', icon: Trophy,   label: '30-Day Legend',  color: 'from-yellow-500 to-amber-600',  desc: '30 days active' },
  { key: 'score-75',  icon: Star,     label: 'Progress 75+',   color: 'from-blue-500 to-cyan-500',     desc: 'Score ≥ 75' },
  { key: 'score-90',  icon: Award,    label: 'Excellence 90+', color: 'from-emerald-500 to-teal-500',  desc: 'Score ≥ 90' },
  { key: 'quiz-100',  icon: Target,   label: 'Perfect Quiz',   color: 'from-rose-500 to-pink-500',     desc: '100% quiz score' },
];

function AchievementBadge({ badge, earned }) {
  const Icon = badge.icon;
  return (
    <div className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${earned ? 'border-transparent bg-white shadow-soft' : 'border-dashed border-gray-200 bg-gray-50/50 opacity-50'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${earned ? `bg-gradient-to-br ${badge.color} shadow-md` : 'bg-gray-200'}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="text-center">
        <p className={`text-xs font-bold ${earned ? 'text-gray-800' : 'text-gray-400'}`}>{badge.label}</p>
        <p className="text-[10px] text-gray-400">{badge.desc}</p>
      </div>
      {earned && <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />}
    </div>
  );
}

/* ══════════════════ NOTIFICATION CARD ══════════════════ */
const NOTIF_CONFIG = {
  progress_drop: { icon: TrendingDown,   bg: 'bg-red-50',    border: 'border-red-200',    icon_color: 'text-red-500' },
  streak_break:  { icon: AlertTriangle,  bg: 'bg-amber-50',  border: 'border-amber-200',  icon_color: 'text-amber-500' },
  milestone:     { icon: Award,          bg: 'bg-violet-50', border: 'border-violet-200', icon_color: 'text-violet-500' },
  quiz_decline:  { icon: BarChart2,      bg: 'bg-orange-50', border: 'border-orange-200', icon_color: 'text-orange-500' },
  weekly_summary:{ icon: Calendar,       bg: 'bg-blue-50',   border: 'border-blue-200',   icon_color: 'text-blue-500'  },
};

function NotifCard({ n }) {
  const cfg  = NOTIF_CONFIG[n.type] || NOTIF_CONFIG.weekly_summary;
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border} ${!n.isRead ? 'ring-1 ring-inset ring-current ring-opacity-10' : 'opacity-75'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white shadow-sm`}>
        <Icon size={15} className={cfg.icon_color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-800">{n.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
        <p className="text-[10px] text-gray-400 mt-1">{fmtDate(n.createdAt)}</p>
      </div>
      {!n.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
    </div>
  );
}

/* ══════════════════ CUSTOM CHART TOOLTIP ══════════════════ */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-float p-3 text-xs min-w-36">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3">
          <span className="text-gray-500">{p.name}</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════ TREND BADGE ══════════════════ */
function TrendBadge({ value }) {
  if (value > 0) return <span className="flex items-center gap-0.5 text-emerald-600 text-xs font-bold"><ArrowUp size={11} />+{value}</span>;
  if (value < 0) return <span className="flex items-center gap-0.5 text-red-500 text-xs font-bold"><ArrowDown size={11} />{value}</span>;
  return <span className="flex items-center gap-0.5 text-gray-400 text-xs font-bold"><Minus size={11} />—</span>;
}

/* ══════════════════ METRIC CARD ══════════════════ */
function MetricCard({ icon: Icon, label, value, sub, color = 'bg-indigo-100 text-indigo-700' }) {
  return (
    <div className="card py-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xl font-black text-gray-900 leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

/* ══════════════════ STUDENT DETAIL MODAL ══════════════════ */
function StudentDetailModal({ studentId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/progress/student/${studentId}?days=14`).then(r => setData(r.data));
  }, [studentId]);

  if (!data) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(15,10,40,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,10,40,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-float animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-gray-900">{data.student?.name}</p>
            <p className="text-xs text-gray-400">{data.student?.email} · {data.student?.grade || 'No grade'}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">14-Day Progress Chart</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.chart} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tickFormatter={v => fmtDate(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="score" name="Score" stroke="#6366f1" fill="url(#detailGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {(data.milestones || []).map(m => {
              const badge = ALL_BADGES.find(b => b.key === m);
              if (!badge) return null;
              const Icon = badge.icon;
              return (
                <span key={m} className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r ${badge.color} text-white text-xs font-bold`}>
                  <Icon size={10} />{badge.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════ TEACHER / ADMIN VIEW ══════════════════ */
function ClassProgressView() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState('all'); // all | at-risk | top

  const load = useCallback(() => {
    setLoading(true);
    api.get('/progress/class').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const syncAll = async () => {
    setSyncing(true);
    const students = data?.students || [];
    for (const s of students) {
      try { await api.post(`/progress/student/${s.student._id}/sync`); } catch {}
    }
    setSyncing(false);
    load();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Calculating class progress...</p>
      </div>
    </div>
  );

  const summary  = data?.summary || {};
  const students = (data?.students || []).filter(s =>
    filter === 'at-risk' ? s.atRisk
    : filter === 'top'   ? s.topPerformer
    : true
  );

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Students', value: summary.total   || 0, color: 'bg-indigo-50 text-indigo-700',  icon: GraduationCap },
          { label: 'Class Avg Score', value: summary.classAvg || 0, color: 'bg-blue-50 text-blue-700',   icon: BarChart2 },
          { label: 'At Risk',         value: summary.atRisk  || 0, color: 'bg-red-50 text-red-600',      icon: AlertTriangle },
          { label: 'Top Performers',  value: summary.topCount || 0, color: 'bg-emerald-50 text-emerald-700', icon: Trophy },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card py-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}><Icon size={18} /></div>
              <div>
                <p className="text-xl font-black text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter + Sync */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 bg-white rounded-2xl border border-gray-100 shadow-soft">
          {[['all','All Students'],['at-risk','At Risk'],['top','Top Performers']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${filter === v ? 'bg-gradient-to-r from-primary-600 to-violet-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={syncAll} disabled={syncing} className="btn-secondary text-sm">
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync All'}
        </button>
      </div>

      {/* At-risk alert */}
      {summary.atRisk > 0 && filter !== 'top' && (
        <div className="card border-amber-200 bg-amber-50 !p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{summary.atRisk} student{summary.atRisk > 1 ? 's' : ''}</strong> {summary.atRisk > 1 ? 'are' : 'is'} showing declining progress.
            Consider reaching out to provide support.
          </p>
        </div>
      )}

      {/* Student table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Student', 'Score', 'Streak', 'Quiz Avg', '7-Day Trend', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No students found</td></tr>
              ) : students.map(s => (
                <tr key={s.student._id} className={`hover:bg-gray-50/80 transition-colors ${s.atRisk ? 'bg-red-50/30' : s.topPerformer ? 'bg-emerald-50/20' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${scoreGradient(s.currentScore)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                        {s.student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{s.student.name}</p>
                        <p className="text-xs text-gray-400">{s.student.studentId || s.student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black" style={{ color: scoreColor(s.currentScore) }}>{s.currentScore}</span>
                      <span className="text-xs text-gray-400">{scoreLabel(s.currentScore)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-orange-500 font-bold text-sm">
                      <Flame size={13} />{s.streak}d
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-700">{s.weekAvg}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Sparkline data={s.sparkline} color={scoreColor(s.weekAvg)} />
                      <TrendBadge value={s.trend} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.atRisk
                      ? <span className="badge bg-red-100 text-red-600 text-xs"><AlertTriangle size={10} /> At Risk</span>
                      : s.topPerformer
                      ? <span className="badge bg-emerald-100 text-emerald-700 text-xs"><Trophy size={10} /> Top</span>
                      : <span className="badge bg-gray-100 text-gray-500 text-xs">Normal</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetail(s.student._id)}
                      className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && <StudentDetailModal studentId={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

/* ══════════════════ STUDENT VIEW ══════════════════ */
function StudentProgressView() {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [syncing,     setSyncing]     = useState(false);
  const [days,        setDays]        = useState(7);
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [allNotifs,   setAllNotifs]   = useState([]);
  const notifRef = useRef(null);

  const load = useCallback(() => {
    api.get(`/progress/my?days=30`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Close notif panel on outside click
  useEffect(() => {
    const fn = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/progress/sync');
      await load();
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenNotifs = async () => {
    setShowNotifs(v => !v);
    if (!showNotifs) {
      const r = await api.get('/progress/notifications');
      setAllNotifs(r.data.notifications || []);
      // Mark read
      await api.put('/progress/notifications/read');
      setData(prev => prev ? { ...prev, unreadCount: 0, notifications: [] } : prev);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading your progress...</p>
      </div>
    </div>
  );

  const summary   = data?.summary      || {};
  const chart     = data?.chart        || [];
  const milestones= data?.milestones   || [];
  const notifs    = data?.notifications|| [];
  const unread    = data?.unreadCount  || 0;
  const chartData = chart.slice(-(days));

  const score     = summary.currentScore || 0;
  const trend     = summary.weekTrend   || 0;

  return (
    <div className="space-y-6">

      {/* ── Hero Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Progress Score card */}
        <div className="lg:col-span-1 card relative overflow-hidden">
          {/* Aurora orb */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20"
            style={{ background: `radial-gradient(circle, ${scoreColor(score)}, transparent)` }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-bold text-gray-500">Progress Score</p>
                <p className="text-xs text-gray-400">Today's performance</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={handleOpenNotifs}
                    className={`p-2 rounded-xl transition-colors relative ${unread > 0 ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'hover:bg-gray-100 text-gray-400'}`}
                  >
                    <Bell size={16} />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>

                  {/* Notification dropdown */}
                  {showNotifs && (
                    <div className="absolute right-0 top-10 w-80 bg-white border border-gray-100 rounded-2xl shadow-float z-50 overflow-hidden animate-scale-in">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-800">Smart Alerts</p>
                        <button onClick={() => setShowNotifs(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
                      </div>
                      <div className="max-h-72 overflow-y-auto p-3 space-y-2">
                        {(allNotifs.length ? allNotifs : notifs).length === 0 ? (
                          <div className="text-center py-6">
                            <BellOff size={24} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">No notifications yet</p>
                          </div>
                        ) : (allNotifs.length ? allNotifs : notifs).map(n => <NotifCard key={n._id} n={n} />)}
                      </div>
                    </div>
                  )}
                </div>

                <button onClick={handleSync} disabled={syncing} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center mb-4">
              <ProgressRing score={score} />
            </div>

            <div className="text-center mb-4">
              <p className={`text-lg font-black ${score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                {scoreLabel(score)}
              </p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendBadge value={trend} />
                <span className="text-xs text-gray-400">vs last week</span>
              </div>
            </div>

            {/* Component bars */}
            <div className="space-y-2">
              {[
                { label: 'Quiz',        value: data?.current?.quizComponent        || 0, color: 'bg-indigo-500' },
                { label: 'Engagement',  value: data?.current?.engagementComponent  || 0, color: 'bg-violet-500' },
                { label: 'Consistency', value: data?.current?.consistencyComponent || 0, color: 'bg-emerald-500' },
              ].map(c => (
                <div key={c.label}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{c.label}</span><span className="font-bold">{c.value}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full transition-all duration-700`} style={{ width: `${c.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics column */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-3">
          <MetricCard icon={Flame}   label="Current Streak"    value={`${summary.currentStreak || 0}d`} sub="consecutive days" color="bg-orange-100 text-orange-600" />
          <MetricCard icon={BookOpen} label="Quiz Avg Score"   value={`${summary.avgQuizScore || 0}%`} sub="last 30 days"     color="bg-blue-100 text-blue-700" />
          <MetricCard icon={Activity} label="Active Days"      value={summary.activeDays || 0}          sub="last 30 days"     color="bg-violet-100 text-violet-700" />
          <MetricCard icon={Target}   label="Total Attempts"   value={summary.totalQuizAttempts || 0}   sub="quizzes taken"    color="bg-emerald-100 text-emerald-700" />

          {/* Predictive indicator */}
          <div className="col-span-2 card bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-500" />
              <p className="text-sm font-bold text-indigo-800">Learning Insight</p>
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">
              {score >= 75
                ? `Excellent momentum! You're in the top tier with a ${score}-point score. Keep up your ${summary.currentStreak || 0}-day streak to maintain this level.`
                : score >= 50
                ? `You're on track. Taking ${3 - (data?.current?.metrics?.quizAttempts || 0)} more quiz${3 - (data?.current?.metrics?.quizAttempts || 0) !== 1 ? 'es' : ''} today could push your score above 75.`
                : score > 0
                ? `Your score is below average. Focus on daily logins and completing 1-2 quizzes to start rebuilding momentum.`
                : `No activity recorded today. Log in, attempt a quiz, or join a group to start your progress score!`
              }
            </p>
          </div>
        </div>
      </div>

      {/* ── Progress Chart ─────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <p className="font-bold text-gray-900">Progress Over Time</p>
            <p className="text-xs text-gray-400">Daily progress score breakdown</p>
          </div>
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
            {[7, 14, 30].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${days === d ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gQuiz" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tickFormatter={v => fmtDate(v)} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={75} stroke="#10b981" strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: 'Good', position: 'right', fontSize: 9, fill: '#10b981' }} />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 2" strokeOpacity={0.5} label={{ value: 'Avg',  position: 'right', fontSize: 9, fill: '#f59e0b' }} />
            <Area type="monotone" dataKey="score" name="Progress" stroke="#6366f1" fill="url(#gScore)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#6366f1' }} />
            <Area type="monotone" dataKey="quiz"  name="Quiz"     stroke="#8b5cf6" fill="url(#gQuiz)"  strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-indigo-500" />
              <p className="font-bold text-gray-900 text-sm">Smart Alerts</p>
              {unread > 0 && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">{unread} new</span>}
            </div>
          </div>
          {notifs.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle size={28} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">All clear!</p>
              <p className="text-xs text-gray-400 mt-0.5">No pending alerts. Keep up the great work!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifs.slice(0, 4).map(n => <NotifCard key={n._id} n={n} />)}
            </div>
          )}
        </div>

        {/* Activity Heatmap */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} className="text-indigo-500" />
            <p className="font-bold text-gray-900 text-sm">Activity Calendar</p>
          </div>
          <ActivityHeatmap chartData={chart} />
        </div>
      </div>

      {/* ── Achievements ──────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={15} className="text-amber-500" />
          <p className="font-bold text-gray-900 text-sm">Achievements</p>
          <span className="text-xs text-gray-400">{milestones.length}/{ALL_BADGES.length} earned</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {ALL_BADGES.map(badge => (
            <AchievementBadge key={badge.key} badge={badge} earned={milestones.includes(badge.key)} />
          ))}
        </div>
      </div>

    </div>
  );
}

/* ══════════════════ MAIN PAGE ══════════════════ */
export default function ProgressPage() {
  const { user } = useAuth();
  const isStudent = user?.role === 'student';

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity size={22} className="text-indigo-500" />
            {isStudent ? 'My Progress' : 'Student Progress Tracker'}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {isStudent
              ? 'Track your learning journey with smart insights and daily feedback'
              : 'Monitor class-wide progress, identify at-risk students, and celebrate top performers'
            }
          </p>
        </div>
      </div>

      {isStudent ? <StudentProgressView /> : <ClassProgressView />}
    </div>
  );
}
