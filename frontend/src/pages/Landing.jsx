import { Link } from 'react-router-dom';
import {
  GraduationCap, Shield, BookOpen, Users2, ArrowRight,
  Link2, FileText, Activity, BarChart2, Users, Star,
  CheckCircle2, ChevronRight, Play, Sparkles,
  Brain, Target, TrendingUp, Globe, Zap, Heart,
  ClipboardList, MessageSquare, BookMarked,
} from 'lucide-react';

/* ─── Illustration Components ─────────────────────────────────────────────── */

const DashboardMockup = () => (
  <svg viewBox="0 0 600 440" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <linearGradient id="sidebg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#4f46e5"/>
        <stop offset="100%" stopColor="#7c3aed"/>
      </linearGradient>
      <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35"/>
        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02"/>
      </linearGradient>
      <clipPath id="mockupClip">
        <rect width="600" height="440" rx="18"/>
      </clipPath>
    </defs>

    {/* Browser shell */}
    <rect width="600" height="440" rx="18" fill="#1a1635"/>
    <rect width="600" height="44" fill="#231f4a"/>
    <circle cx="24" cy="22" r="6" fill="#ff5f57"/>
    <circle cx="44" cy="22" r="6" fill="#febc2e"/>
    <circle cx="64" cy="22" r="6" fill="#28c840"/>
    <rect x="120" y="12" width="360" height="20" rx="10" fill="rgba(255,255,255,0.07)"/>
    <text x="300" y="25" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="system-ui, sans-serif">localhost:5173/dashboard</text>

    {/* App background */}
    <rect x="0" y="44" width="600" height="396" fill="#f5f4fc"/>

    {/* Sidebar */}
    <rect x="0" y="44" width="148" height="396" fill="url(#sidebg)"/>
    {/* Sidebar dot-grid overlay */}
    {[...Array(8)].map((_, r) => [...Array(4)].map((_, c) => (
      <circle key={`${r}-${c}`} cx={14 + c * 38} cy={60 + r * 48} r="1.2" fill="rgba(255,255,255,0.12)"/>
    )))}

    {/* Logo */}
    <rect x="12" y="56" width="30" height="30" rx="9" fill="rgba(255,255,255,0.18)"/>
    <text x="27" y="76" textAnchor="middle" fill="white" fontSize="15">🎓</text>
    <text x="50" y="67" fill="white" fontSize="9.5" fontWeight="800" fontFamily="system-ui">eduCare</text>
    <text x="50" y="79" fill="rgba(255,255,255,0.45)" fontSize="7" fontFamily="system-ui">LMS Platform</text>

    {/* User pill */}
    <rect x="10" y="96" width="128" height="38" rx="10" fill="rgba(255,255,255,0.14)"/>
    <circle cx="30" cy="115" r="13" fill="rgba(255,255,255,0.22)"/>
    <text x="30" y="119" textAnchor="middle" fill="white" fontSize="11" fontWeight="800">A</text>
    <text x="48" y="109" fill="white" fontSize="8.5" fontWeight="700" fontFamily="system-ui">Admin User</text>
    <circle cx="48" cy="121" r="2.5" fill="#4ade80"/>
    <text x="55" y="124" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="system-ui">admin</text>

    {/* Active nav */}
    <rect x="10" y="144" width="128" height="26" rx="8" fill="rgba(255,255,255,0.2)"/>
    <rect x="14" y="148" width="18" height="18" rx="5" fill="rgba(255,255,255,0.25)"/>
    <text x="36" y="160" fill="white" fontSize="8.5" fontWeight="700" fontFamily="system-ui">Dashboard</text>
    <rect x="135" y="149" width="3" height="16" rx="2" fill="rgba(255,255,255,0.7)"/>

    {/* Nav items */}
    {['Users','Reports','Groups','Activity','Feedback','Quizzes'].map((item, i) => (
      <g key={item}>
        <rect x="14" y={178 + i * 28} width="16" height="16" rx="5" fill="rgba(255,255,255,0.12)"/>
        <text x="34" y={189 + i * 28} fill="rgba(255,255,255,0.6)" fontSize="8" fontFamily="system-ui">{item}</text>
      </g>
    ))}

    {/* Sign out */}
    <rect x="10" y="404" width="128" height="26" rx="8" fill="rgba(239,68,68,0.15)"/>
    <text x="74" y="421" textAnchor="middle" fill="rgba(252,165,165,0.9)" fontSize="8" fontFamily="system-ui">Sign Out</text>

    {/* Topbar */}
    <rect x="148" y="44" width="452" height="44" fill="white"/>
    <rect x="148" y="87" width="452" height="1" fill="#e2e8f0"/>
    <rect x="160" y="56" width="180" height="20" rx="10" fill="#f5f4fc"/>
    <text x="174" y="69" fill="#9ca3af" fontSize="8.5" fontFamily="system-ui">Search anything...</text>
    <circle cx="576" cy="66" r="13" fill="url(#sidebg)"/>
    <text x="576" y="70" textAnchor="middle" fill="white" fontSize="11" fontWeight="800">A</text>
    <circle cx="563" cy="57" r="3" fill="#f43f5e"/>

    {/* Page title */}
    <text x="160" y="108" fill="#1e1b4b" fontSize="13" fontWeight="800" fontFamily="system-ui">Overview</text>
    <text x="160" y="119" fill="#9ca3af" fontSize="8" fontFamily="system-ui">Welcome back, Admin</text>

    {/* Stat cards */}
    {[
      { x: 160, col: '#6366f1', label: 'Students', val: '248', change: '+12%', icon: '👥' },
      { x: 265, col: '#10b981', label: 'Teachers', val: '32',  change: '+3%',  icon: '👨‍🏫' },
      { x: 370, col: '#f59e0b', label: 'Reports',  val: '184', change: '+28%', icon: '📄' },
      { x: 475, col: '#8b5cf6', label: 'Groups',   val: '21',  change: '+5%',  icon: '🏫' },
    ].map(({ x, col, label, val, change, icon }) => (
      <g key={label}>
        <rect x={x} y="128" width="95" height="60" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
        <rect x={x} y="128" width="95" height="3" rx="2" fill={col}/>
        <text x={x + 10} y="153" fontSize="18">{icon}</text>
        <text x={x + 10} y="169" fill="#1e1b4b" fontSize="14" fontWeight="800" fontFamily="system-ui">{val}</text>
        <text x={x + 10} y="180" fill="#9ca3af" fontSize="7" fontFamily="system-ui">{label}</text>
        <rect x={x + 65} y="156" width="24" height="12" rx="6" fill={col} opacity="0.12"/>
        <text x={x + 77} y="165" textAnchor="middle" fill={col} fontSize="6.5" fontWeight="700" fontFamily="system-ui">{change}</text>
      </g>
    ))}

    {/* Area Chart */}
    <rect x="160" y="197" width="248" height="130" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
    <text x="172" y="213" fill="#1e1b4b" fontSize="9" fontWeight="700" fontFamily="system-ui">Monthly Registrations</text>
    {/* Grid lines */}
    {[0,1,2,3].map(i => (
      <line key={i} x1="172" y1={230 + i * 22} x2="396" y2={230 + i * 22} stroke="#f1f5f9" strokeWidth="1"/>
    ))}
    {/* Chart fill */}
    <path d="M 172 308 L 192 285 L 212 292 L 232 268 L 252 278 L 272 255 L 292 262 L 312 245 L 332 252 L 352 238 L 372 248 L 392 232 L 396 308 Z" fill="url(#chartArea)"/>
    {/* Chart line */}
    <path d="M 172 308 L 192 285 L 212 292 L 232 268 L 252 278 L 272 255 L 292 262 L 312 245 L 332 252 L 352 238 L 372 248 L 392 232" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Dots */}
    {[[172,308],[232,268],[292,262],[352,238],[392,232]].map(([px,py], i) => (
      <circle key={i} cx={px} cy={py} r="3" fill="#6366f1" stroke="white" strokeWidth="1.5"/>
    ))}
    {/* X axis labels */}
    {['Jan','Mar','May','Jul','Sep','Nov'].map((m, i) => (
      <text key={m} x={172 + i * 44} y="318" fill="#9ca3af" fontSize="7" fontFamily="system-ui">{m}</text>
    ))}

    {/* Right panel — Activity */}
    <rect x="416" y="197" width="184" height="130" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
    <text x="428" y="213" fill="#1e1b4b" fontSize="9" fontWeight="700" fontFamily="system-ui">Recent Activity</text>
    {[
      ['Report published', 'Mr. James · 2m', '#10b981'],
      ['Student enrolled', 'Math Group · 5m', '#6366f1'],
      ['Guardian linked', 'Alex F. · 12m', '#f59e0b'],
      ['Quiz completed', 'Sarah L. · 18m', '#8b5cf6'],
    ].map(([title, sub, dot], i) => (
      <g key={i}>
        <circle cx="428" cy={228 + i * 24} r="4" fill={dot}/>
        {i < 3 && <line x1="428" y1={233 + i * 24} x2="428" y2={223 + (i+1) * 24} stroke="#e2e8f0" strokeWidth="1"/>}
        <text x="438" y={225 + i * 24} fill="#374151" fontSize="8" fontWeight="600" fontFamily="system-ui">{title}</text>
        <text x="438" y={235 + i * 24} fill="#9ca3af" fontSize="7" fontFamily="system-ui">{sub}</text>
      </g>
    ))}

    {/* Bottom — User table */}
    <rect x="160" y="335" width="440" height="85" rx="12" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
    <text x="172" y="351" fill="#1e1b4b" fontSize="9" fontWeight="700" fontFamily="system-ui">User Management</text>
    <rect x="160" y="356" width="440" height="1" fill="#f1f5f9"/>
    {[
      ['Alex Fernando', 'Student', 'Grade 10A', '#10b981', 'Active'],
      ['Ms. Sarah Kim',  'Teacher', 'Mathematics', '#6366f1', 'Active'],
      ['Maria Silva',    'Guardian','Linked · 1 student','#f59e0b','Pending'],
    ].map(([name, role, detail, col, status], i) => (
      <g key={i}>
        <circle cx="175" cy={370 + i * 22} r="9" fill={col} opacity="0.15"/>
        <text x="175" y={374 + i * 22} textAnchor="middle" fill={col} fontSize="9" fontWeight="800">{name[0]}</text>
        <text x="190" y={368 + i * 22} fill="#1e1b4b" fontSize="8.5" fontWeight="700" fontFamily="system-ui">{name}</text>
        <text x="190" y={379 + i * 22} fill="#9ca3af" fontSize="7" fontFamily="system-ui">{detail}</text>
        <text x="345" y={375 + i * 22} fill="#6b7280" fontSize="7.5" fontFamily="system-ui">{role}</text>
        <rect x="510" y={362 + i * 22} width="46" height="14" rx="7" fill={col} opacity="0.12"/>
        <text x="533" y={372 + i * 22} textAnchor="middle" fill={col} fontSize="7" fontWeight="700" fontFamily="system-ui">{status}</text>
      </g>
    ))}
  </svg>
);

