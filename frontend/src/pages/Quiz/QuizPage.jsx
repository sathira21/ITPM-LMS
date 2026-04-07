import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen, Plus, Search, Filter, Clock, CheckCircle2, XCircle,
  BarChart3, Users, Trophy, AlertTriangle, ChevronRight, Eye,
  Pencil, Trash2, Globe, Lock, Play, RotateCcw, Target, Zap,
  ArrowLeft, Check, X, Star, TrendingUp, Award, BookMarked,
  ChevronDown, Loader2, ClipboardList,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TYPE_LABELS = { mcq: 'MCQ', true_false: 'True / False', short_answer: 'Short Answer' };
const TYPE_COLORS = { mcq: 'bg-blue-100 text-blue-700', true_false: 'bg-purple-100 text-purple-700', short_answer: 'bg-amber-100 text-amber-700' };

function fmt(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Star display ─────────────────────────────────────────────────────────────
function ScoreBadge({ pct }) {
  const color = pct >= 85 ? 'text-emerald-600 bg-emerald-50' : pct >= 60 ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50';
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{pct}%</span>;
}

// ─── Quiz Card ────────────────────────────────────────────────────────────────
<<<<<<< HEAD
<<<<<<< HEAD
function QuizCard({ quiz, onTake, onEdit, onDelete, onPublish, isTeacher }) {
=======
function QuizCard({ quiz, onTake, onEdit, onDelete, onPublish, onPreview, isTeacher }) {
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
function QuizCard({ quiz, onTake, onEdit, onDelete, onPublish, onPreview, isTeacher }) {
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
  const canEdit = isTeacher;
  const attempted = quiz.attemptCount > 0;
  const canRetake = quiz.allowRetake && (quiz.maxAttempts === 0 || quiz.attemptCount < quiz.maxAttempts);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* Gradient accent top */}
      <div className={`h-1.5 bg-gradient-to-r ${quiz.isPublished !== false ? 'from-primary-500 to-purple-500' : 'from-amber-400 to-orange-400'}`} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm leading-snug truncate group-hover:text-primary-700 transition-colors">{quiz.title}</h3>
            {(quiz.subject || quiz.module) && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{[quiz.subject, quiz.module].filter(Boolean).join(' · ')}</p>
            )}
          </div>
          {canEdit && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
<<<<<<< HEAD
<<<<<<< HEAD
              <button onClick={(e) => { e.stopPropagation(); onEdit(quiz); }} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors">
                <Pencil size={12} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(quiz._id); }} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors">
=======
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
              <button onClick={(e) => { e.stopPropagation(); onPreview(quiz); }} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-emerald-100 flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-colors" title="Preview">
                <Eye size={12} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onEdit(quiz); }} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors" title="Edit">
                <Pencil size={12} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(quiz._id); }} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors" title="Delete">
