const Feedback = require('../models/Feedback');
const ActivityLog = require('../models/ActivityLog');

const log = async (userId, action, details, req) => {
  try {
    await ActivityLog.create({ user: userId, action, category: 'system', details, ipAddress: req.ip });
  } catch {}
};

// @route  GET /api/feedback
exports.getFeedbacks = async (req, res) => {
  try {
    const { category, status, search, startDate, endDate, page = 1, limit = 12, module: mod } = req.query;
    const query = {};

    // Students only see their own feedback
    if (req.user.role === 'student') query.submittedBy = req.user._id;

    if (category) query.category = category;
    if (status)   query.status   = status;
    if (mod)      query.module   = { $regex: mod, $options: 'i' };
    if (search)   query.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { module:  { $regex: search, $options: 'i' } },
    ];
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate)   query.createdAt.$lte = new Date(endDate);
    }

    const total = await Feedback.countDocuments(query);
    const feedbacks = await Feedback.find(query)
      .populate('submittedBy', 'name email role avatar')
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Hide submitter identity for anonymous entries (non-admin)
    const sanitized = feedbacks.map((f) => {
      const obj = f.toObject();
      if (obj.isAnonymous && req.user.role !== 'admin') {
        obj.submittedBy = { name: 'Anonymous', email: '', role: 'student' };
      }
      return obj;
    });

    res.json({ success: true, feedbacks: sanitized, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/feedback/stats
exports.getStats = async (req, res) => {
  try {
    const [total, pending, reviewed, resolved, byCategory, avgRating, recentRatings] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'pending' }),
      Feedback.countDocuments({ status: 'reviewed' }),
      Feedback.countDocuments({ status: 'resolved' }),
      Feedback.aggregate([{ $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } }]),
      Feedback.aggregate([
        { $match: { rating: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        { $match: { rating: { $ne: null } } },
        { $group: { _id: '$rating', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.json({
      success: true,
      stats: {
        total, pending, reviewed, resolved,
        avgRating: avgRating[0]?.avg?.toFixed(1) || null,
        totalRated: avgRating[0]?.count || 0,
        byCategory,
        recentRatings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { title, message, category, subject, module: mod, rating, isAnonymous, targetType, targetName } = req.body;
    const feedback = await Feedback.create({
      submittedBy: req.user._id,
      title, message, category,
      subject: subject || '',
      module: mod || '',
      rating: rating ? Number(rating) : null,
      isAnonymous: Boolean(isAnonymous),
      targetType: targetType || 'general',
      targetName: targetName || '',
    });
    await feedback.populate('submittedBy', 'name email role');
    await log(req.user._id, 'SUBMIT_FEEDBACK', `Submitted feedback: "${title}"`, req);
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/feedback/:id/respond
exports.respondToFeedback = async (req, res) => {
  try {
    const { adminResponse, status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse,
        status: status || 'reviewed',
        respondedBy: req.user._id,
        respondedAt: new Date(),
      },
      { new: true }
    )
      .populate('submittedBy', 'name email role')
      .populate('respondedBy', 'name email');
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    await log(req.user._id, 'RESPOND_FEEDBACK', `Responded to feedback: "${feedback.title}"`, req);
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/feedback/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/feedback/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Feedback not found' });
    // Students can only delete their own
    if (req.user.role !== 'admin' && feedback.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