/* ── Feature Illustrations ──────────────────────────────────────────────── */
const GuardianIllustration = () => (
  <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    <circle cx="42" cy="28" r="14" fill="#fb923c" opacity="0.2"/>
    <circle cx="42" cy="22" r="10" fill="#fb923c"/>
    <rect x="28" y="35" width="28" height="22" rx="8" fill="#f97316"/>
    <circle cx="75" cy="32" r="8" fill="#fbbf24"/>
    <rect x="65" y="42" width="20" height="16" rx="6" fill="#f59e0b"/>
    <path d="M 56 30 Q 60 25 64 30" stroke="#fb923c" strokeWidth="2" fill="none"/>
    <rect x="52" y="42" width="14" height="10" rx="4" fill="#fed7aa" opacity="0.6"/>
    <circle cx="42" cy="16" r="4" fill="#fff7ed"/>
    <circle cx="75" cy="26" r="3" fill="#fef3c7"/>
  </svg>
);

const RBACIllustration = () => (
  <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    <path d="M 60 10 L 95 22 L 95 50 Q 95 68 60 76 Q 25 68 25 50 L 25 22 Z" fill="#8b5cf6" opacity="0.2"/>
    <path d="M 60 15 L 88 25 L 88 48 Q 88 63 60 70 Q 32 63 32 48 L 32 25 Z" fill="#7c3aed" opacity="0.3"/>
    <path d="M 60 22 L 80 30 L 80 46 Q 80 58 60 64 Q 40 58 40 46 L 40 30 Z" fill="#6d28d9"/>
    <circle cx="60" cy="42" r="8" fill="white" opacity="0.9"/>
    <rect x="57" y="40" width="6" height="7" rx="1" fill="#7c3aed"/>
    <rect x="56" y="37" width="8" height="6" rx="3" fill="none" stroke="#7c3aed" strokeWidth="1.5"/>
    {[['admin','#a78bfa',20],['teacher','#93c5fd',50],['student','#6ee7b7',80]].map(([r,c,x]) => (
      <g key={r}>
        <rect x={x} y="72" width="26" height="10" rx="5" fill={c} opacity="0.3"/>
        <text x={x+13} y="80" textAnchor="middle" fill={c} fontSize="5.5" fontWeight="700">{r}</text>
      </g>
    ))}
  </svg>
);

