import { useEffect, useState, useCallback } from 'react';
import {
  BookOpen, Plus, Search, Filter, Users, Clock, Award,
  ChevronRight, Edit2, Trash2, Archive, Eye, CheckCircle,
  X, GraduationCap, Layers, FileText, PlayCircle, Link2,
  ChevronDown, ChevronUp, MoreVertical, UserPlus, Settings,
  FolderPlus, Play, Globe, Lock, RefreshCw, BarChart3,
  Download, ExternalLink, CheckCircle2, Circle, Loader2,
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

/* ─── Constants ─── */
const LEVEL_META = {
  beginner:     { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Beginner' },
  intermediate: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Intermediate' },
  advanced:     { color: 'bg-purple-100 text-purple-700 border-purple-200', label: 'Advanced' },
};

const STATUS_META = {
  draft:     { color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Draft', icon: Lock },
  published: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Published', icon: Globe },
  archived:  { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Archived', icon: Archive },
<<<<<<< HEAD
  deleted:   { color: 'bg-red-100 text-red-700 border-red-200', label: 'Deleted', icon: Trash2 },
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
};

const TABS = [
  { id: 'browse', label: 'Browse Courses', icon: BookOpen, roles: ['admin', 'teacher', 'student'] },
  { id: 'my', label: 'My Courses', icon: GraduationCap, roles: ['admin', 'teacher', 'student'] },
  { id: 'create', label: 'Create Course', icon: Plus, roles: ['admin', 'teacher'] },
];

/* ─── Course Card ─── */
const CourseCard = ({ course, role, onView, onEdit, onEnroll, onPublish, onArchive, onDelete }) => {
  const statusMeta = STATUS_META[course.status] || STATUS_META.draft;
  const levelMeta = LEVEL_META[course.level] || LEVEL_META.beginner;
  const StatusIcon = statusMeta.icon;

  return (
    <div className="card-hover group flex flex-col">
      {/* Thumbnail / Gradient */}
      <div className={`h-28 rounded-xl mb-4 bg-gradient-to-br from-primary-500 to-violet-600 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <span className="text-white text-xs font-bold bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg">
            {course.code}
          </span>
          <span className={`badge border text-xs ${statusMeta.color}`}>
            <StatusIcon size={10} /> {statusMeta.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-primary-700 transition-colors">
        {course.title}
      </h3>

      {course.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`badge border text-xs ${levelMeta.color}`}>{levelMeta.label}</span>
        {course.category && (
          <span className="badge bg-gray-100 text-gray-600 text-xs">{course.category}</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Layers size={11} />
          <span>{course.moduleCount || 0} modules</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={11} />
          <span>{course.enrolledCount || 0} enrolled</span>
        </div>
        {course.duration && (
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{course.duration}</span>
          </div>
        )}
      </div>

      {/* Instructor */}
      <div className="text-xs text-gray-500 mb-4">
        By <span className="font-medium text-gray-700">{course.createdBy?.name || 'Unknown'}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 mt-auto">
        <button onClick={() => onView(course)} className="btn-primary flex-1 justify-center py-2 text-xs">
          <Eye size={12} /> View
        </button>

        {role === 'student' && course.status === 'published' && !course.isEnrolled && (
          <button onClick={() => onEnroll(course._id)} className="btn-primary flex-1 justify-center py-2 text-xs bg-emerald-600 hover:bg-emerald-700">
            <UserPlus size={12} /> Enroll
          </button>
        )}

        {role === 'student' && course.isEnrolled && (
          <span className="badge bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs py-2 px-3">
            <CheckCircle size={10} /> Enrolled
          </span>
        )}

        {['admin', 'teacher'].includes(role) && (
          <>
            <button onClick={() => onEdit(course)} className="btn-secondary py-2 text-xs">
              <Edit2 size={12} />
            </button>
            {course.status === 'draft' && (
              <button onClick={() => onPublish(course._id)} className="btn-secondary py-2 text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                <Globe size={12} />
              </button>
            )}
<<<<<<< HEAD
            {['admin', 'teacher'].includes(role) && (
              <button onClick={() => onDelete(course._id)} className="btn-secondary py-2 text-xs text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 size={12} /> Delete
=======
            {role === 'admin' && (
              <button onClick={() => onDelete(course._id)} className="btn-secondary py-2 text-xs text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 size={12} />
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Course Form ─── */
const CourseForm = ({ course, onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    title: course?.title || '',
    code: course?.code || '',
    description: course?.description || '',
    category: course?.category || '',
    level: course?.level || 'beginner',
    duration: course?.duration || '',
    credits: course?.credits || '',
    academicYear: course?.academicYear || new Date().getFullYear().toString(),
    semester: course?.semester || '',
    tags: course?.tags?.join(', ') || '',
    maxStudents: course?.maxStudents || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (course?._id) {
        await api.put(`/courses/${course._id}`, form);
      } else {
        await api.post('/courses', form);
      }
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="max-w-2xl">
      <div className="card space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {course ? 'Edit Course' : 'Create New Course'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {course ? 'Update course details' : 'Set up a new course with modules and materials'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <X size={14} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Course Title *</label>
              <input className="input" placeholder="e.g. Introduction to Database Systems" value={form.title} onChange={set('title')} required />
            </div>

            <div>
              <label className="label">Course Code *</label>
              <input className="input uppercase" placeholder="e.g. CS101" value={form.code} onChange={set('code')} required />
            </div>

            <div>
              <label className="label">Category</label>
              <input className="input" placeholder="e.g. Computer Science" value={form.category} onChange={set('category')} />
            </div>

            <div>
              <label className="label">Level</label>
              <select className="input" value={form.level} onChange={set('level')}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="label">Duration</label>
              <input className="input" placeholder="e.g. 12 weeks" value={form.duration} onChange={set('duration')} />
            </div>

            <div>
              <label className="label">Credits</label>
<<<<<<< HEAD
              <input className="input" type="number" min="0" placeholder="e.g. 3" value={form.credits} onChange={set('credits')} onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }} />
=======
              <input className="input" type="number" min="0" placeholder="e.g. 3" value={form.credits} onChange={set('credits')} />
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
            </div>

            <div>
              <label className="label">Max Students (0 = unlimited)</label>
<<<<<<< HEAD
              <input className="input" type="number" min="0" placeholder="e.g. 50" value={form.maxStudents} onChange={set('maxStudents')} onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }} />
=======
              <input className="input" type="number" min="0" placeholder="e.g. 50" value={form.maxStudents} onChange={set('maxStudents')} />
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
            </div>

            <div>
              <label className="label">Academic Year</label>
<<<<<<< HEAD
              <input className="input" type="number" min="1900" max="2100" placeholder="e.g. 2025" value={form.academicYear} onChange={set('academicYear')} onKeyDown={(e) => { if (!/[0-9]/.test(e.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', 'Enter'].includes(e.key)) e.preventDefault(); }} />
=======
              <input className="input" placeholder="e.g. 2025" value={form.academicYear} onChange={set('academicYear')} />
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
            </div>

            <div>
              <label className="label">Semester</label>
              <input className="input" placeholder="e.g. Fall 2025" value={form.semester} onChange={set('semester')} />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Tags (comma-separated)</label>
              <input className="input" placeholder="database, sql, programming" value={form.tags} onChange={set('tags')} />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={3} placeholder="Brief description of the course..." value={form.description} onChange={set('description')} />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn-secondary">
                <X size={14} /> Cancel
              </button>
            )}
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3 text-base font-semibold">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <>{course ? <CheckCircle size={16} /> : <Plus size={16} />} {course ? 'Update Course' : 'Create Course'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Course Detail View ─── */
const CourseDetail = ({ course, onBack, onRefresh, role }) => {
  const [activeModule, setActiveModule] = useState(null);
  const [showAddModule, setShowAddModule] = useState(false);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [showMaterialPicker, setShowMaterialPicker] = useState(null);
  const [progressMap, setProgressMap] = useState({}); // { materialId: { status, completedAt, ... } }
  const [loadingMaterial, setLoadingMaterial] = useState(null);

  useEffect(() => {
    // Fetch available materials for adding to modules (admin/teacher)
    if (['admin', 'teacher'].includes(role)) {
      api.get('/materials?status=approved&limit=100').then(r => setMaterials(r.data.materials));
    }
  }, [role]);

  // Fetch student's progress for materials in THIS course only
  useEffect(() => {
    if (role === 'student' && course._id) {
      api.get(`/progress/my?courseId=${course._id}`).then(r => {
        const map = {};
        // API returns { success, data: { progress: [...] } }
        const progressList = r.data.data?.progress || r.data.progress || [];
        progressList.forEach(p => {
          map[p.material?._id || p.material] = p;
        });
        setProgressMap(map);
      }).catch(() => {});
    }
  }, [role, course._id]);

  // Handle material click - open/download and track progress
  const handleMaterialClick = async (material) => {
    if (role !== 'student') return;

    setLoadingMaterial(material._id);
    try {
      // Start progress tracking WITH courseId
      await api.post(`/progress/start/${material._id}`, { courseId: course._id });

      // Open the material based on type
      if (material.contentType === 'youtube' && material.youtubeUrl) {
        window.open(material.youtubeUrl, '_blank');
      } else if (material.contentType === 'link' && material.externalUrl) {
        window.open(material.externalUrl, '_blank');
      } else if (material.fileUrl) {
        // Download file
        window.open(`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${material.fileUrl}`, '_blank');
      }

      // Refresh progress for THIS course
      const r = await api.get(`/progress/my?courseId=${course._id}`);
      const map = {};
      const progressList = r.data.data?.progress || r.data.progress || [];
      progressList.forEach(p => {
        map[p.material?._id || p.material] = p;
      });
      setProgressMap(map);
    } catch (err) {
      console.error('Failed to track progress:', err);
    } finally {
      setLoadingMaterial(null);
    }
  };

  // Mark material as complete (for THIS course)
  const handleMarkComplete = async (e, materialId) => {
    e.stopPropagation();
    try {
      await api.put(`/progress/complete/${materialId}`, { courseId: course._id });
      // Refresh progress for THIS course
      const r = await api.get(`/progress/my?courseId=${course._id}`);
      const map = {};
      const progressList = r.data.data?.progress || r.data.progress || [];
      progressList.forEach(p => {
        map[p.material?._id || p.material] = p;
      });
      setProgressMap(map);
    } catch (err) {
      alert('Failed to mark as complete');
    }
  };

  // Unmark complete (for THIS course)
  const handleUnmarkComplete = async (e, materialId) => {
    e.stopPropagation();
    try {
      await api.put(`/progress/uncomplete/${materialId}`, { courseId: course._id });
      const r = await api.get(`/progress/my?courseId=${course._id}`);
      const map = {};
      const progressList = r.data.data?.progress || r.data.progress || [];
      progressList.forEach(p => {
        map[p.material?._id || p.material] = p;
      });
      setProgressMap(map);
    } catch (err) {
      alert('Failed to unmark');
    }
  };

  // Calculate course progress for student
  const calculateCourseProgress = () => {
    const allMaterials = course.modules?.flatMap(m => m.materials || []) || [];
    const completed = allMaterials.filter(m => progressMap[m._id]?.status === 'completed').length;
    return allMaterials.length > 0 ? Math.round((completed / allMaterials.length) * 100) : 0;
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/courses/${course._id}/modules`, moduleForm);
      setModuleForm({ title: '', description: '' });
      setShowAddModule(false);
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add module');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Delete this module?')) return;
    try {
      await api.delete(`/courses/${course._id}/modules/${moduleId}`);
      onRefresh?.();
    } catch (err) {
      alert('Failed to delete module');
    }
  };

  const handleAddMaterial = async (moduleId, materialId) => {
    try {
      await api.post(`/courses/${course._id}/modules/${moduleId}/materials`, { materialId });
      setShowMaterialPicker(null);
      onRefresh?.();
    } catch (err) {
      alert('Failed to add material');
    }
  };

  const handleRemoveMaterial = async (moduleId, materialId) => {
    try {
      await api.delete(`/courses/${course._id}/modules/${moduleId}/materials/${materialId}`);
      onRefresh?.();
    } catch (err) {
      alert('Failed to remove material');
    }
  };

  const handlePublishModule = async (moduleId, isPublished) => {
    try {
      await api.put(`/courses/${course._id}/modules/${moduleId}`, { isPublished });
      onRefresh?.();
    } catch (err) {
      alert('Failed to update module');
    }
  };

  const statusMeta = STATUS_META[course.status] || STATUS_META.draft;
  const StatusIcon = statusMeta.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={onBack} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-2">
            <ChevronRight size={14} className="rotate-180" /> Back to courses
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg">
              {course.code}
            </span>
            <span className={`badge border text-xs ${statusMeta.color}`}>
              <StatusIcon size={10} /> {statusMeta.label}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
          {course.description && (
            <p className="text-gray-500 mt-2 max-w-2xl">{course.description}</p>
          )}
        </div>
        <button onClick={onRefresh} className="btn-secondary">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Student Progress Overview */}
      {role === 'student' && (
        <div className="card bg-gradient-to-r from-primary-50 to-violet-50 border-primary-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-900">Your Progress</h3>
            <span className="text-2xl font-black text-primary-600">{calculateCourseProgress()}%</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${calculateCourseProgress()}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
            <span>
              {course.modules?.flatMap(m => m.materials || []).filter(m => progressMap[m._id]?.status === 'completed').length || 0} of{' '}
              {course.modules?.reduce((sum, m) => sum + (m.materials?.length || 0), 0) || 0} materials completed
            </span>
            {calculateCourseProgress() === 100 && (
              <span className="badge bg-emerald-100 text-emerald-700 border border-emerald-200">
                <CheckCircle size={12} /> Course Completed!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card py-4 text-center">
          <Layers size={20} className="text-primary-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{course.modules?.length || 0}</p>
          <p className="text-xs text-gray-500">Modules</p>
        </div>
        <div className="card py-4 text-center">
          <Users size={20} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{course.enrolledStudents?.filter(e => e.status === 'active').length || 0}</p>
          <p className="text-xs text-gray-500">Students</p>
        </div>
        <div className="card py-4 text-center">
          <FileText size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">
            {course.modules?.reduce((sum, m) => sum + (m.materials?.length || 0), 0) || 0}
          </p>
          <p className="text-xs text-gray-500">Materials</p>
        </div>
        <div className="card py-4 text-center">
          <Award size={20} className="text-purple-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900">{course.credits || 0}</p>
          <p className="text-xs text-gray-500">Credits</p>
        </div>
      </div>

      {/* Modules Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Course Modules</h2>
          {['admin', 'teacher'].includes(role) && (
            <button onClick={() => setShowAddModule(true)} className="btn-primary text-sm">
              <FolderPlus size={14} /> Add Module
            </button>
          )}
        </div>

        {/* Add Module Form */}
        {showAddModule && (
          <form onSubmit={handleAddModule} className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
            <input
              className="input"
              placeholder="Module title (e.g. Week 1: Introduction)"
              value={moduleForm.title}
              onChange={(e) => setModuleForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Module description (optional)"
              value={moduleForm.description}
              onChange={(e) => setModuleForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddModule(false)} className="btn-secondary text-sm">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary text-sm">
                {loading ? 'Adding...' : 'Add Module'}
              </button>
            </div>
          </form>
        )}

        {/* Modules List */}
        {course.modules?.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Layers size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No modules yet</p>
            <p className="text-sm">Add modules to organize your course content</p>
          </div>
        ) : (
          <div className="space-y-3">
            {course.modules?.sort((a, b) => a.order - b.order).map((module, idx) => (
              <div key={module._id} className="border border-gray-100 rounded-xl overflow-hidden">
                {/* Module Header */}
                <div
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    activeModule === module._id ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveModule(activeModule === module._id ? null : module._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{module.title}</h3>
                      <p className="text-xs text-gray-400">
                        {module.materials?.length || 0} materials
                        {!module.isPublished && <span className="ml-2 text-orange-500">(Hidden)</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {['admin', 'teacher'].includes(role) && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePublishModule(module._id, !module.isPublished); }}
                          className={`p-1.5 rounded-lg text-xs ${module.isPublished ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 bg-gray-100'}`}
                          title={module.isPublished ? 'Published' : 'Hidden'}
                        >
                          {module.isPublished ? <Eye size={14} /> : <Lock size={14} />}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteModule(module._id); }}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                    {activeModule === module._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Module Content */}
                {activeModule === module._id && (
                  <div className="border-t border-gray-100 p-4 bg-white space-y-3">
                    {module.description && (
                      <p className="text-sm text-gray-500 mb-3">{module.description}</p>
                    )}

                    {/* Materials in Module */}
                    {module.materials?.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">No materials in this module</p>
                    ) : (
                      <div className="space-y-2">
                        {module.materials?.map((material) => {
                          const progress = progressMap[material._id];
                          const isCompleted = progress?.status === 'completed';
                          const isInProgress = progress?.status === 'in_progress';
                          const isLoading = loadingMaterial === material._id;

                          return (
                            <div
                              key={material._id}
                              onClick={() => role === 'student' && handleMaterialClick(material)}
                              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                role === 'student'
                                  ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] ' + (isCompleted ? 'bg-emerald-50 border border-emerald-200' : isInProgress ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100')
                                  : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Progress indicator for students */}
                                {role === 'student' && (
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    isCompleted ? 'bg-emerald-500 text-white' : isInProgress ? 'bg-blue-500 text-white' : 'bg-gray-200'
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle2 size={14} />
                                    ) : isInProgress ? (
                                      <Circle size={14} className="fill-current" />
                                    ) : (
                                      <Circle size={14} />
                                    )}
                                  </div>
                                )}
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                                  {material.contentType === 'youtube' ? (
                                    <PlayCircle size={14} className="text-red-500" />
                                  ) : material.contentType === 'link' ? (
                                    <Link2 size={14} className="text-indigo-500" />
                                  ) : (
                                    <FileText size={14} className="text-gray-500" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{material.title}</p>
                                  <p className="text-xs text-gray-400">
                                    {material.fileType || material.contentType}
                                    {isCompleted && progress.completedAt && (
                                      <span className="ml-2 text-emerald-600">
                                        Completed {new Date(progress.completedAt).toLocaleDateString()}
                                      </span>
                                    )}
                                    {progress?.totalTimeSpent > 0 && (
                                      <span className="ml-2 text-blue-500">
                                        {Math.round(progress.totalTimeSpent / 60)}m spent
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Student actions */}
                                {role === 'student' && (
                                  <>
                                    {isLoading && (
                                      <Loader2 size={16} className="animate-spin text-primary-500" />
                                    )}
                                    {!isLoading && (
                                      <>
                                        {/* Open/View button */}
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleMaterialClick(material); }}
                                          className="p-1.5 rounded-lg bg-primary-100 text-primary-600 hover:bg-primary-200"
                                          title="Open"
                                        >
                                          {material.contentType === 'youtube' ? (
                                            <Play size={14} />
                                          ) : material.contentType === 'link' ? (
                                            <ExternalLink size={14} />
                                          ) : (
                                            <Download size={14} />
                                          )}
                                        </button>
                                        {/* Mark complete toggle */}
                                        {isCompleted ? (
                                          <button
                                            onClick={(e) => handleUnmarkComplete(e, material._id)}
                                            className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                            title="Mark incomplete"
                                          >
                                            <CheckCircle size={14} />
                                          </button>
                                        ) : (
                                          <button
                                            onClick={(e) => handleMarkComplete(e, material._id)}
                                            className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600"
                                            title="Mark as complete"
                                          >
                                            <CheckCircle size={14} />
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}

                                {/* Admin/Teacher remove button */}
                                {['admin', 'teacher'].includes(role) && (
                                  <button
                                    onClick={() => handleRemoveMaterial(module._id, material._id)}
                                    className="text-red-400 hover:text-red-600 p-1"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Material Button */}
                    {['admin', 'teacher'].includes(role) && (
                      <div>
                        {showMaterialPicker === module._id ? (
                          <div className="bg-gray-100 rounded-xl p-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Select material to add:</p>
                            <div className="max-h-48 overflow-y-auto space-y-1">
                              {materials.filter(m => !module.materials?.some(mm => mm._id === m._id)).map((m) => (
                                <button
                                  key={m._id}
                                  onClick={() => handleAddMaterial(module._id, m._id)}
                                  className="w-full text-left p-2 hover:bg-white rounded-lg text-sm flex items-center gap-2"
                                >
                                  <FileText size={12} className="text-gray-400" />
                                  <span className="truncate">{m.title}</span>
                                </button>
                              ))}
                              {materials.filter(m => !module.materials?.some(mm => mm._id === m._id)).length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-2">No available materials</p>
                              )}
                            </div>
                            <button
                              onClick={() => setShowMaterialPicker(null)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowMaterialPicker(module._id)}
                            className="btn-secondary w-full justify-center text-sm py-2"
                          >
                            <Plus size={14} /> Add Material
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enrolled Students (for admin/teacher) */}
      {['admin', 'teacher'].includes(role) && course.enrolledStudents?.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Enrolled Students</h2>
          <div className="space-y-2">
            {course.enrolledStudents.filter(e => e.status === 'active').map((enrollment) => (
              <div key={enrollment.student._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                    {enrollment.student.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{enrollment.student.name}</p>
                    <p className="text-xs text-gray-400">{enrollment.student.email}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Page ─── */
export default function CoursesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('browse');
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const visibleTabs = TABS.filter((t) => t.roles.includes(user?.role));

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.append('search', search);
      if (filterCategory) params.append('category', filterCategory);
      if (filterLevel) params.append('level', filterLevel);
      if (filterStatus) params.append('status', filterStatus);

      const { data } = await api.get(`/courses?${params}`);
      setCourses(data.courses);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterLevel, filterStatus, page]);

  const fetchMyCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/courses/my');
      setMyCourses(data.courses);
    } catch (err) {
      console.error('Failed to fetch my courses:', err);
    }
  }, []);

  const fetchCourseDetail = async (id) => {
    try {
      const { data } = await api.get(`/courses/${id}`);
      setSelectedCourse(data.course);
    } catch (err) {
      alert('Failed to load course');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (tab === 'my') fetchMyCourses();
  }, [tab, fetchMyCourses]);

  useEffect(() => {
    if (['admin', 'teacher'].includes(user?.role)) {
      api.get('/courses/stats').then((r) => setStats(r.data.stats));
    }
  }, [user]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      showSuccess('Enrolled successfully!');
      fetchCourses();
      fetchMyCourses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll');
    }
  };

  const handlePublish = async (courseId) => {
    try {
      await api.put(`/courses/${courseId}/publish`);
      showSuccess('Course published!');
      fetchCourses();
      if (stats) api.get('/courses/stats').then((r) => setStats(r.data.stats));
    } catch (err) {
      alert('Failed to publish');
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      showSuccess('Course deleted');
      fetchCourses();
      if (stats) api.get('/courses/stats').then((r) => setStats(r.data.stats));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // If viewing course detail
  if (selectedCourse) {
    return (
      <div className="max-w-5xl">
        <CourseDetail
          course={selectedCourse}
          role={user?.role}
          onBack={() => setSelectedCourse(null)}
          onRefresh={() => fetchCourseDetail(selectedCourse._id)}
        />
      </div>
    );
  }

  // If editing/creating course
  if (editingCourse !== null || tab === 'create') {
    return (
      <CourseForm
        course={editingCourse}
        onCancel={() => { setEditingCourse(null); setTab('browse'); }}
        onSuccess={() => {
          setEditingCourse(null);
          setTab('browse');
          fetchCourses();
          if (stats) api.get('/courses/stats').then((r) => setStats(r.data.stats));
          showSuccess(editingCourse ? 'Course updated!' : 'Course created!');
        }}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Create and manage courses with modules and materials</p>
        </div>
        <button onClick={fetchCourses} className="btn-secondary">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 animate-slide-up">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Stats — admin/teacher only */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="stat-card flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-violet-600">
              <BookOpen size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Courses</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
              <Globe size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{stats.published}</p>
              <p className="text-xs text-gray-500">Published</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-gray-400 to-gray-600">
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{stats.draft}</p>
              <p className="text-xs text-gray-500">Drafts</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3 py-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{stats.totalEnrollments}</p>
              <p className="text-xs text-gray-500">Enrollments</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
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

      {/* Browse / My Courses */}
      {(tab === 'browse' || tab === 'my') && (
        <div className="space-y-4">
          {/* Search & Filters (only for browse) */}
          {tab === 'browse' && (
            <div className="card py-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-52">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input pl-10"
                    placeholder="Search courses..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
                <input
                  className="input w-40"
                  placeholder="Category..."
                  value={filterCategory}
                  onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                />
                <select
                  className="input w-36"
                  value={filterLevel}
                  onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                {['admin', 'teacher'].includes(user?.role) && (
                  <select
                    className="input w-36"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
<<<<<<< HEAD
                    <option value="deleted">Deleted</option>
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Course Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading courses...</p>
              </div>
            </div>
          ) : (tab === 'my' ? myCourses : courses).length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">No courses found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {tab === 'my' ? "You haven't enrolled in any courses yet" : 'Try adjusting your search or filters'}
              </p>
              {['admin', 'teacher'].includes(user?.role) && tab !== 'my' && (
                <button onClick={() => setTab('create')} className="btn-primary mt-4 mx-auto">
                  <Plus size={14} /> Create First Course
                </button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(tab === 'my' ? myCourses : courses).map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  role={user?.role}
                  onView={() => fetchCourseDetail(course._id)}
                  onEdit={() => setEditingCourse(course)}
                  onEnroll={handleEnroll}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination (only for browse) */}
          {tab === 'browse' && pages > 1 && (
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
