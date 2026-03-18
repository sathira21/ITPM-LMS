const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const ActivityLog = require('../models/ActivityLog');

const log = async (userId, action, details, req) => {
  try {
    await ActivityLog.create({ user: userId, action, category: 'system', details, ipAddress: req.ip });
  } catch {}
};

// GET /api/quiz
exports.getQuizzes = async (req, res) => {
  try {
    const { subject, module: mod, search, filter, page = 1, limit = 12 } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.isPublished = true;
    } else if (req.user.role === 'teacher') {
      if (filter === 'mine') query.createdBy = req.user._id;
      else query.$or = [{ createdBy: req.user._id }, { isPublished: true }];
    }

    if (filter === 'published' && req.user.role !== 'student') query.isPublished = true;
    if (filter === 'draft' && req.user.role !== 'student') { query.isPublished = false; query.createdBy = req.user._id; }
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (mod)     query.module  = { $regex: mod, $options: 'i' };
    if (search)  query.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { subject:     { $regex: search, $options: 'i' } },
    ];

    const total = await Quiz.countDocuments(query);
    const quizzesQuery = Quiz.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    if (req.user && req.user.role === 'student') {
      quizzesQuery.select('-questions.correctAnswer -questions.explanation');
    }

    const quizzes = await quizzesQuery;

    let result = quizzes.map(q => q.toObject());

    if (req.user.role === 'student') {
      const quizIds = quizzes.map(q => q._id);
      const attempts = await QuizAttempt.find({
        student: req.user._id, quiz: { $in: quizIds }, submittedAt: { $exists: true },
      }).sort({ createdAt: -1 });

      result = result.map(quiz => {
        const myAttempts = attempts.filter(a => a.quiz.toString() === quiz._id.toString());
        return {
          ...quiz,
          attemptCount: myAttempts.length,
          bestScore: myAttempts.length ? Math.max(...myAttempts.map(a => a.percentage)) : null,
          lastAttempt: myAttempts[0] || null,
        };
      });
    }

    res.json({ success: true, quizzes: result, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/quiz/:id
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name email');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const obj = quiz.toObject();
    if (req.user.role === 'student') {
      const attempt = await QuizAttempt.findOne({
        quiz: quiz._id, student: req.user._id, submittedAt: { $exists: true },
      });
      if (!attempt) {
        obj.questions = obj.questions.map(({ correctAnswer, explanation, ...rest }) => rest);
      }
    }
    res.json({ success: true, quiz: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, subject, module: mod, group, questions, timeLimit, passingScore, allowRetake, maxAttempts, dueDate } = req.body;
    const quiz = await Quiz.create({
      title, description,
      subject: subject || '',
      module: mod || '',
      group: group || null,
      createdBy: req.user._id,
      questions: questions || [],
      timeLimit: timeLimit || 0,
      passingScore: passingScore || 60,
      allowRetake: allowRetake !== false,
      maxAttempts: maxAttempts || 3,
      dueDate: dueDate || null,
    });
    await quiz.populate('createdBy', 'name email');
    await log(req.user._id, 'CREATE_QUIZ', `Created quiz: "${title}"`, req);
    res.status(201).json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/quiz/:id
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const fields = ['title', 'description', 'subject', 'module', 'group', 'questions', 'timeLimit', 'passingScore', 'allowRetake', 'maxAttempts', 'dueDate', 'isPublished'];
    fields.forEach(f => { if (req.body[f] !== undefined) quiz[f] = req.body[f]; });
    await quiz.save();
    await quiz.populate('createdBy', 'name email');
    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/quiz/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Quiz.findByIdAndDelete(req.params.id);
    await QuizAttempt.deleteMany({ quiz: req.params.id });
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/quiz/:id/publish
exports.publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    quiz.isPublished = !quiz.isPublished;
    await quiz.save();
    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/quiz/:id/attempt
exports.submitAttempt = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    if (!quiz.isPublished) return res.status(400).json({ success: false, message: 'Quiz is not published' });

    const prevAttempts = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user._id });
    if (!quiz.allowRetake && prevAttempts > 0) {
      return res.status(400).json({ success: false, message: 'Retakes not allowed for this quiz' });
    }
    if (quiz.maxAttempts && prevAttempts >= quiz.maxAttempts) {
      return res.status(400).json({ success: false, message: `Maximum ${quiz.maxAttempts} attempts reached` });
    }

    const { answers = [], startedAt, timeSpent } = req.body;
    let score = 0;

    const gradedAnswers = quiz.questions.map((q) => {
      const given = answers.find(a => a.questionId === q._id.toString());
      const givenAnswer = given?.answer?.trim() || '';
      let isCorrect = false;
      let pointsEarned = 0;

      if (q.type === 'mcq' || q.type === 'true_false') {
        isCorrect = givenAnswer.toLowerCase() === (q.correctAnswer || '').toLowerCase();
      } else {
        isCorrect = givenAnswer.toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();
      }
      pointsEarned = isCorrect ? (q.points || 1) : 0;
      score += pointsEarned;
      return { questionId: q._id, answer: givenAnswer, isCorrect, pointsEarned };
    });

    const totalPoints = quiz.totalPoints || quiz.questions.reduce((s, q) => s + (q.points || 1), 0);
    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,
      answers: gradedAnswers,
      score, totalPoints, percentage, passed,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      submittedAt: new Date(),
      timeSpent: timeSpent || 0,
    });

    await attempt.populate('student', 'name email');
    await log(req.user._id, 'SUBMIT_QUIZ', `Attempted quiz: "${quiz.title}" — ${percentage}%`, req);

    res.status(201).json({ success: true, attempt, quiz: quiz.toObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/quiz/:id/attempts
exports.getAttempts = async (req, res) => {
  try {
    const query = { quiz: req.params.id, submittedAt: { $exists: true } };
    if (req.user.role === 'student') query.student = req.user._id;

    const attempts = await QuizAttempt.find(query)
      .populate('student', 'name email role')
      .sort({ createdAt: -1 });

    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/quiz/:id/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const attempts = await QuizAttempt.find({ quiz: req.params.id, submittedAt: { $exists: true } })
      .populate('student', 'name email');

    if (!attempts.length) {
      return res.json({ success: true, analytics: { totalAttempts: 0, avgScore: 0, passRate: 0, highPerformers: [], questionStats: [], distribution: [] } });
    }

    const totalAttempts = attempts.length;
    const avgScore = Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / totalAttempts);
    const passed = attempts.filter(a => a.passed).length;
    const passRate = Math.round((passed / totalAttempts) * 100);

    const highPerformers = attempts
      .filter(a => a.percentage >= 85)
      .sort((a, b) => b.percentage - a.percentage)
      .map(a => ({ student: a.student, percentage: a.percentage, score: a.score, timeSpent: a.timeSpent }));

    const questionStats = quiz.questions.map((q, idx) => {
      const correct = attempts.filter(a => a.answers[idx]?.isCorrect).length;
      return {
        index: idx + 1,
        question: q.question.length > 60 ? q.question.substring(0, 60) + '...' : q.question,
        type: q.type,
        correctRate: Math.round((correct / totalAttempts) * 100),
        correct, total: totalAttempts,
        needsReview: correct / totalAttempts < 0.5,
      };
    });

    const distribution = [
      { range: '0–20',  count: attempts.filter(a => a.percentage <= 20).length },
      { range: '21–40', count: attempts.filter(a => a.percentage > 20 && a.percentage <= 40).length },
      { range: '41–60', count: attempts.filter(a => a.percentage > 40 && a.percentage <= 60).length },
      { range: '61–80', count: attempts.filter(a => a.percentage > 60 && a.percentage <= 80).length },
      { range: '81–100',count: attempts.filter(a => a.percentage > 80).length },
    ];

    res.json({ success: true, analytics: { totalAttempts, avgScore, passRate, passed, failed: totalAttempts - passed, highPerformers, questionStats, distribution } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/quiz/my-attempts
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user._id, submittedAt: { $exists: true } })
      .populate({ path: 'quiz', select: 'title subject module passingScore totalPoints' })
      .sort({ createdAt: -1 });
    res.json({ success: true, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