const DashboardIllustration = () => (
  <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="100" height="62" rx="8" fill="#eff6ff"/>
    <rect x="10" y="10" width="100" height="16" rx="8" fill="#3b82f6" opacity="0.15"/>
    <rect x="10" y="22" width="100" height="4" fill="#3b82f6" opacity="0.15"/>
    {[0,1,2,3].map(i => (
      <rect key={i} x={14 + i*24} y="30" width="18" height="12" rx="4" fill="#3b82f6" opacity={0.2 + i*0.15}/>
    ))}
    {[40,32,55,28,48,35,52].map((h,i) => (
      <rect key={i} x={14 + i*13} y={60-h/2} width="9" height={h/2} rx="2" fill="#6366f1" opacity={0.5+i*0.06}/>
    ))}
    <path d="M 14 64 Q 30 50 46 56 Q 62 62 78 45 Q 94 28 106 35" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ReportIllustration = () => (
  <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="8" width="70" height="64" rx="8" fill="#ecfdf5"/>
    <rect x="25" y="8" width="70" height="16" rx="8" fill="#10b981" opacity="0.2"/>
    <rect x="25" y="20" width="70" height="4" fill="#10b981" opacity="0.2"/>
    {[0,1,2,3,4].map(i => (<rect key={i} x="33" y={32+i*9} width={30+i*5} height="5" rx="2.5" fill="#10b981" opacity={0.15+i*0.08}/>))}
    <circle cx="90" cy="55" r="14" fill="#10b981"/>
    <path d="M 84 55 L 88 59 L 96 51" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GroupsIllustration = () => (
  <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    {[[60,20,'#f43f5e'],[30,50,'#fb923c'],[90,50,'#a855f7'],[50,68,'#3b82f6'],[72,68,'#10b981']].map(([cx,cy,c],i) => (
      <g key={i}>
        <circle cx={cx} cy={cy} r="13" fill={c} opacity="0.18"/>
        <circle cx={cx} cy={cy} r="9" fill={c} opacity="0.7"/>
        <text x={cx} y={cy+3} textAnchor="middle" fill="white" fontSize="9" fontWeight="800">{String.fromCharCode(65+i)}</text>
      </g>
    ))}
    {[[60,20,30,50],[60,20,90,50],[30,50,50,68],[90,50,72,68],[50,68,72,68]].map(([x1,y1,x2,y2],i) => (
      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e879f9" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.5"/>
    ))}
  </svg>
);

const ActivityIllustration = () => (
  <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    {[['#6366f1',22,'Report published'],['#10b981',38,'Student joined'],['#f59e0b',54,'Guardian linked'],['#ef4444',70,'Login detected']].map(([c,y,label],i) => (
      <g key={i}>
        <circle cx="22" cy={y} r="5" fill={c}/>
        {i < 3 && <line x1="22" y1={y+5} x2="22" y2={y+13} stroke="#e2e8f0" strokeWidth="1.5"/>}
        <rect x="32" y={y-6} width="78" height="11" rx="5" fill={c} opacity="0.1"/>
        <text x="37" y={y+2} fill={c} fontSize="7" fontWeight="600" fontFamily="system-ui">{label}</text>
      </g>
    ))}
  </svg>
);

const FeedbackIllustration = () => (
  <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="10" width="75" height="40" rx="10" fill="#f0f9ff"/>
    <rect x="8" y="10" width="75" height="40" rx="10" fill="none" stroke="#38bdf8" strokeWidth="1.5"/>
    {[0,1,2].map(i => <rect key={i} x="16" y={20+i*11} width={40-i*8} height="6" rx="3" fill="#38bdf8" opacity={0.3+i*0.2}/>)}
    {[1,2,3,4,5].map(i => <text key={i} x={8+i*17} y="62" fill="#fbbf24" fontSize="16">★</text>)}
    <rect x="37" y="36" width="75" height="35" rx="10" fill="#fefce8"/>
    <rect x="37" y="36" width="75" height="35" rx="10" fill="none" stroke="#fbbf24" strokeWidth="1.5"/>
    {[0,1].map(i => <rect key={i} x="45" y={44+i*11} width={35+i*10} height="6" rx="3" fill="#fbbf24" opacity={0.3+i*0.2}/>)}
    <path d="M 37 62 L 30 72 L 45 65" fill="#fefce8" stroke="#fbbf24" strokeWidth="1.5"/>
  </svg>
);

const QuizIllustration = () => (
  <svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="8" width="90" height="64" rx="10" fill="#faf5ff"/>
    <rect x="15" y="8" width="90" height="18" rx="10" fill="#8b5cf6" opacity="0.15"/>
    <rect x="15" y="22" width="90" height="4" fill="#8b5cf6" opacity="0.15"/>
    <text x="60" y="22" textAnchor="middle" fill="#7c3aed" fontSize="8" fontWeight="700" fontFamily="system-ui">Quiz: Chapter 3</text>
    {[[25,36,'A'],[25,50,'B'],[25,64,'C']].map(([x,y,opt]) => (
      <g key={opt}>
        <circle cx={x} cy={y} r="6" fill={opt==='A' ? '#8b5cf6' : '#e2e8f0'}/>
        <text x={x} y={y+3} textAnchor="middle" fill={opt==='A'?'white':'#9ca3af'} fontSize="7" fontWeight="700">{opt}</text>
        <rect x="36" y={y-5} width="60" height="9" rx="4" fill={opt==='A'?'#8b5cf6':'#f5f3ff'} opacity={opt==='A'?0.2:1}/>
        <rect x="36" y={y-5} width="60" height="9" rx="4" fill="none" stroke={opt==='A'?'#8b5cf6':'#e2e8f0'} strokeWidth="1"/>
      </g>
    ))}
    <circle cx="96" cy="62" r="10" fill="#10b981"/>
    <path d="M 91 62 L 95 66 L 101 58" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Role Person Illustrations ──────────────────────────────────────────── */
const AdminPerson = () => (
  <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <circle cx="80" cy="110" r="45" fill="#f5f3ff" opacity="0.5"/>
    {/* Body */}
    <rect x="52" y="70" width="56" height="44" rx="16" fill="#6d28d9"/>
    <rect x="52" y="70" width="56" height="20" rx="16" fill="#7c3aed"/>
    {/* Neck */}
    <rect x="72" y="60" width="16" height="14" rx="4" fill="#fbbf24"/>
    {/* Head */}
    <circle cx="80" cy="52" r="22" fill="#fbbf24"/>
    <circle cx="73" cy="50" r="3" fill="#92400e"/>
    <circle cx="87" cy="50" r="3" fill="#92400e"/>
    <path d="M 73 60 Q 80 65 87 60" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Hair */}
    <path d="M 58 46 Q 62 30 80 28 Q 98 30 102 46" fill="#1c1917"/>
    {/* Shield badge */}
    <path d="M 90 78 L 100 81 L 100 90 Q 100 96 90 99 Q 80 96 80 90 L 80 81 Z" fill="#a78bfa"/>
    <path d="M 85 88 L 88 91 L 95 84" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Laptop */}
    <rect x="38" y="100" width="84" height="16" rx="4" fill="#4c1d95"/>
    <rect x="44" y="88" width="72" height="14" rx="3" fill="#6d28d9"/>
    {[0,1,2,3].map(i => <rect key={i} x={48+i*16} y="92" width="10" height="6" rx="2" fill="#8b5cf6"/>)}
    {/* Floating icons */}
    <rect x="14" y="35" width="22" height="22" rx="6" fill="#ede9fe"/>
    <text x="25" y="50" textAnchor="middle" fontSize="13">⚙️</text>
    <rect x="124" y="28" width="22" height="22" rx="6" fill="#ede9fe"/>
    <text x="135" y="43" textAnchor="middle" fontSize="13">🔒</text>
    <rect x="10" y="70" width="20" height="20" rx="5" fill="#faf5ff"/>
    <text x="20" y="84" textAnchor="middle" fontSize="11">📊</text>
    <rect x="130" y="65" width="20" height="20" rx="5" fill="#faf5ff"/>
    <text x="140" y="79" textAnchor="middle" fontSize="11">👥</text>
  </svg>
);

const TeacherPerson = () => (
  <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <circle cx="80" cy="110" r="45" fill="#eff6ff" opacity="0.5"/>
    {/* Body */}
    <rect x="52" y="70" width="56" height="44" rx="16" fill="#1d4ed8"/>
    <rect x="52" y="70" width="56" height="20" rx="16" fill="#2563eb"/>
    {/* Collar/tie */}
    <rect x="75" y="70" width="10" height="20" rx="2" fill="#fbbf24" opacity="0.8"/>
    {/* Neck */}
    <rect x="72" y="60" width="16" height="14" rx="4" fill="#fde68a"/>
    {/* Head */}
    <circle cx="80" cy="52" r="22" fill="#fde68a"/>
    <circle cx="73" cy="50" r="3" fill="#78350f"/>
    <circle cx="87" cy="50" r="3" fill="#78350f"/>
    <path d="M 74 60 Q 80 64 86 60" stroke="#78350f" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Hair (bun style) */}
    <path d="M 58 44 Q 60 28 80 26 Q 100 28 102 44" fill="#7c2d12"/>
    <circle cx="80" cy="28" r="8" fill="#7c2d12"/>
    {/* Book */}
    <rect x="100" y="75" width="20" height="26" rx="3" fill="#3b82f6"/>
    <rect x="100" y="75" width="3" height="26" fill="#1d4ed8"/>
    <rect x="105" y="81" width="11" height="2" rx="1" fill="#bfdbfe"/>
    <rect x="105" y="86" width="8" height="2" rx="1" fill="#bfdbfe"/>
    <rect x="105" y="91" width="11" height="2" rx="1" fill="#bfdbfe"/>
    {/* Whiteboard/tablet */}
    <rect x="26" y="68" width="28" height="20" rx="5" fill="#dbeafe"/>
    <rect x="26" y="68" width="28" height="20" rx="5" fill="none" stroke="#93c5fd" strokeWidth="1.5"/>
    <rect x="30" y="73" width="16" height="2" rx="1" fill="#3b82f6" opacity="0.5"/>
    <rect x="30" y="78" width="12" height="2" rx="1" fill="#3b82f6" opacity="0.4"/>
    <rect x="30" y="83" width="14" height="2" rx="1" fill="#3b82f6" opacity="0.3"/>
    {/* Floating icons */}
    <rect x="10" y="30" width="22" height="22" rx="6" fill="#dbeafe"/>
    <text x="21" y="45" textAnchor="middle" fontSize="13">📚</text>
    <rect x="128" y="25" width="22" height="22" rx="6" fill="#dbeafe"/>
    <text x="139" y="40" textAnchor="middle" fontSize="13">✏️</text>
    <rect x="130" y="58" width="20" height="20" rx="5" fill="#eff6ff"/>
    <text x="140" y="72" textAnchor="middle" fontSize="11">📋</text>
  </svg>
);

