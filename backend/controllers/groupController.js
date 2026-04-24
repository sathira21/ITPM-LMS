const LearningGroup = require('../models/LearningGroup');
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, details, req) => {
  try {
    await ActivityLog.create({ user: userId, action, category: 'group', details, ipAddress: req.ip });
  } catch {}
};

// @route  GET /api/groups
exports.getGroups = async (req, res) => {
  try {
    const { category, search, joined } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
    ];
    if (joined === 'true') query['members.user'] = req.user._id;
    const groups = await LearningGroup.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar role')
      .sort({ createdAt: -1 });
    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/groups/:id
exports.getGroup = async (req, res) => {
  try {
    const group = await LearningGroup.findById(req.params.id)
      .populate('createdBy', 'name email avatar role')
      .populate('members.user', 'name email avatar role');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/groups
exports.createGroup = async (req, res) => {
  try {
    const { name, description, subject, category, coverColor, maxMembers, isPublic, tags } = req.body;
    const group = await LearningGroup.create({
      name, description, subject, category, coverColor, maxMembers, isPublic, tags,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });
    await group.populate('createdBy', 'name email avatar');
    await logActivity(req.user._id, 'CREATE_GROUP', `Created group: ${name}`, req);
    res.status(201).json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/groups/:id/join
exports.joinGroup = async (req, res) => {
  try {
    const group = await LearningGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const already = group.members.some((m) => m.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: 'Already a member' });
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }
    group.members.push({ user: req.user._id, role: 'member' });
    await group.save();
    await logActivity(req.user._id, 'JOIN_GROUP', `Joined group: ${group.name}`, req);
    res.json({ success: true, message: 'Joined successfully', group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/groups/:id/leave
exports.leaveGroup = async (req, res) => {
  try {
    const group = await LearningGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const memberIndex = group.members.findIndex((m) => m.user.toString() === req.user._id.toString());
    if (memberIndex === -1) return res.status(400).json({ success: false, message: 'Not a member' });
    const member = group.members[memberIndex];
    if (member.role === 'owner') return res.status(400).json({ success: false, message: 'Owner cannot leave. Transfer ownership first.' });
    group.members.splice(memberIndex, 1);
    await group.save();
    await logActivity(req.user._id, 'LEAVE_GROUP', `Left group: ${group.name}`, req);
    res.json({ success: true, message: 'Left group successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/groups/:id
exports.updateGroup = async (req, res) => {
  try {
    const group = await LearningGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const isOwner = group.members.some((m) => m.user.toString() === req.user._id.toString() && m.role === 'owner');
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the owner can update this group' });
    }
    Object.assign(group, req.body);
    await group.save();
    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/groups/:id
exports.deleteGroup = async (req, res) => {
  try {
    const group = await LearningGroup.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    res.json({ success: true, message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
