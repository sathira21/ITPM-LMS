import { useEffect, useState, useCallback, useRef } from 'react';
import {
  LifeBuoy, Send, Search, CheckCircle2, Clock, XCircle,
  Trash2, RefreshCw, BarChart2, AlertCircle, X, Plus,
  UserCog, Monitor, BookOpen, CreditCard, HelpCircle,
  MessageSquare, CircleDot, Star, Paperclip, Download,
  AlertTriangle, Zap, Timer, FileText, Image, File,
  ShieldAlert, Brain,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie,
} from 'recharts';
import { io as socketIO } from 'socket.io-client';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/* ── Socket.IO singleton ── */
let socket = null;
function getSocket() {
  if (!socket) {
    socket = socketIO('http://localhost:5000', { autoConnect: false });
  }
  return socket;
}

/* ── helpers ── */
const CATEGORIES = [
  { value: 'account',   label: 'Account',   icon: UserCog,    color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'technical', label: 'Technical',  icon: Monitor,    color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'academic',  label: 'Academic',   icon: BookOpen,   color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'billing',   label: 'Billing',    icon: CreditCard, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'other',     label: 'Other',      icon: HelpCircle, color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const PRIORITIES = {
  low:    { color: 'bg-gray-100 text-gray-600 border-gray-200',       label: 'Low',    dot: 'bg-gray-400' },
  medium: { color: 'bg-blue-100 text-blue-700 border-blue-200',       label: 'Medium', dot: 'bg-blue-500' },
  high:   { color: 'bg-amber-100 text-amber-700 border-amber-200',    label: 'High',   dot: 'bg-amber-500' },
  urgent: { color: 'bg-red-100 text-red-700 border-red-200',          label: 'Urgent', dot: 'bg-red-500' },
};

const STATUS_META = {
  open:        { color: 'bg-amber-100 text-amber-700 border-amber-200',       icon: CircleDot,     label: 'Open' },
  in_progress: { color: 'bg-blue-100 text-blue-700 border-blue-200',          icon: Clock,         label: 'In Progress' },
  resolved:    { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2,  label: 'Resolved' },
  closed:      { color: 'bg-gray-100 text-gray-600 border-gray-200',          icon: XCircle,       label: 'Closed' },
};

const BAR_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316', '#6b7280'];

const getCat = (v) => CATEGORIES.find((c) => c.value === v) || CATEGORIES[4];
const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const SLA_LABELS = { urgent: '2 hours', high: '8 hours', medium: '24 hours', low: '48 hours' };

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return Image;
  if (mimeType?.includes('pdf')) return FileText;
  return File;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ── SLA Timer Component ── */
const SlaTimer = ({ sla, status, priority }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (['resolved', 'closed'].includes(status)) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [status]);

  if (!sla?.dueAt) return null;
  if (['resolved', 'closed'].includes(status)) {
    if (sla.breached) return (
      <span className="badge border text-xs bg-red-100 text-red-700 border-red-200">
        <ShieldAlert size={10} /> SLA Breached
      </span>
    );
    return (
      <span className="badge border text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
        <CheckCircle2 size={10} /> SLA Met
      </span>
    );
  }

  const due = new Date(sla.dueAt);
  const diff = due - now;

  if (sla.breached || diff <= 0) {
    const overMs = Math.abs(diff);
    const overH = Math.floor(overMs / 3600000);
    const overM = Math.floor((overMs % 3600000) / 60000);
    return (
      <span className="badge border text-xs bg-red-100 text-red-700 border-red-200 animate-pulse">
        <ShieldAlert size={10} /> SLA Breached ({overH}h {overM}m over)
      </span>
    );
  }

  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const isWarning = diff < 3600000; // less than 1 hour
  const isDanger = diff < 1800000; // less than 30 min

  return (
    <span className={`badge border text-xs ${
      isDanger ? 'bg-red-100 text-red-700 border-red-200 animate-pulse'
      : isWarning ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-blue-100 text-blue-700 border-blue-200'
    }`}>
      <Timer size={10} /> {hours}h {mins}m {secs}s left
    </span>
  );
};

/* ── Star Rating Component ── */
const StarRating = ({ value, onChange, readonly = false, size = 20 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s} type="button" disabled={readonly}
        onClick={() => !readonly && onChange?.(s)}
        className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
      >
        <Star size={size} className={s <= (value || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      </button>
    ))}
  </div>
);