const StudentPerson = () => (
  <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <circle cx="80" cy="110" r="45" fill="#f0fdf4" opacity="0.5"/>
    {/* Body */}
    <rect x="52" y="70" width="56" height="44" rx="16" fill="#059669"/>
    <rect x="52" y="70" width="56" height="20" rx="16" fill="#10b981"/>
    {/* Bag strap */}
    <rect x="100" y="72" width="5" height="30" rx="2" fill="#047857"/>
    <rect x="98" y="96" width="18" height="22" rx="6" fill="#065f46"/>
    <rect x="102" y="100" width="10" height="6" rx="3" fill="#10b981" opacity="0.5"/>
    {/* Neck */}
    <rect x="72" y="60" width="16" height="14" rx="4" fill="#fde68a"/>
    {/* Head */}
    <circle cx="80" cy="52" r="22" fill="#fde68a"/>
    <circle cx="73" cy="50" r="3" fill="#451a03"/>
    <circle cx="87" cy="50" r="3" fill="#451a03"/>
    <path d="M 74 60 Q 80 65 86 60" stroke="#451a03" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Graduation cap */}
    <rect x="62" y="31" width="36" height="6" rx="2" fill="#1a1a2e"/>
    <path d="M 80 20 L 62 31 L 80 36 L 98 31 Z" fill="#312e81"/>
    <rect x="95" y="31" width="2" height="12" fill="#312e81"/>
    <circle cx="96" cy="43" r="3" fill="#6366f1"/>
    {/* Laptop */}
    <rect x="36" y="88" width="32" height="24" rx="5" fill="#d1fae5"/>
    <rect x="36" y="88" width="32" height="24" rx="5" fill="none" stroke="#6ee7b7" strokeWidth="1.5"/>
    <rect x="40" y="92" width="24" height="16" rx="2" fill="#ecfdf5"/>
    <rect x="42" y="94" width="18" height="2" rx="1" fill="#6366f1" opacity="0.4"/>
    <rect x="42" y="99" width="14" height="2" rx="1" fill="#6366f1" opacity="0.3"/>
    <rect x="42" y="104" width="16" height="2" rx="1" fill="#10b981" opacity="0.4"/>
    {/* Floating icons */}
    <rect x="8" y="32" width="22" height="22" rx="6" fill="#d1fae5"/>
    <text x="19" y="47" textAnchor="middle" fontSize="13">🎓</text>
    <rect x="130" y="28" width="22" height="22" rx="6" fill="#d1fae5"/>
    <text x="141" y="43" textAnchor="middle" fontSize="13">⭐</text>
    <rect x="10" y="68" width="20" height="20" rx="5" fill="#f0fdf4"/>
    <text x="20" y="82" textAnchor="middle" fontSize="11">📈</text>
    <rect x="130" y="62" width="20" height="20" rx="5" fill="#f0fdf4"/>
    <text x="140" y="76" textAnchor="middle" fontSize="11">🏆</text>
  </svg>
);