<<<<<<< HEAD
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg font-medium">
            <ClipboardList size={10} className="text-gray-400" />{quiz.questions?.length || 0} Qs
          </span>
          {quiz.timeLimit > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg font-medium">
              <Clock size={10} />{quiz.timeLimit}m
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg font-medium">
            <Target size={10} />Pass: {quiz.passingScore}%
          </span>
          {isTeacher && (
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium border ${quiz.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
              {quiz.isPublished ? <Globe size={10} /> : <Lock size={10} />}
              {quiz.isPublished ? 'Published' : 'Draft'}
            </span>
          )}
        </div>

        {/* Attempt info (students) */}
        {!isTeacher && attempted && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-xl p-3 border border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Trophy size={14} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <span className="text-xs text-gray-600 font-medium">Best: <ScoreBadge pct={quiz.bestScore} /></span>
            </div>
            <span className="text-xs text-gray-400 font-medium">{quiz.attemptCount} attempt{quiz.attemptCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          {isTeacher ? (
            <>
              <button onClick={() => onPublish(quiz._id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${quiz.isPublished ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'}`}>
                {quiz.isPublished ? <Lock size={12} /> : <Globe size={12} />}
                {quiz.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => onEdit(quiz)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all border border-primary-100">
                <Pencil size={12} /> Edit
              </button>
            </>
          ) : attempted && !canRetake ? (
            <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100">
              <CheckCircle2 size={12} /> Completed
            </div>
          ) : (
            <button onClick={() => onTake(quiz)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${attempted ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100' : 'bg-gradient-to-r from-primary-500 to-purple-600 text-white hover:shadow-lg shadow-primary-500/20'}`}>
              {attempted ? <><RotateCcw size={12} /> Retake</> : <><Play size={12} /> Start Quiz</>}
            </button>
          )}
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/[0.02] group-hover:to-purple-500/[0.04] transition-all duration-300 pointer-events-none" />
    </div>
  );
}

// ─── Quiz Taker ───────────────────────────────────────────────────────────────
function QuizTaker({ quiz, onClose, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit > 0 ? quiz.timeLimit * 60 : null);
  const startedAt = useRef(new Date());
  const timerRef = useRef(null);

  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleAnswer = (qId, val) => setAnswers(p => ({ ...p, [qId]: val }));

  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitting(true);
    const timeSpent = Math.round((new Date() - startedAt.current) / 1000);
    const ans = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    await onSubmit({ answers: ans, startedAt: startedAt.current, timeSpent });
  };

  const answered = Object.keys(answers).length;
  const total = quiz.questions.length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-2xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-t-3xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">{quiz.title}</h2>
              <p className="text-white/70 text-sm">{answered}/{total} answered</p>
            </div>
            {timeLeft !== null && (
              <div className={`flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5 font-mono font-bold ${timeLeft < 60 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                <Clock size={14} />{fmt(timeLeft)}
              </div>
            )}
          </div>
          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(answered / total) * 100}%` }} />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-b-3xl p-5 space-y-5 shadow-xl">
          {quiz.questions.map((q, idx) => (
            <div key={q._id || idx} className={`p-4 rounded-2xl border-2 transition-all ${answers[q._id] ? 'border-primary-200 bg-primary-50/30' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-start gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{q.question}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${TYPE_COLORS[q.type]}`}>{TYPE_LABELS[q.type]} · {q.points} pt{q.points !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {q.type === 'mcq' && (
                <div className="space-y-2 ml-9">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${answers[q._id] === String(oi) ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${answers[q._id] === String(oi) ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                        {answers[q._id] === String(oi) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <input type="radio" name={`q_${q._id}`} value={String(oi)} onChange={e => handleAnswer(q._id, e.target.value)} className="sr-only" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'true_false' && (
                <div className="flex gap-3 ml-9">
                  {['true', 'false'].map(val => (
                    <label key={val} className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl cursor-pointer transition-all border font-medium text-sm ${answers[q._id] === val ? (val === 'true' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-700') : 'border-gray-100 hover:border-gray-200 bg-white text-gray-600'}`}>
                      <input type="radio" name={`q_${q._id}`} value={val} onChange={e => handleAnswer(q._id, e.target.value)} className="sr-only" />
                      {val === 'true' ? <Check size={14} /> : <X size={14} />}
                      {val === 'true' ? 'True' : 'False'}
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'short_answer' && (
                <div className="ml-9">
                  <input
                    type="text"
                    placeholder="Type your answer…"
                    value={answers[q._id] || ''}
                    onChange={e => handleAnswer(q._id, e.target.value)}
                    className="input w-full text-sm"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-secondary px-5">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {submitting ? 'Grading…' : `Submit Quiz (${answered}/${total})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Results ─────────────────────────────────────────────────────────────
function QuizResults({ attempt, quiz, onClose, onRetake, canRetake }) {
  const { percentage, passed, score, totalPoints, timeSpent, answers } = attempt;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-2xl my-8">
        {/* Result header */}
        <div className={`rounded-t-3xl p-6 text-center text-white bg-gradient-to-br ${passed ? 'from-emerald-500 to-teal-600' : 'from-red-500 to-rose-600'}`}>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            {passed ? <Trophy size={32} /> : <Target size={32} />}
          </div>
          <h2 className="text-2xl font-black">{passed ? 'Passed!' : 'Not Passed'}</h2>
          <p className="text-4xl font-black mt-1">{percentage}%</p>
          <p className="text-white/80 text-sm mt-1">{score} / {totalPoints} points · {fmt(timeSpent)}</p>
        </div>

        <div className="bg-white rounded-b-3xl p-5 shadow-xl space-y-5">
          {/* Per-question review */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-3">Question Review</p>
            <div className="space-y-3">
              {quiz.questions.map((q, idx) => {
                const ans = answers[idx];
                const correct = ans?.isCorrect;
                return (
                  <div key={idx} className={`p-3 rounded-xl border ${correct ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${correct ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {correct ? <Check size={11} className="text-white" /> : <X size={11} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{q.question}</p>
                        <div className="mt-1.5 space-y-1">
                          <p className="text-xs text-gray-500">Your answer: <span className={`font-semibold ${correct ? 'text-emerald-700' : 'text-red-700'}`}>{ans?.answer || '(no answer)'}</span></p>
                          {!correct && q.correctAnswer && (
                            <p className="text-xs text-gray-500">Correct: <span className="font-semibold text-emerald-700">{q.type === 'mcq' ? q.options?.[Number(q.correctAnswer)] || q.correctAnswer : q.correctAnswer}</span></p>
                          )}
                          {q.explanation && <p className="text-xs text-gray-400 italic">{q.explanation}</p>}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-gray-500 flex-shrink-0">+{ans?.pointsEarned || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            {canRetake && (
              <button onClick={onRetake} className="btn-secondary flex items-center gap-2">
                <RotateCcw size={14} />Retake
              </button>
            )}
            <button onClick={onClose} className="btn-primary flex-1">Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
<<<<<<< HEAD
=======
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
// ─── Quiz Preview ─────────────────────────────────────────────────────────────
function QuizPreview({ quiz, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-2xl my-8">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-t-3xl p-5 text-white flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">{quiz.title} <span className="text-white/80 text-sm font-medium ml-2 border border-white/20 bg-white/10 px-2 py-0.5 rounded-md">Preview</span></h2>
            <p className="text-white/70 text-sm mt-1">
              {[quiz.subject, quiz.module].filter(Boolean).join(' · ')} | {quiz.questions?.length || 0} Questions
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>
        
        <div className="bg-white rounded-b-3xl p-5 space-y-5 shadow-xl">
          {quiz.questions?.map((q, idx) => (
            <div key={q._id || idx} className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50">
              <div className="flex items-start gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{q.question}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${TYPE_COLORS[q.type]}`}>{TYPE_LABELS[q.type]} · {q.points} pt{q.points !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {q.type === 'mcq' && (
                <div className="space-y-2 ml-9">
                  {q.options.map((opt, oi) => {
                    const isCorrect = String(q.correctAnswer) === String(oi);
                    return (
                      <div key={oi} className={`flex items-center gap-3 p-2.5 rounded-xl border ${isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-gray-100 bg-white'}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isCorrect ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}>
                          {isCorrect && <Check size={10} className="text-white" />}
                        </div>
                        <span className={`text-sm ${isCorrect ? 'text-emerald-700 font-medium' : 'text-gray-700'}`}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === 'true_false' && (
                <div className="flex gap-3 ml-9">
                  {['true', 'false'].map(val => {
                    const isCorrect = String(q.correctAnswer) === val;
                    return (
                      <div key={val} className={`flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border font-medium text-sm ${isCorrect ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-600'}`}>
                        {val === 'true' ? <Check size={14} /> : <X size={14} />}
                        {val === 'true' ? 'True' : 'False'}
                      </div>
                    );
                  })}
                </div>
              )}

              {q.type === 'short_answer' && (
                <div className="ml-9 p-3 rounded-xl border border-emerald-200 bg-emerald-50">
                  <p className="text-xs text-emerald-600 font-bold mb-1">Correct Answer:</p>
                  <p className="text-sm text-emerald-800 font-medium">{q.correctAnswer}</p>
                </div>
              )}
              
              {q.explanation && (
                <div className="ml-9 mt-3 p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-sm text-blue-800">
                  <strong className="text-blue-600 text-xs uppercase tracking-wider block mb-1">Explanation</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2">
            <button onClick={onClose} className="btn-primary w-full py-3">Close Preview</button>
          </div>
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
// ─── Question Builder (inside Quiz Form) ──────────────────────────────────────
function QuestionRow({ q, idx, onChange, onRemove }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Question {idx + 1}</span>
        <button onClick={() => onRemove(idx)} className="w-6 h-6 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-colors">
          <X size={12} />
        </button>
      </div>

      {/* Type */}
      <div className="flex gap-2">
        {Object.entries(TYPE_LABELS).map(([val, label]) => (
          <button key={val} onClick={() => onChange(idx, 'type', val)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${q.type === val ? 'border-primary-400 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Question text */}
      <textarea
        value={q.question}
        onChange={e => onChange(idx, 'question', e.target.value)}
        placeholder="Enter question text…"
        rows={2}
        className="input w-full text-sm resize-none"
      />

      {/* Options (MCQ) */}
      {q.type === 'mcq' && (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-500 font-medium">Options (select correct one)</p>
          {(q.options || ['', '', '', '']).map((opt, oi) => (
            <div key={oi} className="flex gap-2 items-center">
              <button onClick={() => onChange(idx, 'correctAnswer', String(oi))}
<<<<<<< HEAD
<<<<<<< HEAD
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${q.correctAnswer === String(oi) ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-gray-400'}`}>
                {q.correctAnswer === String(oi) && <Check size={10} className="text-white mx-auto" />}
=======
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${String(q.correctAnswer) === String(oi) ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-gray-400'}`}>
                {String(q.correctAnswer) === String(oi) && <Check size={10} className="text-white mx-auto" />}
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${String(q.correctAnswer) === String(oi) ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 hover:border-gray-400'}`}>
                {String(q.correctAnswer) === String(oi) && <Check size={10} className="text-white mx-auto" />}
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
              </button>
              <input type="text" value={opt} onChange={e => { const opts = [...(q.options || ['', '', '', ''])]; opts[oi] = e.target.value; onChange(idx, 'options', opts); }}
                placeholder={`Option ${oi + 1}`} className="input flex-1 text-sm py-1.5" />
            </div>
          ))}
        </div>
      )}

      {/* True/False */}
      {q.type === 'true_false' && (
        <div className="flex gap-3">
          {['true', 'false'].map(val => (
            <button key={val} onClick={() => onChange(idx, 'correctAnswer', val)}
<<<<<<< HEAD
<<<<<<< HEAD
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${q.correctAnswer === val ? (val === 'true' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-700') : 'border-gray-200 bg-white text-gray-500'}`}>
=======
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${String(q.correctAnswer) === val ? (val === 'true' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-700') : 'border-gray-200 bg-white text-gray-500'}`}>
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${String(q.correctAnswer) === val ? (val === 'true' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-red-400 bg-red-50 text-red-700') : 'border-gray-200 bg-white text-gray-500'}`}>
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
              {val === 'true' ? '✓ True' : '✗ False'}
            </button>
          ))}
        </div>
      )}

      {/* Short Answer */}
      {q.type === 'short_answer' && (
        <input type="text" value={q.correctAnswer || ''} onChange={e => onChange(idx, 'correctAnswer', e.target.value)}
          placeholder="Correct answer (case-insensitive match)…" className="input w-full text-sm" />
      )}

      {/* Explanation + Points row */}
      <div className="flex gap-2">
        <input type="text" value={q.explanation || ''} onChange={e => onChange(idx, 'explanation', e.target.value)}
          placeholder="Explanation (optional)…" className="input flex-1 text-sm py-1.5" />
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500">Pts</span>
          <input type="number" min={1} max={10} value={q.points || 1} onChange={e => onChange(idx, 'points', Number(e.target.value))}
            className="input w-14 text-sm py-1.5 text-center" />
        </div>
      </div>
    </div>
  );
}

const emptyQuestion = () => ({ type: 'mcq', question: '', options: ['', '', '', ''], correctAnswer: '', explanation: '', points: 1 });

// ─── Quiz Form Modal ──────────────────────────────────────────────────────────
function QuizForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', subject: '', module: '',
<<<<<<< HEAD
<<<<<<< HEAD
    timeLimit: 0, passingScore: 60, allowRetake: true, maxAttempts: 3,
=======
    timeLimit: 30, passingScore: 60, allowRetake: true, maxAttempts: 3,
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
    timeLimit: 30, passingScore: 60, allowRetake: true, maxAttempts: 3,
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
    questions: [emptyQuestion()],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const changeQ = (idx, field, val) => {
    const qs = [...form.questions];
    qs[idx] = { ...qs[idx], [field]: val };
    setForm(p => ({ ...p, questions: qs }));
  };
  const addQ = () => setForm(p => ({ ...p, questions: [...p.questions, emptyQuestion()] }));
  const removeQ = (idx) => setForm(p => ({ ...p, questions: p.questions.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    if (!form.title.trim()) return setError('Quiz title is required');
<<<<<<< HEAD
<<<<<<< HEAD
    if (!form.questions.length) return setError('Add at least one question');
    for (const q of form.questions) {
      if (!q.question.trim()) return setError('All questions need text');
      if (!q.correctAnswer && q.type !== 'short_answer') return setError('Set correct answer for all questions');
=======
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
    if (!form.subject.trim()) return setError('Subject is required');
    if (!form.module.trim()) return setError('Module / Topic is required');
    if (form.timeLimit <= 0) return setError('Time limit must be greater than 0');
    if (!form.questions.length) return setError('Add at least one question');
    for (const q of form.questions) {
      if (!q.question.trim()) return setError('All questions need text');
      if (q.type === 'mcq') {
        const validOptions = (q.options || []).filter(o => o.trim() !== '');
        if (validOptions.length < 2) return setError('MCQ questions must have at least two valid options');
        if (q.correctAnswer !== '' && q.correctAnswer !== undefined && q.correctAnswer !== null) {
          const selectedOption = q.options[Number(q.correctAnswer)];
          if (!selectedOption || !selectedOption.trim()) return setError('The selected correct answer cannot be empty');
        }
      }
      if ((q.correctAnswer === '' || q.correctAnswer === undefined || q.correctAnswer === null) && q.type !== 'short_answer') {
        return setError('Set correct answer for all questions');
      }
<<<<<<< HEAD
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
    }
    setSaving(true); setError('');
    try { await onSave(form); }
    catch (e) { setError(e.response?.data?.message || 'Failed to save'); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
      <div className="w-full max-w-2xl my-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 p-5 text-white flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{initial ? 'Edit Quiz' : 'Create New Quiz'}</h2>
            <p className="text-white/70 text-sm">{form.questions.length} question{form.questions.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Basic info */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="label">Quiz Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="input w-full" placeholder="e.g. Chapter 3 – Algebra Quiz" />
            </div>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="input w-full resize-none text-sm" placeholder="Description (optional)" />
            <div className="grid grid-cols-2 gap-3">
              <div>
<<<<<<< HEAD
<<<<<<< HEAD
                <label className="label">Subject</label>
                <input value={form.subject} onChange={e => set('subject', e.target.value)} className="input w-full" placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="label">Module / Topic</label>
=======
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
                <label className="label">Subject *</label>
                <input value={form.subject} onChange={e => set('subject', e.target.value)} className="input w-full" placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="label">Module / Topic *</label>
<<<<<<< HEAD
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
                <input value={form.module} onChange={e => set('module', e.target.value)} className="input w-full" placeholder="e.g. Week 3 – Algebra" />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-2xl">
            <div>
              <label className="label">Time Limit (min)</label>
<<<<<<< HEAD
<<<<<<< HEAD
              <input type="number" min={0} value={form.timeLimit} onChange={e => set('timeLimit', Number(e.target.value))} className="input w-full text-sm" placeholder="0 = unlimited" />
=======
              <input type="number" min={1} value={form.timeLimit || ''} onChange={e => set('timeLimit', Number(e.target.value))} className="input w-full text-sm" placeholder="e.g. 30" />
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
              <input type="number" min={1} value={form.timeLimit || ''} onChange={e => set('timeLimit', Number(e.target.value))} className="input w-full text-sm" placeholder="e.g. 30" />
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
            </div>
            <div>
              <label className="label">Passing Score (%)</label>
              <input type="number" min={0} max={100} value={form.passingScore} onChange={e => set('passingScore', Number(e.target.value))} className="input w-full text-sm" />
            </div>
            <div>
              <label className="label">Max Attempts</label>
              <input type="number" min={1} value={form.maxAttempts} onChange={e => set('maxAttempts', Number(e.target.value))} className="input w-full text-sm" />
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700">Questions</p>
              <button onClick={addQ} className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-xl transition-colors">
                <Plus size={12} />Add Question
              </button>
            </div>
            <div className="space-y-3">
              {form.questions.map((q, i) => (
                <QuestionRow key={i} q={q} idx={i} onChange={changeQ} onRemove={removeQ} />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary px-5">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics View ───────────────────────────────────────────────────────────
function AnalyticsView({ quizId, quizTitle, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/quiz/${quizId}/analytics`).then(r => setData(r.data.analytics)).finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin text-primary-500" />
    </div>
  );

  const { totalAttempts, avgScore, passRate, highPerformers, questionStats, distribution, passed, failed } = data;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="font-bold text-gray-900">{quizTitle}</h2>
          <p className="text-sm text-gray-500">Analytics & Performance Insights</p>
        </div>
      </div>

      {totalAttempts === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <BarChart3 size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No attempts yet</p>
          <p className="text-sm text-gray-400">Share the quiz with students to see analytics here</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Attempts', value: totalAttempts, icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: 'Avg Score', value: `${avgScore}%`, icon: Target, color: 'text-purple-600 bg-purple-50' },
              { label: 'Pass Rate', value: `${passRate}%`, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'High Performers', value: highPerformers.length, icon: Trophy, color: 'text-amber-600 bg-amber-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${color}`}>
                  <Icon size={16} />
                </div>
                <p className="text-xl font-black text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Score Distribution */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <p className="font-bold text-gray-800 text-sm mb-4">Score Distribution</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={distribution} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distribution.map((entry, i) => (
                    <Cell key={i} fill={['#ef4444','#f97316','#eab308','#22c55e','#10b981'][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Question difficulty */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-gray-800 text-sm">Question Analysis</p>
              {questionStats.some(q => q.needsReview) && (
                <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                  <AlertTriangle size={10} />{questionStats.filter(q => q.needsReview).length} need review
                </span>
              )}
            </div>
            <div className="space-y-2">
              {questionStats.map(q => (
                <div key={q.index} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-5 text-center flex-shrink-0">Q{q.index}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-xs text-gray-700 truncate">{q.question}</p>
                      <span className={`text-xs font-bold ml-2 flex-shrink-0 ${q.correctRate >= 70 ? 'text-emerald-600' : q.correctRate >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{q.correctRate}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${q.correctRate >= 70 ? 'bg-emerald-500' : q.correctRate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${q.correctRate}%` }} />
                    </div>
                  </div>
                  {q.needsReview && <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* High Performers */}
          {highPerformers.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <p className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <Trophy size={14} className="text-amber-500" />High Performers (≥85%)
              </p>
              <div className="space-y-2">
                {highPerformers.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-amber-50/50 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-xs font-bold text-amber-700">{i + 1}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{h.student?.name}</p>
                      <p className="text-xs text-gray-500">{h.student?.email}</p>
                    </div>
                    <ScoreBadge pct={h.percentage} />
                    <span className="text-xs text-gray-400">{fmt(h.timeSpent)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === 'admin' || user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const [tab, setTab] = useState(isStudent ? 'browse' : 'manage');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  // Modals
  const [taking, setTaking] = useState(null);          // quiz object
  const [results, setResults] = useState(null);        // { attempt, quiz }
  const [forming, setForming] = useState(null);        // null | {} | quiz object
  const [analytics, setAnalytics] = useState(null);   // { quizId, quizTitle }
<<<<<<< HEAD
<<<<<<< HEAD
=======
  const [previewing, setPreviewing] = useState(null);  // quiz object
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
  const [previewing, setPreviewing] = useState(null);  // quiz object
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae

  // Student history
  const [myAttempts, setMyAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (filter) params.filter = filter;
      const r = await api.get('/quiz', { params });
      setQuizzes(r.data.quizzes || []);
    } catch {}
    setLoading(false);
  }, [search, filter]);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  useEffect(() => {
    if (tab === 'history' && isStudent) {
      setAttemptsLoading(true);
      api.get('/quiz/my-attempts').then(r => setMyAttempts(r.data.attempts || [])).finally(() => setAttemptsLoading(false));
    }
  }, [tab, isStudent]);

  const handleTake = (quiz) => { setTaking(quiz); };
  const handleSubmitAttempt = async (payload) => {
    const r = await api.post(`/quiz/${taking._id}/attempt`, payload);
    setTaking(null);
    setResults({ attempt: r.data.attempt, quiz: r.data.quiz });
    fetchQuizzes();
  };
  const handleCloseResults = () => setResults(null);
  const handleRetake = () => { const q = results.quiz; setResults(null); setTaking(q); };

  const handleSaveQuiz = async (form) => {
    const isEdit = !!forming?._id;
    if (isEdit) await api.put(`/quiz/${forming._id}`, form);
    else await api.post('/quiz', form);
    setForming(null);
    fetchQuizzes();
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quiz and all its attempts?')) return;
    await api.delete(`/quiz/${id}`);
    fetchQuizzes();
  };
  const handlePublish = async (id) => {
    await api.put(`/quiz/${id}/publish`);
    fetchQuizzes();
  };

  const tabs = isStudent
    ? [{ id: 'browse', label: 'Browse Quizzes', icon: BookOpen }, { id: 'history', label: 'My History', icon: ClipboardList }]
    : [{ id: 'manage', label: 'Manage Quizzes', icon: BookOpen }, { id: 'analytics', label: 'Analytics', icon: BarChart3 }];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Premium Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-violet-700 rounded-3xl p-6 sm:p-8">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
        <div className="absolute top-6 right-16 w-16 h-16 rounded-full bg-purple-400/20" />

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <ClipboardList size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Quiz Management</h1>
              <p className="text-white/70 text-sm mt-0.5">
                {isStudent ? 'Take quizzes and track your scores' : 'Create, manage, and analyze quizzes'}
              </p>
            </div>
          </div>
          {isTeacher && (
            <button onClick={() => setForming({})} className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold text-sm transition-all border border-white/10 shadow-lg">
              <Plus size={16} /> New Quiz
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1.5 w-fit border border-gray-200/50">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              tab === id
                ? 'bg-white shadow-md shadow-primary-500/10 text-primary-700 border border-gray-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}>
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* Analytics tab for teachers */}
      {tab === 'analytics' && isTeacher && (
        analytics ? (
          <AnalyticsView quizId={analytics.quizId} quizTitle={analytics.quizTitle} onBack={() => setAnalytics(null)} />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Select a quiz to view detailed performance analytics</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map(q => (
                <button key={q._id} onClick={() => setAnalytics({ quizId: q._id, quizTitle: q.title })}
                  className="text-left p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 text-sm group-hover:text-primary-700 transition-colors truncate">{q.title}</p>
                    <ChevronRight size={14} className="text-gray-400 group-hover:text-primary-500 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{[q.subject, q.module].filter(Boolean).join(' · ') || 'General'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {q.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-400">{q.questions?.length || 0} questions</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* Manage / Browse tabs */}
      {(tab === 'manage' || tab === 'browse') && (
        <>
          {/* ── Glass Filter Bar ── */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-52">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search quizzes…"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-500/10 outline-none text-sm transition-all placeholder:text-gray-400"
                />
              </div>
              {isTeacher && (
                <select value={filter} onChange={e => setFilter(e.target.value)} className="input text-sm pr-8">
                  <option value="">All Quizzes</option>
                  <option value="mine">My Quizzes</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts</option>
                </select>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-28">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-primary-100 rounded-full" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-gray-400 font-medium">Loading quizzes...</p>
              </div>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="relative bg-white rounded-3xl border border-gray-100 text-center py-20 px-8 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary-50 opacity-50" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-violet-50 opacity-50" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <BookOpen size={36} className="text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No quizzes found</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
                  {isTeacher ? 'Create your first quiz to get started.' : 'No quizzes are available at the moment.'}
                </p>
                {isTeacher && (
                  <button onClick={() => setForming({})} className="btn-primary mt-6 mx-auto px-6 py-3 text-sm font-semibold shadow-lg shadow-primary-500/20">
                    <Plus size={16} /> Create Your First Quiz
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {quizzes.map(q => (
                <QuizCard
                  key={q._id} quiz={q}
                  onTake={handleTake}
                  onEdit={setForming}
                  onDelete={handleDelete}
                  onPublish={handlePublish}
<<<<<<< HEAD
<<<<<<< HEAD
=======
                  onPreview={setPreviewing}
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
                  onPreview={setPreviewing}
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
                  isTeacher={isTeacher}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Student history tab */}
      {tab === 'history' && isStudent && (
        <div className="space-y-4">
          {attemptsLoading ? (
            <div className="flex items-center justify-center py-28">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 border-4 border-primary-100 rounded-full" />
                  <div className="absolute inset-0 w-14 h-14 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-gray-400 font-medium">Loading history...</p>
              </div>
            </div>
          ) : myAttempts.length === 0 ? (
            <div className="relative bg-white rounded-3xl border border-gray-100 text-center py-20 px-8 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary-50 opacity-50" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-violet-50 opacity-50" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <ClipboardList size={36} className="text-primary-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No quiz attempts yet</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">Take your first quiz to see your history here.</p>
                <button onClick={() => setTab('browse')} className="btn-primary mt-6 mx-auto px-6 py-3 text-sm font-semibold shadow-lg shadow-primary-500/20">
                  <BookOpen size={16} /> Browse Quizzes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {myAttempts.map(a => (
                <div key={a._id} className="group bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 p-5 flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-base shadow-sm ${
                    a.passed
                      ? 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 border border-emerald-200'
                      : 'bg-gradient-to-br from-red-100 to-rose-100 text-red-700 border border-red-200'
                  }`}>
                    {a.percentage}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate group-hover:text-primary-700 transition-colors">{a.quiz?.title || 'Quiz'}</p>
                    <p className="text-xs text-gray-500 mt-1">{[a.quiz?.subject, a.quiz?.module].filter(Boolean).join(' · ')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-lg border ${a.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                      {a.passed ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {a.passed ? 'Passed' : 'Failed'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1.5">{new Date(a.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2 border-l border-gray-100">
                    <p className="text-sm font-bold text-gray-800">{a.score}/{a.totalPoints}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-end"><Clock size={9} />{fmt(a.timeSpent)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
<<<<<<< HEAD
<<<<<<< HEAD
=======
      {previewing && <QuizPreview quiz={previewing} onClose={() => setPreviewing(null)} />}
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
=======
      {previewing && <QuizPreview quiz={previewing} onClose={() => setPreviewing(null)} />}
>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
      {taking && <QuizTaker quiz={taking} onClose={() => setTaking(null)} onSubmit={handleSubmitAttempt} />}
      {results && (
        <QuizResults
          attempt={results.attempt}
          quiz={results.quiz}
          onClose={handleCloseResults}
          onRetake={handleRetake}
          canRetake={results.quiz.allowRetake && (results.quiz.maxAttempts === 0 || results.attempt.attemptCount < results.quiz.maxAttempts)}
        />
      )}
      {forming !== null && <QuizForm initial={forming?._id ? forming : null} onSave={handleSaveQuiz} onClose={() => setForming(null)} />}
    </div>
  );
}
