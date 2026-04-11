const mongoose = require('mongoose');
const ContentProgress = require('../models/ContentProgress');
const Material = require('../models/Material');
const User = require('../models/User');
const Course = require('../models/Course');
const ActivityLog = require('../models/ActivityLog');

// Helper: Activity logging
const log = async (userId, action, details, req) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      category: 'system',
      details,
      ipAddress: req?.ip || 'unknown',
    });
  } catch (err) {
    console.error('Activity log error:', err.message);
  }
};

// ============================================
// STUDENT PROGRESS ENDPOINTS
// ============================================

// @route   POST /api/progress/start/:materialId
// @desc    Record when student opens/views a material
// @access  Student only
exports.startProgress = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { courseId } = req.body; // Optional: track within specific course
    const studentId = req.user._id;

    // Verify material exists and is approved
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }
    if (material.status !== 'approved') {
      return res.status(403).json({ success: false, message: 'Material not available' });
    }

    // Find or create progress record (unique per student + material + course)
    const query = { student: studentId, material: materialId, course: courseId || null };
    let progress = await ContentProgress.findOne(query);

    if (!progress) {
      progress = new ContentProgress({
        student: studentId,
        material: materialId,
        course: courseId || null,
        status: 'in_progress',
        firstViewedAt: new Date(),
        lastViewedAt: new Date(),
        viewCount: 1,
        sessions: [{ startedAt: new Date() }],
      });
    } else {
      // Update existing
      if (progress.status === 'not_started') {
        progress.status = 'in_progress';
        progress.firstViewedAt = new Date();
      }
      progress.lastViewedAt = new Date();
      progress.viewCount += 1;
      progress.sessions.push({ startedAt: new Date() });
    }

    await progress.save();

    await log(studentId, 'content_view_start', `Started viewing: ${material.title}`, req);

    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('Start progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   PUT /api/progress/heartbeat/:materialId
// @desc    Periodic heartbeat to track time spent (called every 30s)
// @access  Student only
exports.heartbeat = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { courseId } = req.body;
    const studentId = req.user._id;

    const progress = await ContentProgress.findOne({
      student: studentId,
      material: materialId,
      course: courseId || null,
    });

    if (!progress || progress.sessions.length === 0) {
      return res.status(404).json({ success: false, message: 'No active session' });
    }

    // Find the most recent active session (endedAt is null)
    const activeSessionIndex = progress.sessions.findIndex(s => !s.endedAt);
    if (activeSessionIndex === -1) {
      return res.status(400).json({ success: false, message: 'No active session' });
    }

    const session = progress.sessions[activeSessionIndex];
    const now = new Date();
    const duration = Math.floor((now - session.startedAt) / 1000);

    progress.sessions[activeSessionIndex].duration = duration;
    progress.lastViewedAt = now;

    // Recalculate total time spent
    progress.totalTimeSpent = progress.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    await progress.save();

    res.json({ success: true, data: { totalTimeSpent: progress.totalTimeSpent } });
  } catch (err) {
    console.error('Heartbeat error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   PUT /api/progress/end/:materialId
// @desc    End current viewing session
// @access  Student only
exports.endSession = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { courseId } = req.body;
    const studentId = req.user._id;

    const progress = await ContentProgress.findOne({
      student: studentId,
      material: materialId,
      course: courseId || null,
    });

    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }

    // Find and close active session
    const activeSessionIndex = progress.sessions.findIndex(s => !s.endedAt);
    if (activeSessionIndex !== -1) {
      const session = progress.sessions[activeSessionIndex];
      const now = new Date();
      const duration = Math.floor((now - session.startedAt) / 1000);

      progress.sessions[activeSessionIndex].endedAt = now;
      progress.sessions[activeSessionIndex].duration = duration;
    }

    // Recalculate total time
    progress.totalTimeSpent = progress.sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    progress.lastViewedAt = new Date();

    await progress.save();

    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('End session error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   PUT /api/progress/complete/:materialId
// @desc    Manual "Mark as Complete" by student
// @access  Student only
exports.markComplete = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { courseId } = req.body;
    const studentId = req.user._id;

    const query = { student: studentId, material: materialId, course: courseId || null };
    let progress = await ContentProgress.findOne(query);

    if (!progress) {
      // Create new progress record if doesn't exist
      progress = new ContentProgress({
        student: studentId,
        material: materialId,
        course: courseId || null,
        status: 'completed',
        completedAt: new Date(),
        completedBy: 'manual',
      });
    } else {
      progress.status = 'completed';
      progress.completedAt = new Date();
      progress.completedBy = 'manual';
    }

    await progress.save();

    const material = await Material.findById(materialId);
    await log(studentId, 'content_completed', `Completed: ${material?.title || materialId}`, req);

    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('Mark complete error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   PUT /api/progress/uncomplete/:materialId
// @desc    Unmark completion
// @access  Student only
exports.unmarkComplete = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { courseId } = req.body;
    const studentId = req.user._id;

    const progress = await ContentProgress.findOne({
      student: studentId,
      material: materialId,
      course: courseId || null,
    });

    if (!progress) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }

    progress.status = progress.viewCount > 0 ? 'in_progress' : 'not_started';
    progress.completedAt = null;
    progress.completedBy = null;

    await progress.save();

    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('Unmark complete error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/my
// @desc    Get current student's progress on all materials (optionally filtered by course)
// @access  Student only
exports.getMyProgress = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.query; // Optional filter

    const query = { student: studentId };
    if (courseId) {
      query.course = courseId;
    }

    const progress = await ContentProgress.find(query)
      .populate('material', 'title subject module fileType status')
      .populate('course', 'title code')
      .sort({ lastViewedAt: -1 });

    // Get total approved materials count
    const totalMaterials = await Material.countDocuments({ status: 'approved' });
    const completedCount = progress.filter(p => p.status === 'completed').length;
    const inProgressCount = progress.filter(p => p.status === 'in_progress').length;

    res.json({
      success: true,
      data: {
        progress,
        summary: {
          totalMaterials,
          completed: completedCount,
          inProgress: inProgressCount,
          notStarted: totalMaterials - completedCount - inProgressCount,
          completionPercentage: totalMaterials > 0 ? Math.round((completedCount / totalMaterials) * 100) : 0,
        },
      },
    });
  } catch (err) {
    console.error('Get my progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/my/:materialId
// @desc    Get student's progress for specific material (optionally in a specific course)
// @access  Student only
exports.getMyMaterialProgress = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { courseId } = req.query;
    const studentId = req.user._id;

    const progress = await ContentProgress.findOne({
      student: studentId,
      material: materialId,
      course: courseId || null,
    });

    if (!progress) {
      return res.json({
        success: true,
        data: { status: 'not_started', totalTimeSpent: 0, viewCount: 0 },
      });
    }

    res.json({ success: true, data: progress });
  } catch (err) {
    console.error('Get material progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// ADMIN/TEACHER ANALYTICS ENDPOINTS
// ============================================

// @route   GET /api/progress/analytics/overview
// @desc    Dashboard overview stats
// @access  Admin, Teacher
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const activeStudents = await User.find({ role: 'student', isActive: true }).select('_id');
    const activeStudentIds = activeStudents.map(s => s._id);
    
    // Fetch all published courses to constrain metrics to actual curriculum
    const allCourses = await Course.find({ status: 'published' }).select('modules enrolledStudents');
    const publishedCourseIds = allCourses.map(c => c._id);

    const [
      totalStudents,
      totalMaterials,
      progressStats,
      completionBySubject,
      mostViewed,
      leastEngaged,
      recentCompletions,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      Material.countDocuments({ status: 'approved' }),
      ContentProgress.aggregate([
        { 
          $match: { 
            student: { $in: activeStudentIds },
            course: { $in: publishedCourseIds }
          } 
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalTime: { $sum: '$totalTimeSpent' },
          },
        },
      ]),
      ContentProgress.aggregate([
        { 
          $match: { 
            status: 'completed',
            student: { $in: activeStudentIds },
            course: { $in: publishedCourseIds }
          } 
        },
        {
          $lookup: {
            from: 'materials',
            localField: 'material',
            foreignField: '_id',
            as: 'materialData',
          },
        },
        { $unwind: '$materialData' },
        {
          $group: {
            _id: '$materialData.subject',
            completed: { $sum: 1 },
          },
        },
        { $sort: { completed: -1 } },
        { $limit: 10 },
      ]),
      ContentProgress.aggregate([
        { 
          $match: { 
            student: { $in: activeStudentIds },
            course: { $in: publishedCourseIds }
          } 
        },
        {
          $group: {
            _id: '$material',
            viewCount: { $sum: '$viewCount' },
            completions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          },
        },
        { $sort: { viewCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'materials',
            localField: '_id',
            foreignField: '_id',
            as: 'material',
          },
        },
        { $unwind: '$material' },
      ]),
      Material.aggregate([
        { $match: { status: 'approved' } },
        {
          $lookup: {
            from: 'contentprogresses',
            let: { matId: '$_id' },
            pipeline: [
              { 
                $match: { 
                  $expr: { 
                    $and: [
                      { $eq: ['$material', '$$matId'] },
                      { $in: ['$student', activeStudentIds] },
                      { $in: ['$course', publishedCourseIds] }
                    ]
                  } 
                } 
              }
            ],
            as: 'progress',
          },
        },
        {
          $project: {
            title: 1,
            subject: 1,
            viewCount: { $sum: '$progress.viewCount' },
          },
        },
        { $sort: { viewCount: 1 } },
        { $limit: 5 },
      ]),
      ContentProgress.find({ 
        status: 'completed',
        student: { $in: activeStudentIds },
        course: { $in: publishedCourseIds }
      })
        .populate('student', 'name email')
        .populate('material', 'title subject')
        .sort({ completedAt: -1 })
        .limit(10),
    ]);

    // Calculate summary stats
    const completedCount = progressStats.find(p => p._id === 'completed')?.count || 0;
    const inProgressCount = progressStats.find(p => p._id === 'in_progress')?.count || 0;
    const totalTimeSpent = progressStats.reduce((sum, p) => sum + (p.totalTime || 0), 0);
    const totalProgressRecords = progressStats.reduce((sum, p) => sum + p.count, 0);

    // Calculate potential completions based on ACTUAL enrollments
    let potentialRecords = 0;
    allCourses.forEach(course => {
      const activeEnrolledCount = course.enrolledStudents.filter(e => e.status === 'active').length;
      const uniqueMaterialsInCourse = new Set(course.modules.flatMap(m => m.materials.map(mat => mat.toString()))).size;
      potentialRecords += activeEnrolledCount * uniqueMaterialsInCourse;
    });

    // If no enrollments exist, fallback to total students * total materials (legacy behavior)
    if (potentialRecords === 0) {
      potentialRecords = totalStudents * totalMaterials;
    }

    const notStartedCount = Math.max(0, potentialRecords - completedCount - inProgressCount);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalMaterials,
        completedCount,
        inProgressCount,
        notStartedCount,
        overallCompletionRate: potentialRecords > 0 ? Math.round((completedCount / potentialRecords) * 100) : 0,
        averageTimeSpent: totalProgressRecords > 0 ? Math.round(totalTimeSpent / totalProgressRecords) : 0,
        completionBySubject,
        mostViewedMaterials: mostViewed.map(m => ({
          _id: m._id,
          title: m.material.title,
          subject: m.material.subject,
          viewCount: m.viewCount,
          completions: m.completions,
        })),
        leastEngagedMaterials: leastEngaged,
        recentCompletions,
      },
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/analytics/students
// @desc    Per-student progress summary
// @access  Admin, Teacher
exports.getStudentAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'completion' } = req.query;

    // Build student query
    const studentQuery = { role: 'student', isActive: true };
    if (search) {
      studentQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const totalStudents = await User.countDocuments(studentQuery);
    const totalMaterials = await Material.countDocuments({ status: 'approved' });

    // Get students with their progress
    const students = await User.find(studentQuery)
      .select('name email studentId')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const studentIds = students.map(s => s._id);

    // Get progress for these students
    const progressData = await ContentProgress.aggregate([
      { $match: { student: { $in: studentIds } } },
      {
        $group: {
          _id: '$student',
          totalViewed: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          totalTimeSpent: { $sum: '$totalTimeSpent' },
          lastActivity: { $max: '$lastViewedAt' },
        },
      },
    ]);

    // Map progress data to students
    const progressMap = {};
    progressData.forEach(p => {
      progressMap[p._id.toString()] = p;
    });

    // Fetch all courses to determine material denominators per student
    const allCourses = await Course.find({ status: 'published' }).select('modules enrolledStudents');

    // Create Student Material Sets for filtering and denominator calculation
    const studentMaterialSets = {};
    studentIds.forEach(id => {
      const studentIdStr = id.toString();
      const materialSet = new Set();
      allCourses.forEach(course => {
        const isEnrolled = course.enrolledStudents.some(
          e => e.student && e.student.toString() === studentIdStr && e.status === 'active'
        );
        if (isEnrolled) {
          course.modules.forEach(mod => {
            mod.materials.forEach(matId => { if (matId) materialSet.add(matId.toString()); });
          });
        }
      });
      studentMaterialSets[studentIdStr] = materialSet;
    });

    // Fetch progress details to filter completions by enrollment
    const allProgressRecords = await ContentProgress.find({ student: { $in: studentIds }, status: 'completed' }).select('student material');

    let result = students.map(s => {
      const studentIdStr = s._id.toString();
      const progressSummary = progressMap[studentIdStr] || {
        totalViewed: 0,
        completed: 0,
        inProgress: 0,
        totalTimeSpent: 0,
        lastActivity: null,
      };
      
      const enrolledMaterialIds = studentMaterialSets[studentIdStr] || new Set();
      const denominator = enrolledMaterialIds.size || totalMaterials; 
      
      // Only count completions for materials the student is actually enrolled in
      const studentCompletions = allProgressRecords.filter(p => 
        p.student.toString() === studentIdStr && enrolledMaterialIds.has(p.material.toString())
      ).length;
      
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        studentId: s.studentId,
        totalViewed: progressSummary.totalViewed,
        completed: studentCompletions,
        inProgress: progressSummary.inProgress,
        totalTimeSpent: progressSummary.totalTimeSpent,
        lastActivity: progressSummary.lastActivity,
        completionPercentage: denominator > 0 ? Math.round((studentCompletions / denominator) * 100) : 0,
      };
    });

    // Sort
    if (sortBy === 'completion') {
      result.sort((a, b) => b.completionPercentage - a.completionPercentage);
    } else if (sortBy === 'time') {
      result.sort((a, b) => b.totalTimeSpent - a.totalTimeSpent);
    } else if (sortBy === 'recent') {
      result.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));
    }

    res.json({
      success: true,
      data: result,
      total: totalStudents,
      pages: Math.ceil(totalStudents / limit),
      page: Number(page),
      totalMaterials,
    });
  } catch (err) {
    console.error('Student analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/analytics/students/:studentId
// @desc    Detailed progress for specific student
// @access  Admin, Teacher
exports.getStudentDetailedProgress = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select('name email studentId');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const progress = await ContentProgress.find({ student: studentId })
      .populate('material', 'title subject module fileType')
      .sort({ lastViewedAt: -1 });

    const studentCourses = await Course.find({ 
      'enrolledStudents.student': studentId,
      'enrolledStudents.status': 'active',
      status: 'published'
    }).select('modules');
    
    const enrolledMaterialIds = new Set();
    studentCourses.forEach(course => {
      course.modules.forEach(mod => {
        mod.materials.forEach(matId => enrolledMaterialIds.add(matId.toString()));
      });
    });

    const totalMaterials = await Material.countDocuments({ status: 'approved' });
    const enrolledMaterialCount = enrolledMaterialIds.size || totalMaterials;
    
    // Accuracy Fix: Only count progress for materials the student is actually enrolled in
    const enrolledProgress = progress.filter(p => enrolledMaterialIds.size === 0 || enrolledMaterialIds.has(p.material._id.toString()));
    const completedCount = enrolledProgress.filter(p => p.status === 'completed').length;
    const inProgressCount = enrolledProgress.filter(p => p.status === 'in_progress').length;
    const totalTimeSpent = enrolledProgress.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0);

    res.json({
      success: true,
      data: {
        student,
        progress: enrolledProgress,
        summary: {
          totalMaterials: enrolledMaterialCount,
          completed: completedCount,
          inProgress: inProgressCount,
          completionPercentage: enrolledMaterialCount > 0 ? Math.round((completedCount / enrolledMaterialCount) * 100) : 0,
          totalTimeSpent,
        },
      },
    });
  } catch (err) {
    console.error('Student detailed progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/analytics/materials
// @desc    Per-material engagement analytics
// @access  Admin, Teacher
exports.getMaterialAnalytics = async (req, res) => {
  try {
    const { page = 1, limit = 20, subject = '', sortBy = 'views' } = req.query;

    const materialQuery = { status: 'approved' };
    if (subject) materialQuery.subject = subject;

    const totalMaterials = await Material.countDocuments(materialQuery);
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });

    const materials = await Material.find(materialQuery)
      .select('title subject module fileType downloadCount')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const materialIds = materials.map(m => m._id);

    // Get progress stats for these materials
    const progressData = await ContentProgress.aggregate([
      { $match: { material: { $in: materialIds } } },
      {
        $group: {
          _id: '$material',
          viewerIds: { $addToSet: '$student' },
          totalViews: { $sum: '$viewCount' },
          completedStudentIds: { $addToSet: { $cond: [{ $eq: ['$status', 'completed'] }, '$student', null] } },
          totalTimeSpent: { $sum: '$totalTimeSpent' },
        },
      },
      {
        $project: {
          _id: 1,
          totalViews: 1,
          totalTimeSpent: 1,
          uniqueViewers: { $size: '$viewerIds' },
          // filter out the null that $cond might have added to the set
          completions: {
            $size: {
              $filter: {
                input: '$completedStudentIds',
                as: 'id',
                cond: { $ne: ['$$id', null] }
              }
            }
          }
        }
      }
    ]);

    const progressMap = {};
    progressData.forEach(p => {
      progressMap[p._id.toString()] = p;
    });

    let result = materials.map(m => {
      const progress = progressMap[m._id.toString()] || {
        uniqueViewers: 0,
        totalViews: 0,
        completions: 0,
        totalTimeSpent: 0,
      };
      return {
        _id: m._id,
        title: m.title,
        subject: m.subject,
        module: m.module,
        fileType: m.fileType,
        downloadCount: m.downloadCount || 0,
        uniqueViewers: progress.uniqueViewers,
        totalViews: progress.totalViews,
        completions: progress.completions,
        completionRate: totalStudents > 0 ? Math.min(100, Math.round((progress.completions / totalStudents) * 100)) : 0,
        averageTimeSpent: progress.uniqueViewers > 0 ? Math.round(progress.totalTimeSpent / progress.uniqueViewers) : 0,
      };
    });

    // Sort
    if (sortBy === 'views') {
      result.sort((a, b) => b.totalViews - a.totalViews);
    } else if (sortBy === 'completions') {
      result.sort((a, b) => b.completions - a.completions);
    } else if (sortBy === 'time') {
      result.sort((a, b) => b.averageTimeSpent - a.averageTimeSpent);
    }

    // Get unique subjects for filter
    const subjects = await Material.distinct('subject', { status: 'approved' });

    res.json({
      success: true,
      data: result,
      total: totalMaterials,
      pages: Math.ceil(totalMaterials / limit),
      page: Number(page),
      subjects,
      totalStudents,
    });
  } catch (err) {
    console.error('Material analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/analytics/materials/:materialId
// @desc    Detailed analytics for specific material
// @access  Admin, Teacher
exports.getMaterialDetailedAnalytics = async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await Material.findById(materialId).select('title subject module fileType downloadCount');
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const materialIdObj = new mongoose.Types.ObjectId(materialId);

    const progressAggregation = await ContentProgress.aggregate([
      { $match: { material: materialIdObj } },
      { $sort: { lastViewedAt: -1 } },
      {
        $group: {
          _id: '$student',
          status: { 
            // Pick 'completed' if any record is completed
            $max: {
              $cond: [{ $eq: ['$status', 'completed'] }, 2, { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }]
            }
          },
          viewCount: { $sum: '$viewCount' },
          totalTimeSpent: { $sum: '$totalTimeSpent' },
          lastViewedAt: { $max: '$lastViewedAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          _id: 1,
          viewCount: 1,
          totalTimeSpent: 1,
          lastViewedAt: 1,
          'student.name': 1,
          'student.email': 1,
          'student.studentId': 1,
          status: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 2] }, then: 'completed' },
                { case: { $eq: ['$status', 1] }, then: 'in_progress' }
              ],
              default: 'not_started'
            }
          }
        }
      },
      { $sort: { lastViewedAt: -1 } }
    ]);

    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    
    // Count unique students who completed this material
    const completedCount = progressAggregation.filter(p => p.status === 'completed').length;
    
    // Count unique viewers
    const uniqueViewers = progressAggregation.length;
    
    const totalTimeSpentTotal = progressAggregation.reduce((sum, p) => sum + (p.totalTimeSpent || 0), 0);

    res.json({
      success: true,
      data: {
        material,
        progress: progressAggregation,
        summary: {
          totalStudents,
          uniqueViewers,
          completions: completedCount,
          completionRate: totalStudents > 0 ? Math.min(100, Math.round((completedCount / totalStudents) * 100)) : 0,
          averageTimeSpent: uniqueViewers > 0 ? Math.round(totalTimeSpentTotal / uniqueViewers) : 0,
        },
      },
    });
  } catch (err) {
    console.error('Material detailed analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/analytics/matrix
// @desc    Student-Content progress matrix
// @access  Admin, Teacher
exports.getProgressMatrix = async (req, res) => {
  try {
    const { subject = '', studentLimit = 50, materialLimit = 20 } = req.query;

    // Get students
    const students = await User.find({ role: 'student', isActive: true })
      .select('name email')
      .limit(Number(studentLimit))
      .sort({ name: 1 });

    // Get materials
    const materialQuery = { status: 'approved' };
    if (subject) materialQuery.subject = subject;

    const materials = await Material.find(materialQuery)
      .select('title subject')
      .limit(Number(materialLimit))
      .sort({ createdAt: -1 });

    const studentIds = students.map(s => s._id);
    const materialIds = materials.map(m => m._id);

    // Get all progress records for these students and materials
    const progressRecords = await ContentProgress.find({
      student: { $in: studentIds },
      material: { $in: materialIds },
    }).select('student material status totalTimeSpent');

    // Build matrix map
    const matrix = {};
    progressRecords.forEach(p => {
      const key = `${p.student}-${p.material}`;
      matrix[key] = {
        status: p.status,
        timeSpent: p.totalTimeSpent,
      };
    });

    // Get unique subjects for filter
    const subjects = await Material.distinct('subject', { status: 'approved' });

    res.json({
      success: true,
      data: {
        students,
        materials,
        matrix,
        subjects,
      },
    });
  } catch (err) {
    console.error('Progress matrix error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/analytics/export
// @desc    Export progress data as CSV/JSON
// @access  Admin
exports.exportProgressData = async (req, res) => {
  try {
    const { format = 'json', type = 'students' } = req.query;

    let data;

    if (type === 'students') {
      const students = await User.find({ role: 'student', isActive: true }).select('name email studentId');
      const studentIds = students.map(s => s._id);

      const progressData = await ContentProgress.aggregate([
        { $match: { student: { $in: studentIds } } },
        {
          $group: {
            _id: '$student',
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
            totalTimeSpent: { $sum: '$totalTimeSpent' },
          },
        },
      ]);

      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p._id.toString()] = p;
      });

      const totalMaterials = await Material.countDocuments({ status: 'approved' });

      data = students.map(s => {
        const progress = progressMap[s._id.toString()] || { completed: 0, inProgress: 0, totalTimeSpent: 0 };
        return {
          name: s.name,
          email: s.email,
          studentId: s.studentId,
          completed: progress.completed,
          inProgress: progress.inProgress,
          totalTimeMinutes: Math.round(progress.totalTimeSpent / 60),
          completionPercentage: totalMaterials > 0 ? Math.round((progress.completed / totalMaterials) * 100) : 0,
        };
      });
    } else {
      const materials = await Material.find({ status: 'approved' }).select('title subject');
      const materialIds = materials.map(m => m._id);

      const progressData = await ContentProgress.aggregate([
        { $match: { material: { $in: materialIds } } },
        {
          $group: {
            _id: '$material',
            viewers: { $sum: 1 },
            completions: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            totalTimeSpent: { $sum: '$totalTimeSpent' },
          },
        },
      ]);

      const progressMap = {};
      progressData.forEach(p => {
        progressMap[p._id.toString()] = p;
      });

      data = materials.map(m => {
        const progress = progressMap[m._id.toString()] || { viewers: 0, completions: 0, totalTimeSpent: 0 };
        return {
          title: m.title,
          subject: m.subject,
          uniqueViewers: progress.viewers,
          completions: progress.completions,
          averageTimeMinutes: progress.viewers > 0 ? Math.round(progress.totalTimeSpent / progress.viewers / 60) : 0,
        };
      });
    }

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {});
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=progress-${type}-${Date.now()}.csv`);
      return res.send(csv);
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ============================================
// COURSE PROGRESS ENDPOINTS
// ============================================

// @route   GET /api/progress/courses/my
// @desc    Get student's progress on all enrolled courses
// @access  Student only
exports.getMyCourseProgress = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get all courses the student is enrolled in
    const courses = await Course.find({
      'enrolledStudents.student': studentId,
      'enrolledStudents.status': 'active',
    })
      .populate('modules.materials', '_id title')
      .select('title code category modules enrolledStudents');

    // Get all progress records for this student (with course context)
    const allProgress = await ContentProgress.find({ student: studentId });

    // Build progress map keyed by "courseId-materialId"
    const progressMap = {};
    allProgress.forEach(p => {
      const courseKey = p.course ? p.course.toString() : 'standalone';
      const key = `${courseKey}-${p.material.toString()}`;
      progressMap[key] = p;
    });

    // Calculate progress for each course
    const courseProgress = courses.map(course => {
      let totalMaterials = 0;
      let completedMaterials = 0;
      let inProgressMaterials = 0;
      let totalTimeSpent = 0;

      const moduleProgress = course.modules.map(module => {
        const materials = module.materials || [];
        totalMaterials += materials.length;

        let moduleCompleted = 0;
        let moduleInProgress = 0;
        let moduleTimeSpent = 0;

        materials.forEach(mat => {
          // Look up progress for THIS specific course
          const key = `${course._id.toString()}-${mat._id.toString()}`;
          const progress = progressMap[key];
          if (progress) {
            if (progress.status === 'completed') {
              completedMaterials++;
              moduleCompleted++;
            } else if (progress.status === 'in_progress') {
              inProgressMaterials++;
              moduleInProgress++;
            }
            totalTimeSpent += progress.totalTimeSpent || 0;
            moduleTimeSpent += progress.totalTimeSpent || 0;
          }
        });

        return {
          _id: module._id,
          title: module.title,
          totalMaterials: materials.length,
          completed: moduleCompleted,
          inProgress: moduleInProgress,
          timeSpent: moduleTimeSpent,
          completionPercentage: materials.length > 0 ? Math.round((moduleCompleted / materials.length) * 100) : 0,
        };
      });

      const enrollment = course.enrolledStudents.find(
        e => e.student.toString() === studentId.toString()
      );

      return {
        _id: course._id,
        title: course.title,
        code: course.code,
        category: course.category,
        enrolledAt: enrollment?.enrolledAt,
        totalMaterials,
        completedMaterials,
        inProgressMaterials,
        totalTimeSpent,
        completionPercentage: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0,
        moduleProgress,
      };
    });

    res.json({ success: true, data: courseProgress });
  } catch (err) {
    console.error('Get my course progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/courses/:courseId
// @desc    Get student's progress on specific course
// @access  Student only
exports.getMyCourseDetailProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId)
      .populate('modules.materials', '_id title fileType contentType')
      .select('title code category modules');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Get all material IDs from course
    const materialIds = course.modules.flatMap(m => m.materials.map(mat => mat._id));

    // Get progress for these materials IN THIS COURSE specifically
    const progress = await ContentProgress.find({
      student: studentId,
      material: { $in: materialIds },
      course: courseId, // Only for this course
    });

    const progressMap = {};
    progress.forEach(p => {
      progressMap[p.material.toString()] = p;
    });

    // Build detailed progress
    let totalMaterials = 0;
    let completedMaterials = 0;
    let totalTimeSpent = 0;

    const moduleProgress = course.modules.map(module => {
      const materials = module.materials.map(mat => {
        totalMaterials++;
        const prog = progressMap[mat._id.toString()];
        if (prog?.status === 'completed') completedMaterials++;
        if (prog) totalTimeSpent += prog.totalTimeSpent || 0;

        return {
          _id: mat._id,
          title: mat.title,
          fileType: mat.fileType,
          contentType: mat.contentType,
          status: prog?.status || 'not_started',
          timeSpent: prog?.totalTimeSpent || 0,
          viewCount: prog?.viewCount || 0,
          completedAt: prog?.completedAt,
        };
      });

      const completed = materials.filter(m => m.status === 'completed').length;

      return {
        _id: module._id,
        title: module.title,
        description: module.description,
        materials,
        totalMaterials: materials.length,
        completed,
        completionPercentage: materials.length > 0 ? Math.round((completed / materials.length) * 100) : 0,
      };
    });

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          code: course.code,
          category: course.category,
        },
        totalMaterials,
        completedMaterials,
        totalTimeSpent,
        completionPercentage: totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0,
        moduleProgress,
      },
    });
  } catch (err) {
    console.error('Get course detail progress error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/analytics/courses
// @desc    Course-wise analytics overview
// @access  Admin, Teacher
exports.getCourseAnalytics = async (req, res) => {
  try {
    const courses = await Course.find({ status: 'published' })
      .populate('modules.materials', '_id')
      .select('title code category modules enrolledStudents');

    // Get all students and their progress (with course context)
    const students = await User.find({ role: 'student', isActive: true }).select('_id');
    const studentIds = students.map(s => s._id);

    const allProgress = await ContentProgress.find({ student: { $in: studentIds } });
    const progressMap = {};
    allProgress.forEach(p => {
      // Key includes course to track per-course progress
      const courseKey = p.course ? p.course.toString() : 'standalone';
      const key = `${p.student}-${courseKey}-${p.material}`;
      progressMap[key] = p;
    });

    const courseAnalytics = courses.map(course => {
      const materialIds = course.modules.flatMap(m => m.materials.map(mat => mat._id.toString()));
      const totalMaterials = materialIds.length;
      const enrolledStudents = course.enrolledStudents.filter(e => e.status === 'active');
      const enrolledCount = enrolledStudents.length;

      let totalCompletions = 0;
      let totalTimeSpent = 0;
      let studentsCompleted = 0;

      enrolledStudents.forEach(enrollment => {
        if (!enrollment.student) return; // Skip if student not found
        let studentCompleted = 0;
        materialIds.forEach(matId => {
          // Use course-specific key
          const key = `${enrollment.student._id}-${course._id.toString()}-${matId}`;
          const prog = progressMap[key];
          if (prog?.status === 'completed') {
            totalCompletions++;
            studentCompleted++;
          }
          if (prog) totalTimeSpent += prog.totalTimeSpent || 0;
        });
        if (studentCompleted === totalMaterials && totalMaterials > 0) {
          studentsCompleted++;
        }
      });

      const potentialCompletions = enrolledCount * totalMaterials;

      return {
        _id: course._id,
        title: course.title,
        code: course.code,
        category: course.category,
        totalMaterials,
        enrolledCount,
        totalCompletions,
        studentsCompleted,
        averageCompletion: potentialCompletions > 0 ? Math.round((totalCompletions / potentialCompletions) * 100) : 0,
        courseCompletionRate: enrolledCount > 0 ? Math.round((studentsCompleted / enrolledCount) * 100) : 0,
        totalTimeSpent,
        averageTimePerStudent: enrolledCount > 0 ? Math.round(totalTimeSpent / enrolledCount) : 0,
      };
    });

    // Sort by enrollment count
    courseAnalytics.sort((a, b) => b.enrolledCount - a.enrolledCount);

    res.json({ success: true, data: courseAnalytics });
  } catch (err) {
    console.error('Course analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @route   GET /api/progress/analytics/courses/:courseId
// @desc    Detailed analytics for specific course
// @access  Admin, Teacher
exports.getCourseDetailedAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('modules.materials', '_id title fileType')
      .populate('enrolledStudents.student', 'name email studentId')
      .select('title code category modules enrolledStudents');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Deduplicate material IDs to ensure accurate weighting
    const materialIds = [...new Set(course.modules.flatMap(m => m.materials.map(mat => mat._id.toString())))];

    const enrolledStudents = course.enrolledStudents.filter(e => e.status === 'active' && e.student);
    const studentIds = enrolledStudents.map(e => e.student._id);

    // Get all progress for these students and materials IN THIS COURSE
    const allProgress = await ContentProgress.find({
      student: { $in: studentIds },
      material: { $in: materialIds },
      course: courseId, // Only for this specific course
    });

    const progressMap = {};
    allProgress.forEach(p => {
      const key = `${p.student}-${p.material}`;
      progressMap[key] = p;
    });

    // Calculate per-student progress
    const studentProgress = enrolledStudents.map(enrollment => {
      const student = enrollment.student;
      let completed = 0;
      let inProgress = 0;
      let timeSpent = 0;

      materialIds.forEach(matId => {
        const key = `${student._id}-${matId}`;
        const prog = progressMap[key];
        if (prog?.status === 'completed') completed++;
        else if (prog?.status === 'in_progress') inProgress++;
        if (prog) timeSpent += prog.totalTimeSpent || 0;
      });

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        enrolledAt: enrollment.enrolledAt,
        completed,
        inProgress,
        notStarted: materialIds.length - completed - inProgress,
        timeSpent,
        completionPercentage: materialIds.length > 0 ? Math.round((completed / materialIds.length) * 100) : 0,
      };
    });

    // Sort by completion percentage
    studentProgress.sort((a, b) => b.completionPercentage - a.completionPercentage);

    // Calculate per-module analytics (using course-specific progress)
    const moduleAnalytics = course.modules.map(module => {
      const matIds = module.materials.map(m => m._id.toString());
      let totalCompletions = 0;
      let totalViews = 0;

      studentIds.forEach(studentId => {
        matIds.forEach(matId => {
          // Progress is already filtered by course, so just use student-material key
          const key = `${studentId}-${matId}`;
          const prog = progressMap[key];
          if (prog?.status === 'completed') totalCompletions++;
          if (prog?.viewCount) totalViews += prog.viewCount;
        });
      });

      const potentialCompletions = studentIds.length * matIds.length;

      return {
        _id: module._id,
        title: module.title,
        totalMaterials: matIds.length,
        totalCompletions,
        totalViews,
        completionRate: potentialCompletions > 0 ? Math.round((totalCompletions / potentialCompletions) * 100) : 0,
      };
    });

    // Summary stats
    const totalMaterials = materialIds.length;
    const totalCompletions = studentProgress.reduce((sum, s) => sum + s.completed, 0);
    const potentialCompletions = studentIds.length * totalMaterials;
    const studentsCompleted = studentProgress.filter(s => s.completionPercentage === 100).length;

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          code: course.code,
          category: course.category,
        },
        summary: {
          totalMaterials,
          enrolledStudents: studentIds.length,
          totalCompletions,
          averageCompletion: potentialCompletions > 0 ? Math.round((totalCompletions / potentialCompletions) * 100) : 0,
          studentsCompleted,
          courseCompletionRate: studentIds.length > 0 ? Math.round((studentsCompleted / studentIds.length) * 100) : 0,
        },
        studentProgress,
        moduleAnalytics,
      },
    });
  } catch (err) {
    console.error('Course detailed analytics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