const GuardianPerson = () => (
  <svg viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <circle cx="80" cy="110" r="45" fill="#fff7ed" opacity="0.5"/>
    {/* Child figure */}
    <circle cx="106" cy="68" r="12" fill="#fed7aa"/>
    <rect x="97" y="81" width="18" height="20" rx="7" fill="#fb923c"/>
    <path d="M 98 66 Q 100 58 106 57 Q 112 58 114 66" fill="#c2410c"/>
    {/* Parent body */}
    <rect x="48" y="68" width="50" height="46" rx="16" fill="#c2410c"/>
    <rect x="48" y="68" width="50" height="22" rx="16" fill="#ea580c"/>
    {/* Neck */}
    <rect x="68" y="58" width="14" height="14" rx="4" fill="#fde68a"/>
    {/* Head */}
    <circle cx="75" cy="50" r="20" fill="#fde68a"/>
    <circle cx="69" cy="48" r="3" fill="#451a03"/>
    <circle cx="81" cy="48" r="3" fill="#451a03"/>
    <path d="M 70 57 Q 75 61 80 57" stroke="#451a03" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Hair */}
    <path d="M 55 44 Q 57 28 75 26 Q 93 28 95 44" fill="#92400e"/>
    {/* Heart badge */}
    <path d="M 60 72 C 60 70 58 68 56 68 C 54 68 52 70 52 72 C 52 76 56 80 60 82 C 64 80 68 76 68 72 C 68 70 66 68 64 68 C 62 68 60 70 60 72 Z" fill="#fb7185"/>
    {/* Connection line */}
    <path d="M 98 72 Q 90 65 70 70" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 2" fill="none"/>
    {/* Floating icons */}
    <rect x="8" y="30" width="22" height="22" rx="6" fill="#ffedd5"/>
    <text x="19" y="45" textAnchor="middle" fontSize="13">❤️</text>
    <rect x="130" y="28" width="22" height="22" rx="6" fill="#ffedd5"/>
    <text x="141" y="43" textAnchor="middle" fontSize="13">👨‍👧</text>
    <rect x="10" y="68" width="20" height="20" rx="5" fill="#fff7ed"/>
    <text x="20" y="82" textAnchor="middle" fontSize="11">📊</text>
    <rect x="130" y="62" width="20" height="20" rx="5" fill="#fff7ed"/>
    <text x="140" y="76" textAnchor="middle" fontSize="11">🔗</text>
  </svg>
);

