import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Link2, FileText, Users2,
  Activity, LogOut, GraduationCap, Shield, BookOpen,
  ChevronRight, Heart, BookMarked, MessageSquare, ClipboardList, BarChart3, Layers, LifeBuoy,
} from 'lucide-react';

const ROLE_COLORS = {
  admin:    { from: 'from-violet-600',   to: 'to-purple-700',   text: 'text-violet-600',   bg: 'bg-violet-50' },
  teacher:  { from: 'from-blue-600',     to: 'to-cyan-600',     text: 'text-blue-600',     bg: 'bg-blue-50' },
  student:  { from: 'from-emerald-500',  to: 'to-teal-600',     text: 'text-emerald-600',  bg: 'bg-emerald-50' },
  guardian: { from: 'from-orange-500',   to: 'to-amber-500',    text: 'text-orange-600',   bg: 'bg-orange-50' },
};

const ROLE_ICONS = { admin: Shield, teacher: BookOpen, student: GraduationCap, guardian: Heart };

const navItems = {
  admin: [
    { to: '/dashboard',            label: 'Dashboard',       icon: LayoutDashboard },
    { to: '/dashboard/courses',    label: 'Courses',         icon: Layers },
    { to: '/dashboard/users',      label: 'User Management', icon: Users },
    { to: '/dashboard/guardians',  label: 'Guardian Links',  icon: Link2 },
    { to: '/dashboard/materials',  label: 'Content Manager', icon: BookMarked },
    { to: '/dashboard/progress',   label: 'Progress Analytics', icon: BarChart3 },
    { to: '/dashboard/reports',    label: 'Reports',         icon: FileText },
    { to: '/dashboard/groups',     label: 'Learning Groups', icon: Users2 },
    { to: '/dashboard/activity',   label: 'Activity Monitor',icon: Activity },
    { to: '/dashboard/feedback',   label: 'Feedback',        icon: MessageSquare },
    { to: '/dashboard/quiz',       label: 'Quiz Management', icon: ClipboardList },
    { to: '/dashboard/support-tickets', label: 'Support Tickets', icon: LifeBuoy },
  ],
  teacher: [
    { to: '/dashboard',            label: 'Dashboard',       icon: LayoutDashboard },
    { to: '/dashboard/courses',    label: 'Courses',         icon: Layers },
    { to: '/dashboard/materials',  label: 'Content Manager', icon: BookMarked },
    { to: '/dashboard/progress',   label: 'Progress Analytics', icon: BarChart3 },
    { to: '/dashboard/guardians',  label: 'Guardian Links',  icon: Link2 },
    { to: '/dashboard/reports',    label: 'Reports',         icon: FileText },
    { to: '/dashboard/groups',     label: 'Learning Groups', icon: Users2 },
    { to: '/dashboard/activity',   label: 'My Activity',     icon: Activity },
    { to: '/dashboard/feedback',   label: 'Feedback',        icon: MessageSquare },
    { to: '/dashboard/quiz',       label: 'Quiz Management', icon: ClipboardList },
  ],
  student: [
    { to: '/dashboard',            label: 'Dashboard',       icon: LayoutDashboard },
    { to: '/dashboard/courses',    label: 'My Courses',      icon: Layers },
    { to: '/dashboard/materials',  label: 'Study Materials', icon: BookMarked },
    { to: '/dashboard/reports',    label: 'My Reports',      icon: FileText },
    { to: '/dashboard/groups',     label: 'Learning Groups', icon: Users2 },
    { to: '/dashboard/activity',   label: 'My Activity',     icon: Activity },
    { to: '/dashboard/feedback',   label: 'Feedback',        icon: MessageSquare },
    { to: '/dashboard/quiz',       label: 'Quizzes',         icon: ClipboardList },
    { to: '/dashboard/support-tickets', label: 'Support Tickets', icon: LifeBuoy },
  ],
  guardian: [
    { to: '/dashboard',            label: 'Dashboard',       icon: LayoutDashboard },
    { to: '/dashboard/reports',    label: "Student Reports", icon: FileText },
    { to: '/dashboard/activity',   label: 'Activity Log',    icon: Activity },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const items = navItems[roleName] || [];
  const colors = ROLE_COLORS[roleName] || ROLE_COLORS.admin;
  const RoleIcon = ROLE_ICONS[roleName] || Shield;

  const handleLogout = () => { logout(); navigate('/'); };
  const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col bg-white border-r border-gray-100 transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Brand header */}
        <div className={`bg-gradient-to-br ${colors.from} ${colors.to} p-5 relative overflow-hidden`}>
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">eduCare</p>
                <p className="text-white/60 text-xs mt-0.5">LMS Platform</p>
              </div>
            </div>
            {/* User card */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center text-white font-black text-base flex-shrink-0 border border-white/20">
                {avatarLetter}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-sm truncate leading-none">{user?.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <p className="text-white/70 text-xs capitalize">{roleName}</p>
                </div>
              </div>
              <RoleIcon size={14} className="text-white/50 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Navigation</p>
          <ul className="space-y-0.5">
            {items.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/dashboard'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? `${colors.bg} ${colors.text} shadow-sm`
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                        isActive ? `bg-gradient-to-br ${colors.from} ${colors.to} shadow-sm` : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <Icon size={15} className={isActive ? 'text-white' : 'text-gray-500'} />
                      </div>
                      <span className="flex-1">{label}</span>
                      {isActive && <div className={`w-1.5 h-5 rounded-full bg-gradient-to-b ${colors.from} ${colors.to}`} />}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200 group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <LogOut size={15} className="text-red-500" />
            </div>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
