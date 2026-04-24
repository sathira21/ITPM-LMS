const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

// @route  GET /api/activity
exports.getLogs = async (req, res) => {
  try {
    const { userId, category, status, search, page = 1, limit = 20, startDate, endDate } = req.query;
    const query = {};
    // Non-admin can only see their own logs
    if (req.user.role !== 'admin') query.user = req.user._id;
    else if (userId) query.user = userId;
    if (category) query.category = category;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) query.details = { $regex: search, $options: 'i' };

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, logs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/activity/summary
exports.getSummary = async (req, res) => {
  try {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const [byCategory, byStatus, byDay, topUsers] = await Promise.all([
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      ActivityLog.aggregate([
        { $match: { createdAt: { $gte: last30Days } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { 'user.name': 1, 'user.email': 1, 'user.role': 1, count: 1 } },
      ]),
    ]);
    res.json({ success: true, byCategory, byStatus, byDay, topUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/activity/clear  (admin only)
exports.clearLogs = async (req, res) => {
  try {
    const { olderThanDays = 90 } = req.body;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    const result = await ActivityLog.deleteMany({ createdAt: { $lt: cutoff } });
    res.json({ success: true, message: `Deleted ${result.deletedCount} logs older than ${olderThanDays} days` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
