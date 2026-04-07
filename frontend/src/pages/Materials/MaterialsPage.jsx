import { useEffect, useState, useRef, useCallback } from 'react';
import {
  BookOpen, Upload, Shield, Search, Filter, Download, Eye,
  CheckCircle, Archive, RotateCcw, Trash2, Plus, X, Tag,
  FileText, Image, Film, Table2, File, Presentation,
  Clock, TrendingDown, ChevronDown, AlertTriangle, RefreshCw,
  FolderOpen, Sparkles, BookMarked, Users2, CheckCircle2, PlayCircle,
  Youtube, Link2, ExternalLink,
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/* ─── Progress Status Meta ─── */
const PROGRESS_META = {
  completed:   { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Completed', icon: CheckCircle2 },
  in_progress: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'In Progress', icon: PlayCircle },
  not_started: { color: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Not Started', icon: Clock },
};

/* ─── Helpers ─── */
const FILE_META = {
  pdf:         { icon: FileText,     color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-100',    label: 'PDF' },
  doc:         { icon: FileText,     color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100',   label: 'DOC' },
  ppt:         { icon: Presentation, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100', label: 'PPT' },
  spreadsheet: { icon: Table2,       color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-100',label: 'XLS' },
  image:       { icon: Image,        color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100', label: 'IMG' },
  video:       { icon: Film,         color: 'text-pink-500',   bg: 'bg-pink-50',   border: 'border-pink-100',   label: 'VID' },
  youtube:     { icon: Youtube,      color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-100',    label: 'YouTube' },
  link:        { icon: Link2,        color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100', label: 'Link' },
  other:       { icon: File,         color: 'text-gray-500',   bg: 'bg-gray-50',   border: 'border-gray-200',   label: 'FILE' },
};

const CONTENT_TYPES = [
  { id: 'file',    label: 'File Upload',  icon: Upload,   desc: 'PDF, DOC, PPT, Images, Videos' },
  { id: 'youtube', label: 'YouTube Video', icon: Youtube,  desc: 'Paste a YouTube video URL' },
  { id: 'link',    label: 'External Link', icon: Link2,    desc: 'Link to external resource' },
];

const STATUS_META = {
  pending:  { color: 'bg-amber-100 text-amber-700 border-amber-200',  label: 'Pending Review' },
  approved: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Published' },
  archived: { color: 'bg-gray-100 text-gray-500 border-gray-200',     label: 'Archived' },
<<<<<<< HEAD
  deleted:  { color: 'bg-red-100 text-red-700 border-red-200',        label: 'Deleted' },
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
};

const fmtSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const TABS = [
  { id: 'browse',     label: 'Browse Materials', icon: BookOpen,     roles: ['admin','teacher','student','guardian'] },
  { id: 'upload',     label: 'Upload Material',  icon: Upload,       roles: ['admin','teacher'] },
  { id: 'moderation', label: 'Moderation',       icon: Shield,       roles: ['admin'] },
];

/* ─── Sub-components ─── */
const StatBadge = ({ label, value, icon: Icon, color }) => (
  <div className="stat-card flex items-center gap-3 py-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-xl font-black text-gray-900">{value ?? '—'}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const MaterialCard = ({ m, onDownload, onApprove, onArchive, onRestore, onDelete, role, progress, onMarkComplete }) => {
  const meta = FILE_META[m.fileType] || FILE_META.other;
  const Icon = meta.icon;
  const statusMeta = STATUS_META[m.status] || STATUS_META.pending;
  const [archiveModal, setArchiveModal] = useState(false);
  const [reason, setReason] = useState('');

  // Progress tracking for students
  const progressStatus = progress?.status || 'not_started';
  const progressMeta = PROGRESS_META[progressStatus];
  const timeSpentMins = Math.round((progress?.totalTimeSpent || 0) / 60);

  return (
    <div className={`card-hover group flex flex-col ${m.status === 'archived' ? 'opacity-60' : ''}`}>
      {/* File type strip */}
      <div className={`h-1.5 rounded-full mb-4 ${meta.bg} border ${meta.border}`} />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} border ${meta.border}`}>
          <Icon size={20} className={meta.color} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-primary-700 transition-colors">
            {m.title}
          </h3>
          <p className={`text-xs font-semibold mt-0.5 ${meta.color}`}>{meta.label}</p>
        </div>
        <span className={`badge border flex-shrink-0 text-xs ${statusMeta.color}`}>{statusMeta.label}</span>
      </div>

      {/* Meta info */}
      <div className="space-y-1.5 mb-4 flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <BookMarked size={11} className="text-primary-400" />
          <span className="font-medium text-gray-700 truncate">{m.subject}</span>
          {m.week && <span className="text-gray-400">· Week {m.week}</span>}
        </div>
        {m.module && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FolderOpen size={11} className="text-gray-400" />
            <span className="truncate">{m.module}</span>
          </div>
        )}
        {m.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{m.description}</p>
        )}
        {m.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {m.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-xs bg-primary-50 text-primary-700 rounded-full px-2 py-0.5">#{t}</span>
            ))}
            {m.tags.length > 3 && <span className="text-xs text-gray-400">+{m.tags.length - 3}</span>}
          </div>
        )}
      </div>

      {/* YouTube thumbnail preview */}
      {m.contentType === 'youtube' && m.thumbnailUrl && (
        <div className="relative mb-3 rounded-xl overflow-hidden bg-gray-100">
          <img src={m.thumbnailUrl} alt={m.title} className="w-full h-28 object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
              <PlayCircle size={24} className="text-white ml-0.5" />
            </div>
          </div>
        </div>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-3 pt-3 border-t border-gray-100">
        <span>{m.contentType === 'file' ? fmtSize(m.fileSize) : m.contentType === 'youtube' ? 'Video' : 'Link'}</span>
        <div className="flex items-center gap-2">
          {m.contentType === 'file' ? <Download size={10} /> : <Eye size={10} />}
          <span>{m.downloadCount} {m.contentType === 'file' ? 'downloads' : 'views'}</span>
        </div>
        <span>{m.uploadedBy?.name?.split(' ')[0]}</span>
      </div>

      {/* Progress indicator for students */}
      {role === 'student' && m.status === 'approved' && (
        <div className="flex items-center gap-2 text-xs mb-3 py-2 px-3 rounded-xl bg-gray-50">
          {progressMeta && (
            <span className={`badge border flex items-center gap-1 ${progressMeta.color}`}>
              <progressMeta.icon size={10} />
              {progressMeta.label}
            </span>
          )}
          {timeSpentMins > 0 && (
            <span className="text-gray-500 flex items-center gap-1">
              <Clock size={10} />
              {timeSpentMins} min
            </span>
          )}
          {progress?.viewCount > 0 && (
            <span className="text-gray-400">{progress.viewCount} views</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1.5">
        {m.status === 'approved' && (
          <button
            onClick={() => onDownload(m)}
            className="btn-primary flex-1 justify-center py-2 text-xs"
          >
            {m.contentType === 'youtube' ? (
              <><PlayCircle size={12} /> Watch</>
            ) : m.contentType === 'link' ? (
              <><ExternalLink size={12} /> Open</>
            ) : (
              <><Download size={12} /> {role === 'student' ? 'View' : 'Download'}</>
            )}
          </button>
        )}
        {role === 'student' && m.status === 'approved' && (
          <button
            onClick={() => onMarkComplete?.(m._id, progressStatus !== 'completed')}
            className={`btn-secondary py-2 text-xs flex items-center gap-1 ${
              progressStatus === 'completed'
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
            }`}
          >
            <CheckCircle2 size={12} />
            {progressStatus === 'completed' ? 'Done' : 'Complete'}
          </button>
        )}
        {role === 'admin' && m.status === 'pending' && (
          <button onClick={() => onApprove(m._id)} className="btn-primary flex-1 justify-center py-2 text-xs bg-emerald-600 hover:bg-emerald-700">
            <CheckCircle size={12} /> Approve
          </button>
        )}
        {role === 'admin' && m.status === 'approved' && (
          <button onClick={() => setArchiveModal(true)} className="btn-secondary py-2 text-xs text-orange-600 border-orange-200 hover:bg-orange-50">
            <Archive size={12} />
          </button>
        )}
        {role === 'admin' && m.status === 'archived' && (
          <button onClick={() => onRestore(m._id)} className="btn-secondary flex-1 justify-center py-2 text-xs">
            <RotateCcw size={12} /> Restore
          </button>
        )}
<<<<<<< HEAD
        {['admin', 'teacher'].includes(role) && (
          <button onClick={() => onDelete(m._id)} className="btn-secondary py-2 text-xs text-red-500 border-red-200 hover:bg-red-50">
            <Trash2 size={12} /> Delete
=======
        {role === 'admin' && (
          <button onClick={() => onDelete(m._id)} className="btn-secondary py-2 text-xs text-red-500 border-red-200 hover:bg-red-50">
            <Trash2 size={12} />
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
          </button>
        )}
      </div>

      {/* Archive reason modal */}
      {archiveModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <h3 className="font-bold text-gray-900 mb-1">Archive Material</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for archiving <strong>"{m.title}"</strong></p>
            <textarea
              className="input resize-none mb-4"
              rows={3}
              placeholder="e.g. Replaced by updated 2025 version"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={() => setArchiveModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button
                onClick={() => { onArchive(m._id, reason); setArchiveModal(false); }}
                className="btn-primary flex-1 justify-center bg-orange-500 hover:bg-orange-600"
              >
                <Archive size={13} /> Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Upload Form ─── */
const UploadForm = ({ onSuccess }) => {
  const [contentType, setContentType] = useState('file');
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState([]);  // Multiple files support
  const [form, setForm] = useState({
    title: '', description: '', subject: '', module: '',
    week: '', academicYear: new Date().getFullYear().toString(),
    tags: '', version: '1.0', youtubeUrl: '', externalUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploadingIndex, setUploadingIndex] = useState(-1);  // Track which file is uploading
  const [uploadResults, setUploadResults] = useState([]);  // Track upload results
  const inputRef = useRef();

  // Extract YouTube video ID for preview
  const extractYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeId = extractYouTubeId(form.youtubeUrl);
  const youtubeThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) {
      setFiles((prev) => [...prev, ...dropped]);
    }
  };

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
    }
    e.target.value = ''; // Reset input to allow selecting same files
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileMeta = (file) => {
    return FILE_META[
      file.type.includes('pdf') ? 'pdf' :
      file.type.includes('word') || file.type.includes('document') ? 'doc' :
      file.type.includes('presentation') || file.type.includes('powerpoint') ? 'ppt' :
      file.type.includes('spreadsheet') || file.type.includes('excel') ? 'spreadsheet' :
      file.type.startsWith('image/') ? 'image' :
      file.type.startsWith('video/') ? 'video' : 'other'
    ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (contentType === 'file' && files.length === 0) {
      return setError('Please select at least one file to upload');
    }
    if (contentType === 'youtube' && !form.youtubeUrl) {
      return setError('Please enter a YouTube URL');
    }
    if (contentType === 'youtube' && !youtubeId) {
      return setError('Invalid YouTube URL. Please enter a valid YouTube video link.');
    }
    if (contentType === 'link' && !form.externalUrl) {
      return setError('Please enter an external URL');
    }

    setLoading(true);
    setProgress(0);
    setUploadResults([]);

    try {
      if (contentType === 'file') {
        // Multiple file upload - one by one
        const results = [];
        for (let i = 0; i < files.length; i++) {
          setUploadingIndex(i);
          setProgress(0);

          const file = files[i];
          const fd = new FormData();
          fd.append('file', file);

          // For single file: use form title, for multiple: use filename as title if no title
          const title = files.length === 1 ? form.title : (form.title || file.name.replace(/\.[^/.]+$/, ''));
          fd.append('title', title);

          Object.entries(form).forEach(([k, v]) => {
            if (v && !['youtubeUrl', 'externalUrl', 'title'].includes(k)) fd.append(k, v);
          });

          try {
            await api.post('/materials', fd, {
              headers: { 'Content-Type': 'multipart/form-data' },
              onUploadProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
            });
            results.push({ file: file.name, success: true });
          } catch (err) {
            results.push({ file: file.name, success: false, error: err.response?.data?.message || 'Failed' });
          }
        }
        setUploadResults(results);

        // Check if all succeeded
        const allSuccess = results.every(r => r.success);
        if (!allSuccess) {
          const failed = results.filter(r => !r.success);
          setError(`${failed.length} file(s) failed to upload`);
        }
      } else {
        // YouTube or Link - JSON POST
        await api.post('/materials/url', {
          ...form,
          contentType,
        });
      }

      // Reset form
      setFiles([]);
      setUploadingIndex(-1);
      setContentType('file');
      setForm({
        title: '', description: '', subject: '', module: '', week: '',
        academicYear: new Date().getFullYear().toString(), tags: '', version: '1.0',
        youtubeUrl: '', externalUrl: '',
      });
      setProgress(0);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
      setUploadingIndex(-1);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const clearForm = () => {
    setFiles([]);
    setUploadResults([]);
    setForm({
      title: '', description: '', subject: '', module: '', week: '',
      academicYear: new Date().getFullYear().toString(), tags: '', version: '1.0',
      youtubeUrl: '', externalUrl: '',
    });
  };

  const totalFileSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="max-w-2xl">
      <div className="card space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Add Study Material</h2>
          <p className="text-sm text-gray-500 mt-0.5">Upload files, add YouTube videos, or link external resources</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Content Type Selector */}
        <div>
          <label className="label mb-2">Content Type</label>
          <div className="grid grid-cols-3 gap-2">
            {CONTENT_TYPES.map((ct) => (
              <button
                key={ct.id}
                type="button"
                onClick={() => setContentType(ct.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                  contentType === ct.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                  contentType === ct.id ? 'bg-primary-500' : 'bg-gray-100'
                }`}>
                  <ct.icon size={16} className={contentType === ct.id ? 'text-white' : 'text-gray-500'} />
                </div>
                <p className={`text-sm font-semibold ${contentType === ct.id ? 'text-primary-700' : 'text-gray-700'}`}>
                  {ct.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{ct.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* File Drop Zone - Only for file type */}
        {contentType === 'file' && (
          <div className="space-y-3">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragging
                  ? 'border-primary-400 bg-primary-50 scale-[1.01]'
                  : files.length > 0
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <input ref={inputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center mx-auto mb-3 shadow-glow/30">
                <Upload size={20} className="text-white" />
              </div>
              <p className="font-semibold text-gray-700">Drag & drop files here</p>
              <p className="text-sm text-gray-400 mt-1">or <span className="text-primary-600 font-medium">click to browse</span></p>
              <p className="text-xs text-gray-400 mt-2">PDF · DOC · PPT · XLS · Images · Video · up to 50 MB each</p>
              {files.length > 0 && (
                <p className="text-xs text-emerald-600 font-medium mt-2">
                  + Click to add more files
                </p>
              )}
            </div>

            {/* Selected files list */}
            {files.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                  <span className="font-semibold">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                  <span>Total: {fmtSize(totalFileSize)}</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {files.map((file, index) => {
                    const meta = getFileMeta(file);
                    const isUploading = loading && uploadingIndex === index;
                    const result = uploadResults[index];

                    return (
                      <div
                        key={`${file.name}-${index}`}
                        className={`flex items-center gap-3 bg-white rounded-xl p-2.5 border transition-all ${
                          isUploading ? 'border-primary-300 bg-primary-50' :
                          result?.success ? 'border-emerald-300 bg-emerald-50' :
                          result?.success === false ? 'border-red-300 bg-red-50' :
                          'border-gray-100'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                          <meta.icon size={16} className={meta.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">{fmtSize(file.size)}</p>
                        </div>
                        {isUploading ? (
                          <div className="flex items-center gap-2 text-xs text-primary-600">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            {progress}%
                          </div>
                        ) : result?.success ? (
                          <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                        ) : result?.success === false ? (
                          <span className="text-xs text-red-500">{result.error}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {!loading && (
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 px-1"
                  >
                    <Trash2 size={10} /> Clear all files
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* YouTube URL Input */}
        {contentType === 'youtube' && (
          <div className="space-y-3">
            <div>
              <label className="label">YouTube URL *</label>
              <input
                className="input"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={form.youtubeUrl}
                onChange={set('youtubeUrl')}
              />
            </div>
            {youtubeThumbnail && (
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <div className="relative">
                  <img src={youtubeThumbnail} alt="Video preview" className="w-full h-40 object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                      <PlayCircle size={28} className="text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <CheckCircle size={12} /> Valid YouTube video detected
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* External Link Input */}
        {contentType === 'link' && (
          <div>
            <label className="label">External URL *</label>
            <input
              className="input"
              placeholder="https://example.com/resource"
              value={form.externalUrl}
              onChange={set('externalUrl')}
            />
            <p className="text-xs text-gray-400 mt-1">Link to an external website, document, or resource</p>
          </div>
        )}

        {/* Upload progress */}
        {loading && contentType === 'file' && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">
                Title {contentType === 'file' && files.length > 1 ? '(optional - uses filename if empty)' : '*'}
              </label>
              <input
                className="input"
                placeholder={contentType === 'file' && files.length > 1 ? "Leave empty to use filenames as titles" : "e.g. Week 3 — Database Normalization Slides"}
                value={form.title}
                onChange={set('title')}
                required={contentType !== 'file' || files.length <= 1}
              />
            </div>
            <div>
              <label className="label">Subject *</label>
              <input className="input" placeholder="Database Systems" value={form.subject} onChange={set('subject')} required />
            </div>
            <div>
              <label className="label">Module / Topic</label>
              <input className="input" placeholder="Chapter 3: Normalization" value={form.module} onChange={set('module')} />
            </div>
            <div>
              <label className="label">Week Number</label>
<<<<<<< HEAD
              <input className="input" type="number" min="1" max="52" placeholder="3" value={form.week} onChange={set('week')} onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }} />
            </div>
            <div>
              <label className="label">Academic Year</label>
              <input className="input" type="number" min="1900" max="2100" placeholder="2025" value={form.academicYear} onChange={set('academicYear')} onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }} />
            </div>
            <div>
              <label className="label">Version</label>
              <input className="input" type="number" step="0.1" min="0" placeholder="1.0" value={form.version} onChange={set('version')} onKeyDown={(e) => { if (!/[0-9.]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }} />
=======
              <input className="input" type="number" min="1" max="52" placeholder="3" value={form.week} onChange={set('week')} />
            </div>
            <div>
              <label className="label">Academic Year</label>
              <input className="input" placeholder="2025" value={form.academicYear} onChange={set('academicYear')} />
            </div>
            <div>
              <label className="label">Version</label>
              <input className="input" placeholder="1.0" value={form.version} onChange={set('version')} />
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
            </div>
            <div>
              <label className="label flex items-center gap-1"><Tag size={12} /> Tags (comma-separated)</label>
              <input className="input" placeholder="lecture, slides, database, normalization" value={form.tags} onChange={set('tags')} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} placeholder="Brief description of the material content..." value={form.description} onChange={set('description')} />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={clearForm} className="btn-secondary">
              <X size={14} /> Clear
            </button>
            <button
              type="submit"
              disabled={loading || (contentType === 'file' && files.length === 0) || (contentType === 'youtube' && !youtubeId) || (contentType === 'link' && !form.externalUrl)}
              className="btn-primary flex-1 justify-center py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {contentType === 'file' ? `Uploading ${uploadingIndex + 1}/${files.length}...` : 'Saving...'}
                </span>
              ) : contentType === 'youtube' ? (
                <><Youtube size={16} /> Add YouTube Video</>
              ) : contentType === 'link' ? (
                <><Link2 size={16} /> Add External Link</>
              ) : (
                <><Upload size={16} /> Upload {files.length > 1 ? `${files.length} Files` : 'Material'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Page ─── */
export default function MaterialsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('browse');
  const [materials, setMaterials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterStatus, setFilterStatus] = useState(tab === 'moderation' ? 'pending' : '');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [progressMap, setProgressMap] = useState({});

  const visibleTabs = TABS.filter((t) => t.roles.includes(user?.role));

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (filterType) params.append('fileType', filterType);
      if (filterSubject) params.append('subject', filterSubject);
      if (filterWeek) params.append('week', filterWeek);
      if (tab === 'moderation') {
        params.append('status', filterStatus || 'pending');
      } else if (filterStatus) {
        params.append('status', filterStatus);
      }
      const { data } = await api.get(`/materials?${params}`);
      setMaterials(data.materials);
      setPages(data.pages);
      setTotal(data.total);
    } finally { setLoading(false); }
  }, [search, filterType, filterSubject, filterWeek, filterStatus, tab, page]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  useEffect(() => {
    if (['admin', 'teacher'].includes(user?.role)) {
      api.get('/materials/stats').then((r) => setStats(r.data.stats));
    }
  }, [user]);

  // Fetch student progress
  const fetchProgress = useCallback(async () => {
    if (user?.role !== 'student') return;
    try {
      const { data } = await api.get('/progress/my');
      const map = {};
      data.data.progress.forEach((p) => {
        map[p.material?._id || p.material] = p;
      });
      setProgressMap(map);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Handle mark complete/uncomplete
  const handleMarkComplete = async (materialId, markAsComplete) => {
    try {
      if (markAsComplete) {
        await api.put(`/progress/complete/${materialId}`);
        showSuccess('Marked as complete!');
      } else {
        await api.put(`/progress/uncomplete/${materialId}`);
        showSuccess('Marked as incomplete');
      }
      fetchProgress();
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  // Track progress on view/download
  const trackProgressStart = async (materialId) => {
    if (user?.role !== 'student') return;
    try {
      await api.post(`/progress/start/${materialId}`);
      fetchProgress();
    } catch (err) {
      console.error('Failed to track progress:', err);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDownload = (m) => {
    window.open(`/api/materials/${m._id}/download?token=${localStorage.getItem('token')}`, '_blank');
    setMaterials((prev) => prev.map((mat) => mat._id === m._id ? { ...mat, downloadCount: mat.downloadCount + 1 } : mat));
  };

  const handleApprove = async (id) => {
    await api.put(`/materials/${id}/approve`);
    fetchMaterials();
    if (stats) api.get('/materials/stats').then((r) => setStats(r.data.stats));
    showSuccess('Material approved and published!');
  };

  const handleArchive = async (id, reason) => {
    await api.put(`/materials/${id}/archive`, { reason });
    fetchMaterials();
    if (stats) api.get('/materials/stats').then((r) => setStats(r.data.stats));
    showSuccess('Material archived.');
  };

  const handleRestore = async (id) => {
    await api.put(`/materials/${id}/restore`);
    fetchMaterials();
    showSuccess('Material restored and published.');
  };

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this material?')) return;
    await api.delete(`/materials/${id}`);
    fetchMaterials();
    if (stats) api.get('/materials/stats').then((r) => setStats(r.data.stats));
    showSuccess('Material deleted.');
  };

  // Download/open material (handles files, YouTube, and links) + track progress
  const downloadWithAuth = async (m) => {
    try {
      // Track progress for students
      await trackProgressStart(m._id);

      // Handle YouTube videos
      if (m.contentType === 'youtube' && m.youtubeUrl) {
        window.open(m.youtubeUrl, '_blank');
        setMaterials((prev) => prev.map((mat) => mat._id === m._id ? { ...mat, downloadCount: mat.downloadCount + 1 } : mat));
        return;
      }

      // Handle external links
      if (m.contentType === 'link' && m.externalUrl) {
        window.open(m.externalUrl, '_blank');
        setMaterials((prev) => prev.map((mat) => mat._id === m._id ? { ...mat, downloadCount: mat.downloadCount + 1 } : mat));
        return;
      }

      // Handle file downloads
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/materials/${m._id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = m.fileName;
      a.click();
      URL.revokeObjectURL(url);
      setMaterials((prev) => prev.map((mat) => mat._id === m._id ? { ...mat, downloadCount: mat.downloadCount + 1 } : mat));
    } catch { alert('Failed to open content'); }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Study materials, lecture resources, and academic content repository</p>
        </div>
        <button onClick={fetchMaterials} className="btn-secondary"><RefreshCw size={14} /></button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Stats — admin/teacher only */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatBadge label="Total Files"   value={stats.total}          icon={FolderOpen}  color="from-primary-500 to-violet-600" />
          <StatBadge label="Published"     value={stats.approved}       icon={CheckCircle} color="from-emerald-500 to-teal-600" />
          <StatBadge label="Pending"       value={stats.pending}        icon={Clock}       color="from-amber-400 to-orange-500" />
          <StatBadge label="Archived"      value={stats.archived}       icon={Archive}     color="from-gray-400 to-gray-600" />
          <StatBadge label="Total Downloads" value={stats.totalDownloads} icon={Download}  color="from-blue-500 to-cyan-600" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setTab(id); setPage(1); setFilterStatus(id === 'moderation' ? 'pending' : ''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
            {id === 'moderation' && stats?.pending > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── UPLOAD TAB ── */}
      {tab === 'upload' && (
        <UploadForm
          onSuccess={() => {
            setTab('browse');
            fetchMaterials();
            if (stats) api.get('/materials/stats').then((r) => setStats(r.data.stats));
            showSuccess('Material uploaded successfully! Pending admin review.');
          }}
        />
      )}

      {/* ── BROWSE / MODERATION TAB ── */}
      {(tab === 'browse' || tab === 'moderation') && (
        <div className="space-y-4">
          {/* Moderation status filter */}
          {tab === 'moderation' && (
            <div className="card py-4">
              <div className="flex flex-wrap gap-2">
<<<<<<< HEAD
                {['pending', 'approved', 'archived', 'deleted'].map((s) => (
=======
                {['pending', 'approved', 'archived'].map((s) => (
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
                  <button
                    key={s}
                    onClick={() => { setFilterStatus(s); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 capitalize ${
                      filterStatus === s
                        ? s === 'pending'   ? 'bg-amber-500 text-white border-amber-500'
                          : s === 'approved' ? 'bg-emerald-600 text-white border-emerald-600'
<<<<<<< HEAD
                          : s === 'deleted' ? 'bg-red-600 text-white border-red-600'
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
                          : 'bg-gray-600 text-white border-gray-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {STATUS_META[s].label}
                    {s === 'pending' && stats?.pending > 0 && (
                      <span className="ml-1.5 bg-white/30 rounded-full px-1.5">{stats.pending}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search & filters */}
          <div className="card py-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-52">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input pl-10"
                  placeholder="Search title, subject, tags..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <input
                className="input w-40"
                placeholder="Subject..."
                value={filterSubject}
                onChange={(e) => { setFilterSubject(e.target.value); setPage(1); }}
              />
              <select
                className="input w-36"
                value={filterType}
                onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              >
                <option value="">All Types</option>
                {Object.entries(FILE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <input
                className="input w-28"
                type="number"
                min="1"
                placeholder="Week..."
                value={filterWeek}
                onChange={(e) => { setFilterWeek(e.target.value); setPage(1); }}
              />
              {(search || filterType || filterSubject || filterWeek) && (
                <button
                  onClick={() => { setSearch(''); setFilterType(''); setFilterSubject(''); setFilterWeek(''); setPage(1); }}
                  className="btn-secondary text-red-500 border-red-200 hover:bg-red-50"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">{total} material{total !== 1 ? 's' : ''} found</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading materials...</p>
              </div>
            </div>
          ) : materials.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={28} className="text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">No materials found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {tab === 'moderation'
                  ? `No ${filterStatus} materials to review`
                  : 'Try adjusting your search or filters'}
              </p>
              {['admin', 'teacher'].includes(user?.role) && tab === 'browse' && (
                <button onClick={() => setTab('upload')} className="btn-primary mt-4 mx-auto">
                  <Upload size={14} /> Upload First Material
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {materials.map((m) => (
                <MaterialCard
                  key={m._id}
                  m={m}
                  role={user?.role}
                  progress={progressMap[m._id]}
                  onDownload={downloadWithAuth}
                  onApprove={handleApprove}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                  onMarkComplete={handleMarkComplete}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    page === p ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-gray-100 text-gray-600'
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
