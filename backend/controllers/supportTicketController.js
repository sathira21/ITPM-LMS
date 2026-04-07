const SupportTicket = require('../models/SupportTicket');
const ActivityLog = require('../models/ActivityLog');

const log = async (userId, action, details, req) => {
  try {
    await ActivityLog.create({ user: userId, action, category: 'system', details, ipAddress: req.ip });
  } catch {}
};

/* ─── AI Auto-Priority Detection ─── */
const PRIORITY_KEYWORDS = {
  urgent: [
    'urgent', 'emergency', 'critical', 'asap', 'immediately', 'cannot access',
    'locked out', 'hacked', 'compromised', 'data loss', 'system down',
    'deadline today', 'exam today', 'submission deadline', 'cannot login',
    'account blocked', 'payment failed', 'double charged',
  ],
  high: [
    'error', 'bug', 'broken', 'crash', 'not working', 'failed', 'missing',
    'wrong grade', 'incorrect', 'can\'t submit', 'deadline', 'exam',
    'assignment due', 'losing data', 'slow', 'timeout', 'unresponsive',
    'important', 'serious', 'major issue',
  ],
  medium: [
    'issue', 'problem', 'help', 'question', 'confused', 'how to',
    'doesn\'t work', 'trouble', 'difficulty', 'unable', 'need assistance',
    'not sure', 'clarification',
  ],
  low: [
    'suggestion', 'feedback', 'feature request', 'improvement', 'would be nice',
    'minor', 'cosmetic', 'typo', 'small', 'when will', 'just wondering',
  ],
};

function detectPriority(text) {
  const lower = (text || '').toLowerCase();
  const matched = [];
  const scores = { urgent: 0, high: 0, medium: 0, low: 0 };

  for (const [level, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        scores[level]++;
        matched.push(kw);
      }
    }
  }

  // Weight: urgent(4), high(3), medium(2), low(1)
  const weights = { urgent: 4, high: 3, medium: 2, low: 1 };
  let bestLevel = null;
  let bestScore = 0;
  for (const [level, count] of Object.entries(scores)) {
    const weighted = count * weights[level];
    if (weighted > bestScore) {
      bestScore = weighted;
      bestLevel = level;
    }
  }

  return { priority: bestLevel, keywords: matched };
}

/* ─── SLA Deadlines (in hours) ─── */
const SLA_HOURS = { urgent: 2, high: 8, medium: 24, low: 48 };

function calculateSlaDue(priority, createdAt) {
  const hours = SLA_HOURS[priority] || 24;
  return new Date(new Date(createdAt).getTime() + hours * 60 * 60 * 1000);
}

/* ─── Populate helper ─── */
const POPULATE = [
  { path: 'submittedBy', select: 'name email role avatar' },
  { path: 'assignedTo', select: 'name email' },
  { path: 'replies.user', select: 'name email role avatar' },
  { path: 'attachments.uploadedBy', select: 'name' },
  { path: 'replies.attachments.uploadedBy', select: 'name' },
];