/* ── Satisfaction Rating Modal ── */
const SatisfactionModal = ({ ticket, onRate, onClose }) => {
  const [rating, setRating] = useState(ticket.satisfaction?.rating || 0);
  const [comment, setComment] = useState(ticket.satisfaction?.comment || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSaving(true);
    await onRate(ticket._id, rating, comment);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <Star size={28} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Rate Your Experience</h3>
          <p className="text-sm text-gray-500 mt-1">How satisfied are you with the support you received?</p>
        </div>
        <div className="flex justify-center">
          <StarRating value={rating} onChange={setRating} size={36} />
        </div>
        <div>
          <label className="label">Comment (optional)</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="Tell us about your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={handleSubmit} disabled={!rating || saving} className="btn-primary flex-1 justify-center">
            {saving ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Attachment Preview ── */
const AttachmentList = ({ attachments }) => {
  if (!attachments?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((att, i) => {
        const FIcon = getFileIcon(att.mimeType);
        const isImage = att.mimeType?.startsWith('image/');
        return (
          <a
            key={i}
            href={`http://localhost:5000${att.fileUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors group"
          >
            {isImage ? (
              <img src={`http://localhost:5000${att.fileUrl}`} alt={att.fileName} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <FIcon size={16} className="text-gray-500" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate max-w-32">{att.fileName}</p>
              <p className="text-xs text-gray-400">{formatFileSize(att.fileSize)}</p>
            </div>
            <Download size={12} className="text-gray-400 group-hover:text-primary-500" />
          </a>
        );
      })}
    </div>
  );
};

/* ── Ticket Detail (conversation view with real-time chat) ── */
const TicketDetail = ({ ticket, isAdmin, userId, onReply, onStatusChange, onClose, onRate }) => {
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const chatEndRef = useRef(null);
  const fileRef = useRef(null);
  const typingTimeout = useRef(null);

  const cat = getCat(ticket.category);
  const CatIcon = cat.icon;
  const statusMeta = STATUS_META[ticket.status] || STATUS_META.open;
  const StatusIcon = statusMeta.icon;
  const prio = PRIORITIES[ticket.priority] || PRIORITIES.medium;

  // Socket.IO real-time
  useEffect(() => {
    const s = getSocket();
    if (!s.connected) s.connect();
    s.emit('ticket:join', ticket._id);

    s.on('ticket:typing', (data) => {
      if (data.ticketId === ticket._id) setTyping(data.user);
    });
    s.on('ticket:stopTyping', (data) => {
      if (data.ticketId === ticket._id) setTyping(null);
    });

    return () => {
      s.emit('ticket:leave', ticket._id);
      s.off('ticket:typing');
      s.off('ticket:stopTyping');
    };
  }, [ticket._id]);

  // Scroll to bottom on new replies
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket.replies?.length]);

  const handleTyping = () => {
    const s = getSocket();
    s.emit('ticket:typing', { ticketId: ticket._id, user: { name: 'User' } });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      s.emit('ticket:stopTyping', { ticketId: ticket._id, user: { name: 'User' } });
    }, 2000);
  };

  const handleSend = async () => {
    if (!reply.trim() && files.length === 0) return;
    setSending(true);
    const s = getSocket();
    s.emit('ticket:stopTyping', { ticketId: ticket._id, user: { name: 'User' } });
    await onReply(ticket._id, reply.trim(), files);
    setReply('');
    setFiles([]);
    setSending(false);
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = '';
  };

  const canRate = !isAdmin && ['resolved', 'closed'].includes(ticket.status) && !ticket.satisfaction?.rating;
  const isOwner = String(ticket.submittedBy?._id) === String(userId);

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{ticket.subject}</h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`badge border text-xs ${statusMeta.color}`}><StatusIcon size={10} /> {statusMeta.label}</span>
                <span className={`badge border text-xs ${cat.color}`}><CatIcon size={10} /> {cat.label}</span>
                <span className={`badge border text-xs ${prio.color}`}><span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} /> {prio.label}</span>
                <SlaTimer sla={ticket.sla} status={ticket.status} priority={ticket.priority} />
              </div>
              {/* AI Priority Badge */}
              {ticket.aiDetectedPriority && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-violet-600">
                  <Brain size={12} />
                  <span>AI suggested: <strong>{ticket.aiDetectedPriority}</strong></span>
                  {ticket.aiPriorityKeywords?.length > 0 && (
                    <span className="text-gray-400">({ticket.aiPriorityKeywords.slice(0, 3).join(', ')})</span>
                  )}
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <span>by <strong className="text-gray-600">{ticket.submittedBy?.name}</strong></span>
            <span>&middot;</span>
            <span>{fmtDate(ticket.createdAt)}</span>
            {ticket.sla?.dueAt && (
              <>
                <span>&middot;</span>
                <span>SLA: {SLA_LABELS[ticket.priority]}</span>
              </>
            )}
          </div>

          {/* Satisfaction display */}
          {ticket.satisfaction?.rating && (
            <div className="flex items-center gap-2 mt-2 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl">
              <StarRating value={ticket.satisfaction.rating} readonly size={14} />
              <span className="text-xs text-amber-700 font-medium">{ticket.satisfaction.rating}/5</span>
              {ticket.satisfaction.comment && <span className="text-xs text-gray-500">— "{ticket.satisfaction.comment}"</span>}
            </div>
          )}
        </div>

        {/* Timeline conversation body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-gray-200 to-gray-100" />

            {/* ── Timeline: Ticket Created ── */}
            <div className="relative flex gap-4 pb-6">
              <div className="relative z-10 flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-md ring-4 ring-white">
                  <LifeBuoy size={16} className="text-white" />
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary-700">Ticket Created</span>
                  <span className="text-xs text-gray-400">{fmtDate(ticket.createdAt)}</span>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {ticket.submittedBy?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{ticket.submittedBy?.name}</span>
                    <span className="badge border text-xs bg-gray-100 text-gray-500 border-gray-200">{ticket.submittedBy?.role}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
                  <AttachmentList attachments={ticket.attachments} />
                </div>
              </div>
            </div>

            {/* ── Timeline: Replies ── */}
            {ticket.replies?.map((r, i) => {
              const isAdminReply = r.user?.role === 'admin';
              const dotColor = isAdminReply
                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600';
              const cardBg = isAdminReply
                ? 'bg-primary-50 border-primary-100'
                : 'bg-emerald-50 border-emerald-100';
              const labelColor = isAdminReply ? 'text-violet-700' : 'text-emerald-700';

              return (
                <div key={i} className="relative flex gap-4 pb-6">
                  <div className="relative z-10 flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full ${dotColor} flex items-center justify-center shadow-md ring-4 ring-white`}>
                      <span className="text-white text-xs font-bold">{r.user?.name?.charAt(0) || '?'}</span>
                    </div>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${labelColor}`}>
                        {isAdminReply ? 'Admin Reply' : 'Student Reply'}
                      </span>
                      <span className="text-xs text-gray-400">{fmtDate(r.createdAt)}</span>
                    </div>
                    <div className={`border rounded-2xl p-4 ${cardBg}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-gray-700">{r.user?.name}</span>
                        <span className={`badge border text-xs ${isAdminReply ? 'bg-violet-100 text-violet-600 border-violet-200' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>
                          {r.user?.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{r.message}</p>
                      <AttachmentList attachments={r.attachments} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ── Timeline: Status events ── */}
            {ticket.status === 'resolved' && ticket.resolvedAt && (
              <div className="relative flex gap-4 pb-6">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md ring-4 ring-white">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 pt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700">Ticket Resolved</span>
                    <span className="text-xs text-gray-400">{fmtDate(ticket.resolvedAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {ticket.status === 'closed' && ticket.closedAt && (
              <div className="relative flex gap-4 pb-6">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-md ring-4 ring-white">
                    <XCircle size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 pt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600">Ticket Closed</span>
                    <span className="text-xs text-gray-400">{fmtDate(ticket.closedAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Timeline: Satisfaction rating ── */}
            {ticket.satisfaction?.rating && (
              <div className="relative flex gap-4 pb-6">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md ring-4 ring-white">
                    <Star size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-amber-700">Satisfaction Rating</span>
                    <span className="text-xs text-gray-400">{fmtDate(ticket.satisfaction.ratedAt)}</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <StarRating value={ticket.satisfaction.rating} readonly size={18} />
                      <span className="text-sm font-bold text-amber-700">{ticket.satisfaction.rating}/5</span>
                    </div>
                    {ticket.satisfaction.comment && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{ticket.satisfaction.comment}"</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SLA Breach event */}
            {ticket.sla?.breached && ticket.sla.breachedAt && (
              <div className="relative flex gap-4 pb-6">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md ring-4 ring-white animate-pulse">
                    <ShieldAlert size={16} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 pt-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-600">SLA Breached</span>
                    <span className="text-xs text-gray-400">{fmtDate(ticket.sla.breachedAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Typing indicator in timeline */}
            {typing && (
              <div className="relative flex gap-4 pb-4">
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center ring-4 ring-white">
                    <div className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
                <div className="flex-1 pt-3">
                  <span className="text-xs text-gray-400 animate-pulse">Someone is typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Footer: reply + status actions */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          {/* Admin status buttons */}
          {isAdmin && ticket.status !== 'closed' && (
            <div className="flex gap-2 flex-wrap">
              {ticket.status === 'open' && (
                <button onClick={() => onStatusChange(ticket._id, 'in_progress')} className="btn-secondary text-xs py-1.5 text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Clock size={12} /> Mark In Progress
                </button>
              )}
              {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                <button onClick={() => onStatusChange(ticket._id, 'resolved')} className="btn-secondary text-xs py-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                  <CheckCircle2 size={12} /> Resolve
                </button>
              )}
              {ticket.status !== 'closed' && (
                <button onClick={() => onStatusChange(ticket._id, 'closed')} className="btn-secondary text-xs py-1.5 text-gray-500 border-gray-200 hover:bg-gray-50">
                  <XCircle size={12} /> Close
                </button>
              )}
            </div>
          )}

          {/* Rate satisfaction button — prominent CTA */}
          {canRate && isOwner && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <span className="font-bold text-amber-800">How was your support experience?</span>
              </div>
              <p className="text-xs text-amber-600">Your feedback helps us improve</p>
              <button onClick={() => setShowRating(true)} className="btn-primary bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 border-0 px-6 py-2.5 mx-auto justify-center text-sm font-semibold shadow-lg">
                <Star size={14} /> Rate Your Experience
              </button>
            </div>
          )}

          {/* Reply input with file attach */}
          {ticket.status !== 'closed' && (
            <div className="space-y-2">
              {/* File previews */}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary-50 border border-primary-100 rounded-lg text-xs text-primary-700">
                      <Paperclip size={10} />
                      <span className="max-w-24 truncate">{f.name}</span>
                      <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="hover:text-red-500"><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()} className="btn-secondary px-3" title="Attach files">
                  <Paperclip size={16} />
                </button>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt,.csv,.zip,.rar" />
                <input
                  className="input flex-1"
                  placeholder="Type your reply..."
                  value={reply}
                  onChange={(e) => { setReply(e.target.value); handleTyping(); }}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <button onClick={handleSend} disabled={sending || (!reply.trim() && files.length === 0)} className="btn-primary px-4">
                  {sending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          )}
          {ticket.status === 'closed' && !canRate && !isOwner && (
            <p className="text-center text-sm text-gray-400">This ticket is closed.</p>
          )}
          {ticket.status === 'closed' && !canRate && isOwner && !ticket.satisfaction?.rating && (
            <p className="text-center text-sm text-gray-400">This ticket is closed.</p>
          )}
        </div>

        {/* Satisfaction rating modal */}
        {showRating && (
          <SatisfactionModal
            ticket={ticket}
            onRate={onRate}
            onClose={() => setShowRating(false)}
          />
        )}
      </div>
    </div>
  );
};

/* ── Priority accent colors for card top strip ── */
const PRIO_ACCENT = {
  low:    'from-gray-300 to-gray-400',
  medium: 'from-blue-400 to-blue-500',
  high:   'from-amber-400 to-orange-500',
  urgent: 'from-red-500 to-rose-600',
};

/* ── Ticket Card ── */
const TicketCard = ({ ticket, isAdmin, onClick }) => {
  const cat = getCat(ticket.category);
  const CatIcon = cat.icon;
  const statusMeta = STATUS_META[ticket.status] || STATUS_META.open;
  const StatusIcon = statusMeta.icon;
  const prio = PRIORITIES[ticket.priority] || PRIORITIES.medium;
  const accent = PRIO_ACCENT[ticket.priority] || PRIO_ACCENT.medium;

  return (
    <div onClick={onClick} className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">
      {/* Priority accent strip */}
      <div className={`h-1.5 bg-gradient-to-r ${accent}`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Top: priority + AI + status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className={`badge border text-xs ${prio.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} /> {prio.label}
            </span>
            {ticket.aiDetectedPriority && (
              <span className="badge border text-xs bg-violet-50 text-violet-600 border-violet-200">
                <Brain size={9} /> AI
              </span>
            )}
          </div>
          <span className={`badge border text-xs ${statusMeta.color}`}>
            <StatusIcon size={10} /> {statusMeta.label}
          </span>
        </div>

        {/* Subject + description */}
        <div>
          <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-primary-700 transition-colors">{ticket.subject}</h3>
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{ticket.description}</p>
        </div>

        {/* SLA timer */}
        <SlaTimer sla={ticket.sla} status={ticket.status} priority={ticket.priority} />

        {/* Satisfaction */}
        {ticket.satisfaction?.rating && (
          <div className="flex items-center gap-1.5 bg-amber-50 rounded-xl px-3 py-1.5 w-fit">
            <StarRating value={ticket.satisfaction.rating} readonly size={12} />
            <span className="text-xs text-amber-700 font-semibold">{ticket.satisfaction.rating}/5</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {ticket.submittedBy?.name?.charAt(0) || '?'}
            </div>
            <div>
              <span className="text-xs font-medium text-gray-700 block leading-none">{ticket.submittedBy?.name}</span>
              <span className="text-xs text-gray-400">{fmtDate(ticket.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge border text-xs ${cat.color}`}><CatIcon size={9} /> {cat.label}</span>
            {(ticket.attachments?.length > 0 || ticket.replies?.length > 0) && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {ticket.attachments?.length > 0 && <span className="flex items-center gap-0.5"><Paperclip size={10} />{ticket.attachments.length}</span>}
                {ticket.replies?.length > 0 && <span className="flex items-center gap-0.5"><MessageSquare size={10} />{ticket.replies.length}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-violet-500/0 group-hover:from-primary-500/[0.02] group-hover:to-violet-500/[0.04] transition-all duration-300 pointer-events-none rounded-2xl" />
    </div>
  );
};

/* ── Submit Ticket Form ── */
const SubmitForm = ({ onSuccess }) => {
  const [form, setForm] = useState({ subject: '', description: '', category: 'other', priority: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const fileRef = useRef(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, 5));
    e.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return setError('Subject is required');
    if (!form.description.trim()) return setError('Description is required');
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('subject', form.subject);
      fd.append('description', form.description);
      fd.append('category', form.category);
      if (form.priority) fd.append('priority', form.priority);
      files.forEach((f) => fd.append('attachments', f));

      const { data } = await api.post('/support-tickets', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.aiSuggestion) setAiSuggestion(data.aiSuggestion);
      setDone(true);
      setTimeout(() => { setDone(false); setAiSuggestion(null); onSuccess?.(); }, 3000);
      setForm({ subject: '', description: '', category: 'other', priority: '' });
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="relative bg-white rounded-3xl border border-gray-100 text-center py-20 px-8 overflow-hidden animate-fade-in">
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-emerald-50" />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-green-50" />
      <div className="relative z-10">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/20">
          <CheckCircle2 size={36} className="text-white" />
        </div>
        <h3 className="font-bold text-gray-900 text-2xl">Ticket Submitted!</h3>
        <p className="text-gray-500 text-sm mt-2">We'll get back to you as soon as possible.</p>
        {aiSuggestion && (
          <div className="mt-5 inline-flex items-center gap-2 px-5 py-3 bg-violet-50 border border-violet-200 rounded-2xl text-sm text-violet-700">
            <Brain size={16} />
            AI detected priority: <strong className="text-violet-900">{aiSuggestion.suggestedPriority}</strong>
            {aiSuggestion.applied && <span className="text-violet-500">(auto-applied)</span>}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Plus size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Support Ticket</h2>
            <p className="text-sm text-gray-500 mt-0.5">Describe your issue — AI will suggest priority, or pick your own</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category picker */}
          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm((f) => ({ ...f, category: value }))}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.category === value ? `${color} border-current` : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority picker — optional, AI will detect if not set */}
          <div>
            <label className="label flex items-center gap-2">
              Priority
              <span className="text-xs text-violet-500 font-normal flex items-center gap-1">
                <Brain size={11} /> Leave empty for AI auto-detect
              </span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, priority: '' }))}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  !form.priority
                    ? 'bg-violet-100 text-violet-700 border-violet-300'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Brain size={13} /> Auto
              </button>
              {Object.entries(PRIORITIES).map(([value, { color, label, dot }]) => (
                <button
                  key={value} type="button"
                  onClick={() => setForm((f) => ({ ...f, priority: value }))}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    form.priority === value ? `${color} border-current` : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${dot}`} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Subject *</label>
            <input className="input" placeholder="Brief summary of your issue..." value={form.subject} onChange={set('subject')} required />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              className="input resize-none" rows={5}
              placeholder="Describe the issue in detail. Include steps to reproduce, error messages, etc..."
              value={form.description} onChange={set('description')} required
            />
          </div>

          {/* File attachments */}
          <div>
            <label className="label">Attachments (max 5 files, 10MB each)</label>
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary text-sm">
              <Paperclip size={14} /> Choose Files
            </button>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,.pdf,.doc,.docx,.txt,.csv,.zip,.rar" />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {files.map((f, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700">
                    <Paperclip size={10} />
                    <span className="max-w-32 truncate">{f.name}</span>
                    <span className="text-gray-400">{formatFileSize(f.size)}</span>
                    <button type="button" onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="hover:text-red-500 ml-1"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SLA info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-2">
            <Timer size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-700">SLA Response Times</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Urgent: 2h &middot; High: 8h &middot; Medium: 24h &middot; Low: 48h
              </p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base font-semibold">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...
              </span>
            ) : (
              <><Send size={16} /> Submit Ticket</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ── Analytics Panel ── */
const AnalyticsPanel = ({ stats }) => {
  if (!stats) return null;

  const statusData = [
    { name: 'Open',        value: stats.open,       color: '#f59e0b' },
    { name: 'In Progress', value: stats.inProgress,  color: '#3b82f6' },
    { name: 'Resolved',    value: stats.resolved,    color: '#10b981' },
    { name: 'Closed',      value: stats.closed,      color: '#6b7280' },
  ].filter((d) => d.value > 0);

  const catData = stats.byCategory?.map((c) => ({ name: getCat(c._id).label, count: c.count })) || [];

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Total Tickets', value: stats.total,        color: 'from-primary-500 to-violet-600', shadow: 'shadow-primary-500/15', icon: LifeBuoy },
          { label: 'Open',          value: stats.open,          color: 'from-amber-400 to-orange-500',   shadow: 'shadow-amber-500/15',   icon: CircleDot },
          { label: 'In Progress',   value: stats.inProgress,    color: 'from-blue-500 to-cyan-500',      shadow: 'shadow-blue-500/15',    icon: Clock },
          { label: 'Resolved',      value: stats.resolved,      color: 'from-emerald-500 to-teal-600',   shadow: 'shadow-emerald-500/15', icon: CheckCircle2 },
          { label: 'SLA Breached',  value: stats.slaBreached||0, color: 'from-red-500 to-rose-600',      shadow: 'shadow-red-500/15',     icon: ShieldAlert },
          { label: 'Avg Rating',    value: stats.avgSatisfaction||'—', color: 'from-amber-400 to-yellow-500', shadow: 'shadow-amber-500/15', icon: Star, sub: `${stats.totalRated} rated` },
        ].map(({ label, value, color, shadow, icon: Icon, sub }) => (
          <div key={label} className={`relative overflow-hidden bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg ${shadow} transition-all duration-300`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${shadow}`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                {sub && <p className="text-xs text-gray-400">{sub}</p>}
              </div>
            </div>
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br ${color} opacity-5`} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Status pie */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center"><BarChart2 size={15} className="text-primary-600" /></div>
            Tickets by Status
          </h3>
          {statusData.length > 0 ? (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
          )}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {statusData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} /> {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        {/* Category bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center"><BarChart2 size={15} className="text-violet-600" /></div>
            Tickets by Category
          </h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} margin={{ bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {catData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ── */
export default function SupportTicketPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const TABS = [
    { id: 'tickets',   label: isAdmin ? 'All Tickets' : 'My Tickets', icon: LifeBuoy, roles: ['admin', 'student'] },
    { id: 'create',    label: 'New Ticket',                           icon: Plus,      roles: ['student'] },
    { id: 'analytics', label: 'Analytics',                            icon: BarChart2, roles: ['admin'] },
  ].filter((t) => t.roles.includes(user?.role));

  const [tab, setTab] = useState(TABS[0]?.id || 'tickets');
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (filterCat) params.append('category', filterCat);
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      const { data } = await api.get(`/support-tickets?${params}`);
      setTickets(data.tickets);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [search, filterCat, filterStatus, filterPriority, page]);

  const fetchStats = useCallback(() => {
    if (isAdmin) api.get('/support-tickets/stats').then((r) => setStats(r.data.stats));
  }, [isAdmin]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Socket.IO: listen for real-time events
  useEffect(() => {
    const s = getSocket();
    if (!s.connected) s.connect();

    s.on('ticket:created', () => { fetchTickets(); fetchStats(); });
    s.on('ticket:reply', (updatedTicket) => {
      if (selected && selected._id === updatedTicket._id) {
        setSelected(updatedTicket);
      }
      fetchTickets();
    });
    s.on('ticket:statusChanged', (updatedTicket) => {
      if (selected && selected._id === updatedTicket._id) {
        setSelected(updatedTicket);
      }
      fetchTickets(); fetchStats();
    });

    return () => {
      s.off('ticket:created');
      s.off('ticket:reply');
      s.off('ticket:statusChanged');
    };
  }, [fetchTickets, fetchStats, selected]);

  const handleReply = async (id, message, files = []) => {
    const fd = new FormData();
    fd.append('message', message);
    files.forEach((f) => fd.append('attachments', f));
    const { data } = await api.put(`/support-tickets/${id}/reply`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setSelected(data.ticket);
    fetchTickets(); fetchStats();
    showToast('Reply sent!');
  };

  const handleStatusChange = async (id, status) => {
    const { data } = await api.put(`/support-tickets/${id}/status`, { status });
    setSelected(data.ticket);
    fetchTickets(); fetchStats();
    showToast(`Ticket marked as ${status.replace('_', ' ')}`);
  };

  const handleRate = async (id, rating, comment) => {
    const { data } = await api.put(`/support-tickets/${id}/rate`, { rating, comment });
    setSelected(data.ticket);
    fetchTickets(); fetchStats();
    showToast('Thank you for your feedback!');
  };

  // Fetch fresh ticket data when opening detail
  const openTicket = async (id) => {
    try {
      const { data } = await api.get(`/support-tickets/${id}`);
      setSelected(data.ticket);
    } catch {
      showToast('Failed to load ticket');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* ── Premium Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-violet-600 to-purple-700 rounded-3xl p-6 sm:p-8">
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        <div className="absolute top-4 right-12 w-20 h-20 rounded-full bg-violet-400/20" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <LifeBuoy size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
                <p className="text-white/70 text-sm mt-0.5">
                  {isAdmin ? 'Manage and respond to student support requests' : 'Submit and track your support requests'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick stats in header */}
            {isAdmin && stats && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10">
                  <p className="text-2xl font-black text-white">{stats.open}</p>
                  <p className="text-xs text-white/60">Open</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2 border border-white/10">
                  <p className="text-2xl font-black text-white">{stats.inProgress}</p>
                  <p className="text-xs text-white/60">In Progress</p>
                </div>
              </div>
            )}
            <button onClick={() => { fetchTickets(); fetchStats(); }} className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors border border-white/10">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selected && (
        <TicketDetail
          ticket={selected}
          isAdmin={isAdmin}
          userId={user?._id}
          onReply={handleReply}
          onStatusChange={handleStatusChange}
          onClose={() => setSelected(null)}
          onRate={handleRate}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1.5 w-fit border border-gray-200/50">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setPage(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              tab === id
                ? 'bg-white text-primary-700 shadow-md shadow-primary-500/10 border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <Icon size={15} /> {label}
            {id === 'tickets' && stats?.open > 0 && isAdmin && (
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs flex items-center justify-center font-bold shadow-sm">
                {stats.open}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── CREATE TAB ── */}
      {tab === 'create' && (
        <SubmitForm onSuccess={() => { setTab('tickets'); fetchTickets(); }} />
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === 'analytics' && <AnalyticsPanel stats={stats} />}

      {/* ── TICKETS TAB ── */}
      {tab === 'tickets' && (
        <div className="space-y-5">
          {/* ── Glass-style Filter Bar ── */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-52">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-500/10 outline-none text-sm transition-all placeholder:text-gray-400"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <select className="input w-auto" value={filterCat} onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select className="input w-auto" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select className="input w-auto" value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}>
                <option value="">All Priority</option>
                {Object.entries(PRIORITIES).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
              </select>
              {(search || filterCat || filterStatus || filterPriority) && (
                <button onClick={() => { setSearch(''); setFilterCat(''); setFilterStatus(''); setFilterPriority(''); setPage(1); }} className="btn-secondary text-red-500 border-red-200 hover:bg-red-50">
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              {total} ticket{total !== 1 ? 's' : ''} found
            </p>
            {!isAdmin && (
              <button onClick={() => setTab('create')} className="btn-primary text-xs py-2 px-4">
                <Plus size={13} /> New Ticket
              </button>
            )}
          </div>

          {/* ── Loading State ── */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-primary-100 rounded-full" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-gray-400 font-medium">Loading tickets...</p>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            /* ── Empty State ── */
            <div className="relative bg-white rounded-3xl border border-gray-100 text-center py-20 px-8 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary-50 opacity-50" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-violet-50 opacity-50" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <LifeBuoy size={36} className="text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No tickets found</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                  {user?.role === 'student'
                    ? 'You haven\'t submitted any support tickets yet. Need help with something?'
                    : 'No tickets match your current filters. Try adjusting your search.'}
                </p>
                {user?.role === 'student' && (
                  <button onClick={() => setTab('create')} className="btn-primary mt-6 mx-auto px-6 py-3 text-sm font-semibold shadow-lg shadow-primary-500/20">
                    <Plus size={16} /> Create Your First Ticket
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── Ticket Grid ── */
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tickets.map((t) => (
                <TicketCard key={t._id} ticket={t} isAdmin={isAdmin} onClick={() => openTicket(t._id)} />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {pages > 1 && (
            <div className="flex justify-center gap-1.5 pt-4">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    page === p
                      ? 'bg-gradient-to-br from-primary-600 to-violet-600 text-white shadow-md shadow-primary-500/20'
                      : 'hover:bg-gray-100 text-gray-500 bg-white border border-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
