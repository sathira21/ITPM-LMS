import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import api from '../../utils/api';

const GRADES = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

const defaultSubject = () => ({ subject: '', score: '', maxScore: 100, grade: 'B', remarks: '' });

export default function ReportForm() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    studentId: '', title: '', period: '', academicYear: new Date().getFullYear().toString(),
    overallGrade: 'B', gpa: '', teacherRemarks: '',
    grades: [defaultSubject()],
    attendance: { totalDays: 180, presentDays: 0, percentage: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/users?role=student&limit=100').then((r) => setStudents(r.data.users));
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const setSubject = (i, field) => (e) => {
    const grades = [...form.grades];
    grades[i] = { ...grades[i], [field]: e.target.value };
    setForm((f) => ({ ...f, grades }));
  };

  const addSubject = () => setForm((f) => ({ ...f, grades: [...f.grades, defaultSubject()] }));
  const removeSubject = (i) => setForm((f) => ({ ...f, grades: f.grades.filter((_, idx) => idx !== i) }));

  const setAttendance = (field) => (e) => {
    const att = { ...form.attendance, [field]: Number(e.target.value) };
    if (att.totalDays > 0) att.percentage = Math.round((att.presentDays / att.totalDays) * 100);
    setForm((f) => ({ ...f, attendance: att }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, gpa: Number(form.gpa) || 0 };
      await api.post('/reports', payload);
      navigate('/dashboard/reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/dashboard/reports')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Academic Report</h1>
          <p className="text-gray-500 text-sm">Generate a new student performance report</p>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800">Report Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Student *</label>
              <select className="input" value={form.studentId} onChange={set('studentId')} required>
                <option value="">Select student...</option>
                {students.map((s) => <option key={s._id} value={s._id}>{s.name} — {s.studentId || s.grade}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Report Title *</label>
              <input className="input" placeholder="Term 1 Academic Report 2025" value={form.title} onChange={set('title')} required />
            </div>
            <div>
              <label className="label">Period</label>
              <input className="input" placeholder="Term 1 2025" value={form.period} onChange={set('period')} />
            </div>
            <div>
              <label className="label">Academic Year</label>
              <input className="input" placeholder="2025" value={form.academicYear} onChange={set('academicYear')} />
            </div>
            <div>
              <label className="label">Overall Grade</label>
              <select className="input" value={form.overallGrade} onChange={set('overallGrade')}>
                {GRADES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="label">GPA</label>
              <input className="input" type="number" step="0.01" min="0" max="4" placeholder="3.50" value={form.gpa} onChange={set('gpa')} />
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Subject Grades</h3>
            <button type="button" onClick={addSubject} className="btn-secondary py-1.5 text-xs">
              <Plus size={13} /> Add Subject
            </button>
          </div>
          <div className="space-y-3">
            {form.grades.map((g, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-end bg-gray-50 p-3 rounded-xl">
                <div className="col-span-2">
                  {i === 0 && <label className="label text-xs">Subject</label>}
                  <input className="input text-sm" placeholder="Mathematics" value={g.subject} onChange={setSubject(i, 'subject')} required />
                </div>
                <div>
                  {i === 0 && <label className="label text-xs">Score</label>}
                  <input className="input text-sm" type="number" min="0" placeholder="85" value={g.score} onChange={setSubject(i, 'score')} required />
                </div>
                <div>
                  {i === 0 && <label className="label text-xs">Grade</label>}
                  <select className="input text-sm" value={g.grade} onChange={setSubject(i, 'grade')}>
                    {GRADES.map((gr) => <option key={gr}>{gr}</option>)}
                  </select>
                </div>
                <div className="flex justify-end">
                  {form.grades.length > 1 && (
                    <button type="button" onClick={() => removeSubject(i)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors mt-5">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-800">Attendance Record</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Total Days</label>
              <input className="input" type="number" value={form.attendance.totalDays} onChange={setAttendance('totalDays')} />
            </div>
            <div>
              <label className="label">Present Days</label>
              <input className="input" type="number" value={form.attendance.presentDays} onChange={setAttendance('presentDays')} />
            </div>
            <div>
              <label className="label">Percentage</label>
              <div className="input bg-gray-50 text-gray-700 font-semibold">{form.attendance.percentage}%</div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="card">
          <label className="label text-base font-semibold text-gray-800">Teacher Remarks</label>
          <textarea
            className="input mt-2 resize-none"
            rows={3}
            placeholder="Overall performance assessment and recommendations..."
            value={form.teacherRemarks}
            onChange={set('teacherRemarks')}
          />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard/reports')} className="btn-secondary flex-1 justify-center py-2.5">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-2.5">
            {loading ? 'Creating...' : <><Save size={15} /> Create Report</>}
          </button>
        </div>
      </form>
    </div>
  );
}