// @route  GET /api/support-tickets/stats
exports.getStats = async (req, res) => {
  try {
    const [total, open, inProgress, resolved, closed, byCategory, byPriority, slaBreached, avgSatisfaction] = await Promise.all([
      SupportTicket.countDocuments(),
      SupportTicket.countDocuments({ status: 'open' }),
      SupportTicket.countDocuments({ status: 'in_progress' }),
      SupportTicket.countDocuments({ status: 'resolved' }),
      SupportTicket.countDocuments({ status: 'closed' }),
      SupportTicket.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      SupportTicket.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      SupportTicket.countDocuments({ 'sla.breached': true }),
      SupportTicket.aggregate([
        { $match: { 'satisfaction.rating': { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$satisfaction.rating' }, count: { $sum: 1 } } },
      ]),
    ]);
    res.json({
      success: true,
      stats: {
        total, open, inProgress, resolved, closed,
        byCategory, byPriority, slaBreached,
        avgSatisfaction: avgSatisfaction[0]?.avg?.toFixed(1) || null,
        totalRated: avgSatisfaction[0]?.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
<<<<<<< HEAD
//Contribution test by poornima
=======

>>>>>>> 8f54b83a05307a036d201ab39d454d284dec54ae
// @route  GET /api/support-tickets
exports.getTickets = async (req, res) => {
  try {
    const { category, status, priority, search, slaBreached, page = 1, limit = 12 } = req.query;
    const query = {};

    if (req.user.role === 'student') query.submittedBy = req.user._id;

    if (category)   query.category = category;
    if (status)     query.status   = status;
    if (priority)   query.priority = priority;
    if (slaBreached === 'true') query['sla.breached'] = true;
    if (search)     query.$or = [
      { subject:     { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Check SLA breaches in real-time
    const now = new Date();
    for (const t of tickets) {
      if (!t.sla.breached && t.sla.dueAt && now > t.sla.dueAt && !['resolved', 'closed'].includes(t.status)) {
        t.sla.breached = true;
        t.sla.breachedAt = now;
        await t.save();
      }
    }

    res.json({ success: true, tickets, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/support-tickets/:id
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate(POPULATE);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (req.user.role === 'student' && ticket.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Real-time SLA check
    const now = new Date();
    if (!ticket.sla.breached && ticket.sla.dueAt && now > ticket.sla.dueAt && !['resolved', 'closed'].includes(ticket.status)) {
      ticket.sla.breached = true;
      ticket.sla.breachedAt = now;
      await ticket.save();
    }

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/support-tickets
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, category, priority } = req.body;

    // AI auto-priority detection
    const aiResult = detectPriority(`${subject} ${description}`);
    const finalPriority = priority || aiResult.priority || 'medium';

    // Build attachments from uploaded files
    const attachments = (req.files || []).map((f) => ({
      fileName: f.originalname,
      fileUrl: `/uploads/tickets/${f.filename}`,
      fileKey: f.filename,
      fileSize: f.size,
      mimeType: f.mimetype,
      uploadedBy: req.user._id,
    }));

    const now = new Date();
    const ticket = await SupportTicket.create({
      submittedBy: req.user._id,
      subject,
      description,
      category: category || 'other',
      priority: finalPriority,
      aiDetectedPriority: aiResult.priority,
      aiPriorityKeywords: aiResult.keywords,
      attachments,
      sla: { dueAt: calculateSlaDue(finalPriority, now) },
    });

    await ticket.populate(POPULATE);
    await log(req.user._id, 'CREATE_TICKET', `Created support ticket: "${subject}" [${finalPriority}]`, req);

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('ticket:created', ticket);

    res.status(201).json({
      success: true,
      ticket,
      aiSuggestion: aiResult.priority ? {
        suggestedPriority: aiResult.priority,
        keywords: aiResult.keywords,
        applied: !priority, // true if AI suggestion was auto-applied
      } : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/support-tickets/:id/reply
exports.addReply = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Reply message is required' });

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (req.user.role === 'student' && ticket.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Build reply attachments
    const attachments = (req.files || []).map((f) => ({
      fileName: f.originalname,
      fileUrl: `/uploads/tickets/${f.filename}`,
      fileKey: f.filename,
      fileSize: f.size,
      mimeType: f.mimetype,
      uploadedBy: req.user._id,
    }));

    ticket.replies.push({ user: req.user._id, message: message.trim(), attachments });

    // Auto-transition
    if (req.user.role === 'admin' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    await ticket.save();
    await ticket.populate(POPULATE);

    await log(req.user._id, 'REPLY_TICKET', `Replied to ticket: "${ticket.subject}"`, req);

    // Emit socket event for real-time chat
    const io = req.app.get('io');
    if (io) io.to(`ticket:${ticket._id}`).emit('ticket:reply', ticket);

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/support-tickets/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'resolved') update.resolvedAt = new Date();
    if (status === 'closed')   update.closedAt = new Date();

    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, update, { new: true }).populate(POPULATE);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    await log(req.user._id, 'UPDATE_TICKET_STATUS', `Ticket "${ticket.subject}" → ${status}`, req);

    const io = req.app.get('io');
    if (io) io.to(`ticket:${ticket._id}`).emit('ticket:statusChanged', ticket);

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/support-tickets/:id/rate
exports.rateSatisfaction = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    // Only the ticket owner can rate
    if (ticket.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only ticket owner can rate' });
    }

    // Must be resolved or closed
    if (!['resolved', 'closed'].includes(ticket.status)) {
      return res.status(400).json({ success: false, message: 'Can only rate resolved/closed tickets' });
    }

    ticket.satisfaction = {
      rating: Number(rating),
      comment: comment || '',
      ratedAt: new Date(),
    };
    await ticket.save();
    await ticket.populate(POPULATE);

    await log(req.user._id, 'RATE_TICKET', `Rated ticket "${ticket.subject}" ${rating}/5`, req);
    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/support-tickets/:id
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    if (req.user.role !== 'admin' && ticket.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await SupportTicket.findByIdAndDelete(req.params.id);
    await log(req.user._id, 'DELETE_TICKET', `Deleted ticket: "${ticket.subject}"`, req);
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
