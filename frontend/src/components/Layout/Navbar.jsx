import { Menu, Bell, Search, Home, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const ROLE_META = {
  admin:    { badge: 'bg-violet-100 text-violet-700 border-violet-200',  dot: 'bg-violet-500' },
  teacher:  { badge: 'bg-blue-100 text-blue-700 border-blue-200',        dot: 'bg-blue-500' },
  student:  { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  guardian: { badge: 'bg-orange-100 text-orange-700 border-orange-200',  dot: 'bg-orange-500' },
};

const ROLE_GRADIENT = {
  admin:    'from-violet-500 to-purple-600',
  teacher:  'from-blue-500 to-cyan-500',
  student:  'from-emerald-500 to-teal-600',
  guardian: 'from-orange-400 to-amber-500',
};

export default function Navbar({ onMenuClick }) {
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const meta = ROLE_META[roleName] || ROLE_META.student;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0 z-10 sticky top-0">
      {/* Menu toggle */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all text-gray-500"
      >
        <Menu size={19} />
      </button>

      {/* Breadcrumb / Search */}
      <div className="flex-1">
        {showSearch ? (
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              onBlur={() => setShowSearch(false)}
              placeholder="Search users, reports, groups..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
            <button
              onMouseDown={() => setShowSearch(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 px-3.5 py-2 rounded-xl border border-gray-200/60"
          >
            <Search size={14} />
            <span className="hidden sm:block">Search anything...</span>
            <span className="hidden sm:block ml-auto text-xs bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded font-mono">⌘K</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Home link */}
        <Link to="/" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600" title="Go to landing page">
          <Home size={17} />
        </Link>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* User chip */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ROLE_GRADIENT[roleName] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border capitalize ${meta.badge}`}>
                {roleName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