/* ── Step Illustrations ─────────────────────────────────────────────────── */
const StepIllustrations = [
  () => (
    <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16 mx-auto">
      <circle cx="40" cy="22" r="14" fill="#6366f1" opacity="0.15"/>
      <circle cx="40" cy="18" r="10" fill="#6366f1"/>
      <rect x="26" y="30" width="28" height="20" rx="8" fill="#4f46e5"/>
      <rect x="20" y="42" width="40" height="8" rx="4" fill="#e0e7ff"/>
      <circle cx="40" cy="12" r="4" fill="#c7d2fe"/>
      <rect x="56" y="8" width="16" height="10" rx="4" fill="#ede9fe"/>
      <text x="64" y="16" textAnchor="middle" fontSize="8">⚙️</text>
    </svg>
  ),
  () => (
    <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16 mx-auto">
      <circle cx="25" cy="22" r="12" fill="#fb923c" opacity="0.2"/>
      <circle cx="25" cy="18" r="9" fill="#fb923c"/>
      <rect x="14" y="28" width="22" height="18" rx="7" fill="#f97316"/>
      <circle cx="55" cy="24" r="10" fill="#6366f1" opacity="0.2"/>
      <circle cx="55" cy="20" r="8" fill="#6366f1"/>
      <rect x="45" y="30" width="20" height="16" rx="6" fill="#4f46e5"/>
      <path d="M 37 22 L 43 22" stroke="#fb923c" strokeWidth="2" strokeDasharray="2 1.5" strokeLinecap="round"/>
      <path d="M 40 19 L 40 25" stroke="#6366f1" strokeWidth="1.5"/>
    </svg>
  ),
  () => (
    <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16 mx-auto">
      <rect x="10" y="8" width="60" height="44" rx="8" fill="#d1fae5"/>
      <rect x="10" y="8" width="60" height="12" rx="8" fill="#10b981" opacity="0.3"/>
      <rect x="10" y="16" width="60" height="4" fill="#10b981" opacity="0.2"/>
      {[0,1,2].map(i => <rect key={i} x="17" y={28+i*9} width={30+i*5} height="5" rx="2.5" fill="#10b981" opacity={0.2+i*0.1}/>)}
      <circle cx="62" cy="46" r="10" fill="#10b981"/>
      <path d="M 57 46 L 61 50 L 67 42" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  () => (
    <svg viewBox="0 0 80 60" xmlns="http://www.w3.org/2000/svg" className="w-20 h-16 mx-auto">
      {[[20,16,'#6366f1'],[60,16,'#fb923c'],[20,44,'#10b981'],[60,44,'#8b5cf6']].map(([cx,cy,c],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="10" fill={c} opacity="0.2"/>
          <circle cx={cx} cy={cy} r="7" fill={c}/>
        </g>
      ))}
      {[[20,16,60,16],[20,16,20,44],[60,16,60,44],[20,44,60,44],[20,16,60,44],[60,16,20,44]].map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6366f1" strokeWidth="1" opacity="0.3" strokeDasharray="3 2"/>
      ))}
      <circle cx="40" cy="30" r="8" fill="white" stroke="#6366f1" strokeWidth="2"/>
      <text x="40" y="34" textAnchor="middle" fill="#6366f1" fontSize="10">✓</text>
    </svg>
  ),
];

/* ─── Data ─────────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Link2,      title: 'Guardian–Student Linking', desc: 'Connect parents and guardians directly to their children\'s academic journey with granular permission controls.', color: 'from-orange-400 to-amber-500', bg: 'bg-orange-50',  border: 'border-orange-100', Illustration: GuardianIllustration },
  { icon: Shield,     title: 'Role-Based Access Control', desc: 'Fine-grained RBAC ensures every user sees exactly what they need — nothing more, nothing less.', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', border: 'border-violet-100', Illustration: RBACIllustration },
  { icon: BarChart2,  title: 'Academic Dashboards',      desc: 'Beautiful, data-rich dashboards tailored to each role — from admin analytics to student performance radars.', color: 'from-blue-500 to-cyan-500',    bg: 'bg-blue-50',   border: 'border-blue-100',   Illustration: DashboardIllustration },
  { icon: FileText,   title: 'Student Report Generation',desc: 'Generate detailed academic reports with grades, attendance, GPA, and teacher remarks. Publish to guardians instantly.', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', border: 'border-emerald-100', Illustration: ReportIllustration },
  { icon: Users2,     title: 'Learning Communities',     desc: 'Students self-enroll into subject groups, project teams, and discussion circles — fostering collaborative learning.', color: 'from-pink-500 to-rose-500',    bg: 'bg-pink-50',   border: 'border-pink-100',   Illustration: GroupsIllustration },
  { icon: Activity,   title: 'User Activity Monitoring', desc: 'Full audit trail of platform activity with real-time analytics, category filters, and exportable logs.', color: 'from-indigo-500 to-primary-600', bg: 'bg-indigo-50', border: 'border-indigo-100', Illustration: ActivityIllustration },
  { icon: MessageSquare, title: 'Feedback Management',   desc: 'Students and teachers submit rated feedback. Admins respond, track status, and view analytics.', color: 'from-sky-400 to-blue-500',      bg: 'bg-sky-50',    border: 'border-sky-100',    Illustration: FeedbackIllustration },
  { icon: ClipboardList, title: 'Quiz Management',       desc: 'Create MCQ, True/False, and short-answer quizzes. Auto-grade, view analytics, and identify high performers.', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50', border: 'border-purple-100', Illustration: QuizIllustration },
];

const ROLES = [
  { role: 'Admin',    icon: Shield,       gradient: 'from-violet-600 to-purple-700', lightGradient: 'from-violet-50 to-purple-50', border: 'border-violet-200', Person: AdminPerson,    perks: ['Full platform control','User & role management','Activity audit trail','Guardian link management','System analytics'] },
  { role: 'Teacher',  icon: BookOpen,     gradient: 'from-blue-500 to-cyan-600',     lightGradient: 'from-blue-50 to-cyan-50',     border: 'border-blue-200',   Person: TeacherPerson,  perks: ['Create & publish reports','Manage learning groups','View student profiles','Track class performance','Access guardian links'] },
  { role: 'Student',  icon: GraduationCap,gradient: 'from-emerald-500 to-teal-600',  lightGradient: 'from-emerald-50 to-teal-50',  border: 'border-emerald-200',Person: StudentPerson,  perks: ['Personal dashboard','View academic reports','Join learning groups','Track progress & GPA','Activity history'] },
  { role: 'Guardian', icon: Heart,        gradient: 'from-orange-500 to-amber-500',  lightGradient: 'from-orange-50 to-amber-50',  border: 'border-orange-200', Person: GuardianPerson, perks: ['Monitor linked students','View published reports','Attendance tracking','Grade overview','Controlled data access'] },
];

const STATS = [
  { value: '4',    label: 'User Roles',     icon: Users },
  { value: '8',    label: 'Core Modules',   icon: Zap },
  { value: '100%', label: 'RBAC Protected', icon: Shield },
  { value: 'Live', label: 'Real-time Logs', icon: Activity },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Admin Registers Users',       desc: 'Admin creates accounts for teachers, students, and guardians with the correct roles and permissions.' },
  { step: '02', title: 'Link Guardians to Students',  desc: 'Admin creates guardian–student relationships with customisable data-access permissions per link.' },
  { step: '03', title: 'Teachers Generate Reports',   desc: 'Teachers log grades, attendance, and remarks, then publish reports visible to students and guardians.' },
  { step: '04', title: 'Everyone Stays Connected',    desc: 'All roles get tailored dashboards, real-time activity logs, and a seamless collaborative experience.' },
];

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/60"
        style={{ boxShadow: '0 1px 0 rgba(99,102,241,0.06), 0 4px 20px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-violet-700 rounded-xl flex items-center justify-center shadow-glow-sm">
              <GraduationCap size={19} className="text-white" />
            </div>
            <div>
              <span className="font-black text-gray-900 text-base leading-none tracking-tight">eduCare</span>
              <span className="text-xs text-gray-400 block leading-none mt-0.5">LMS Platform</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it works', 'Roles'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-semibold text-gray-500 hover:text-primary-700 transition-colors">
                {item}
              </a>
            ))}
          </div>
          <Link to="/login" className="btn-primary px-5">
            Sign In <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-white">
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] rounded-full bg-primary-500/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-violet-500/6 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="animate-fade-in-up">
            <div className="section-label mb-6">
              <Sparkles size={14} /> Educational Relationship Management
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 leading-[1.07] tracking-tight mb-6">
              The LMS that<br />
              <span className="gradient-text">connects everyone</span><br />
              in education
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              eduCare unifies admins, teachers, students, and guardians on one intelligent platform —
              with smart relationship management, live reports, and granular access control.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <Link to="/login" className="btn-primary text-base px-7 py-3.5 rounded-xl">
                Get Started Free <ArrowRight size={16} />
              </Link>
              <a href="#how-it-works" className="btn-secondary text-base px-6 py-3.5 rounded-xl">
                <Play size={15} className="text-primary-500" /> See How It Works
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              {['RBAC Security', 'MongoDB Atlas', 'REST API', 'Real-time Logs'].map((b) => (
                <div key={b} className="flex items-center gap-1.5 text-sm text-gray-500">
                  <CheckCircle2 size={14} className="text-emerald-500" />{b}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="relative hidden lg:flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.15s' }}>
            {/* Glow behind mockup */}
            <div className="absolute inset-8 bg-gradient-to-br from-primary-400/15 to-violet-400/15 rounded-3xl blur-2xl" />
            <div className="relative w-full rounded-3xl overflow-hidden"
              style={{ boxShadow: '0 32px 80px rgba(99,102,241,0.18), 0 8px 24px rgba(0,0,0,0.12)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <DashboardMockup />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 animate-float"
              style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <TrendingUp size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900">GPA 3.85</p>
                  <p className="text-xs text-emerald-600 font-semibold">↑ Top of class</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 glass rounded-2xl px-3 py-2 animate-float-delay"
              style={{ boxShadow: '0 8px 24px rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.12)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Shield size={11} className="text-white" />
                </div>
                <span className="text-xs font-bold text-gray-800">RBAC Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 animate-bounce-slow">
          <span className="text-xs font-medium">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border-2 border-gray-300 flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-gray-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="aurora-bg py-16 relative overflow-hidden">
        <div className="absolute inset-0 noise" />
        <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div className="w-14 h-14 rounded-2xl bg-white/12 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300"
                style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
                <Icon size={24} className="text-white" />
              </div>
              <p className="text-4xl font-black text-white tracking-tight">{value}</p>
              <p className="text-white/65 text-sm mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 line-grid opacity-40" />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label mx-auto mb-4 w-fit"><Zap size={14} /> Platform Features</div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Everything education needs,<br />
              <span className="gradient-text">built into one platform</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Eight powerful modules designed specifically for the educational ecosystem,
              working together seamlessly.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, border, Illustration }) => (
              <div key={title} className={`card-hover group ${bg} ${border} border overflow-hidden !p-0`}>
                {/* Illustration area */}
                <div className="h-28 flex items-center justify-center px-4 pt-4 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-40"
                    style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, rgba(99,102,241,0.08) 0%, transparent 60%)' }}/>
                  <Illustration />
                </div>
                {/* Content */}
                <div className="p-4 pt-2">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={17} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5 leading-snug">{title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-primary-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ChevronRight size={11} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-25" />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label mx-auto mb-4 w-fit"><Target size={14} /> How It Works</div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              From setup to success<br />
              <span className="gradient-text">in four simple steps</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => {
              const StepIllus = StepIllustrations[i];
              return (
                <div key={step} className="relative text-center group">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-primary-200 to-transparent z-0" />
                  )}
                  <div className="relative z-10">
                    {/* Illustration */}
                    <div className="mb-3 opacity-90 group-hover:opacity-100 transition-opacity group-hover:scale-105 transform duration-300">
                      <StepIllus />
                    </div>
                    {/* Step badge */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-700 flex items-center justify-center mx-auto mb-4 shadow-glow-sm group-hover:shadow-glow transition-shadow duration-300">
                      <span className="text-white font-black text-sm">{step}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label mx-auto mb-4 w-fit"><Users size={14} /> User Roles</div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              A tailored experience<br />
              <span className="gradient-text">for every stakeholder</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Each role gets a custom dashboard, navigation, and permissions — perfectly scoped to their needs.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map(({ role, icon: Icon, gradient, lightGradient, border, Person, perks }) => (
              <div key={role} className={`card-hover bg-gradient-to-b ${lightGradient} ${border} border overflow-hidden !p-0`}>
                {/* Person illustration */}
                <div className="h-36 flex items-end justify-center px-4 pt-4 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-b ${lightGradient} opacity-60`}/>
                  <div className="relative w-full">
                    <Person />
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 pt-3">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <h3 className="text-lg font-black text-gray-900">{role}</h3>
                  </div>
                  <ul className="space-y-2">
                    {perks.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-glow-sm">
            <Brain size={28} className="text-white" />
          </div>
          <blockquote className="text-2xl md:text-3xl font-bold text-gray-800 leading-relaxed mb-6">
            "Education is not just about knowledge transfer —<br />
            it's about building <span className="gradient-text">relationships that last</span>."
          </blockquote>
          <p className="text-gray-400 text-sm font-medium">eduCare LMS · Educational Relationship Management Platform</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 animated-bg" />
        <div className="absolute inset-0 noise" />
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-semibold mb-6"
            style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
            <Globe size={14} /> Ready to transform your institution?
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
            Start building smarter<br />educational connections today
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">
            Sign in now and explore the full ERM platform — all demo accounts are pre-seeded and ready to explore.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/login"
              className="flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-200 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95">
              Get Started Now <ArrowRight size={18} />
            </Link>
            <a href="#features"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-base"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              View Features
            </a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {[
              { role: 'Admin',    color: 'bg-violet-500/20 text-violet-200 border-violet-400/30' },
              { role: 'Teacher',  color: 'bg-blue-500/20 text-blue-200 border-blue-400/30' },
              { role: 'Student',  color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30' },
              { role: 'Guardian', color: 'bg-amber-500/20 text-amber-200 border-amber-400/30' },
            ].map(({ role, color }) => (
              <Link key={role} to="/login"
                className={`badge border text-sm px-4 py-1.5 rounded-full font-semibold hover:scale-105 transition-transform ${color}`}>
                Try as {role}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-violet-700 rounded-xl flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold">eduCare LMS</p>
                <p className="text-xs text-gray-500">Educational Relationship Management</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              {['Features', 'How it works', 'Roles', 'Sign In'].map((item) => (
                <a key={item} href={item === 'Sign In' ? '/login' : `#${item.toLowerCase().replace(/ /g, '-')}`}
                  className="hover:text-white transition-colors">{item}</a>
              ))}
            </div>
            <p className="text-xs text-gray-600">© 2025 eduCare LMS · MERN Stack · ITPM Project</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
