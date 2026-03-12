const Course = require('../models/Course');
const Material = require('../models/Material');
const ActivityLog = require('../models/ActivityLog');

const log = async (userId, action, details, req) => {
  try {
    await ActivityLog.create({ user: userId, action, category: 'course', details, ipAddress: req.ip });
  } catch {}
};

// ─────────────────────────────────────────────────────────────
// COURSE CRUD
// ─────────────────────────────────────────────────────────────

// @route  GET /api/courses
// @desc   Get all courses (filtered by role)
exports.getCourses = async (req, res) => {
  try {
    const { search, category, status, level, page = 1, limit = 12 } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      // Students see published courses OR courses they're enrolled in
      query.$or = [
        { status: 'published' },
        { 'enrolledStudents.student': req.user._id }
      ];
    } else if (req.user.role === 'teacher') {
      // Teachers see their own courses + published courses
      query.$or = [
        { instructors: req.user._id },
        { createdBy: req.user._id },
        { status: 'published' }
      ];
    }
    // Admin sees all

    if (search) {
      const searchQuery = { $regex: search, $options: 'i' };
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: searchQuery },
          { code: searchQuery },
          { description: searchQuery },
          { category: searchQuery },
          { tags: searchQuery },
        ]
      });
    }

    if (category) query.category = { $regex: category, $options: 'i' };
    if (status && req.user.role !== 'student') query.status = status;
    if (level) query.level = level;

    const total = await Course.countDocuments(query);
    const courses = await Course.find(query)
      .populate('createdBy', 'name email')
      .populate('instructors', 'name email')
      .select('-enrolledStudents') // Don't send full enrollment list
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Add enrollment status for students
    const coursesWithMeta = courses.map(c => {
      const course = c.toObject();
      if (req.user.role === 'student') {
        course.isEnrolled = c.enrolledStudents?.some(
          e => e.student.toString() === req.user._id.toString() && e.status === 'active'
        );
      }
      return course;
    });

    res.json({
      success: true,
      courses: coursesWithMeta,
      total,
      pages: Math.ceil(total / limit),
      page: Number(page)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/courses/my
// @desc   Get my enrolled courses (for students) or my teaching courses (for teachers)
exports.getMyCourses = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query = { 'enrolledStudents.student': req.user._id, 'enrolledStudents.status': 'active' };
    } else if (req.user.role === 'teacher') {
      query = { $or: [{ instructors: req.user._id }, { createdBy: req.user._id }] };
    } else {
      query = { createdBy: req.user._id };
    }

    const courses = await Course.find(query)
      .populate('createdBy', 'name')
      .populate('instructors', 'name')
      .sort({ updatedAt: -1 });

    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/courses/stats
// @desc   Get course statistics
exports.getStats = async (req, res) => {
  try {
    const [total, published, draft, archived, byCategory] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ status: 'published' }),
      Course.countDocuments({ status: 'draft' }),
      Course.countDocuments({ status: 'archived' }),
      Course.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    const totalEnrollments = await Course.aggregate([
      { $unwind: '$enrolledStudents' },
      { $match: { 'enrolledStudents.status': 'active' } },
      { $count: 'total' }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        published,
        draft,
        archived,
        totalEnrollments: totalEnrollments[0]?.total || 0,
        byCategory,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/courses/:id
// @desc   Get single course with full details
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('instructors', 'name email')
      .populate('modules.materials')
      .populate('enrolledStudents.student', 'name email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check access
    if (req.user.role === 'student') {
      const isEnrolled = course.enrolledStudents.some(
        e => e.student._id.toString() === req.user._id.toString()
      );
      if (course.status !== 'published' && !isEnrolled) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/courses
// @desc   Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { title, code, description, category, level, duration, credits, academicYear, semester, tags, maxStudents } = req.body;

    // Check if code already exists
    const existing = await Course.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }

    const course = await Course.create({
      title,
      code: code.toUpperCase(),
      description,
      category,
      level,
      duration,
      credits,
      academicYear,
      semester,
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      maxStudents: maxStudents || 0,
      createdBy: req.user._id,
      instructors: [req.user._id], // Creator is first instructor
      status: 'draft',
    });

    await course.populate('createdBy', 'name email');
    await course.populate('instructors', 'name email');

    await log(req.user._id, 'CREATE_COURSE', `Created course: ${title} (${code})`, req);

    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/courses/:id
// @desc   Update course details
exports.updateCourse = async (req, res) => {
  try {
    const { tags, ...rest } = req.body;
    const update = { ...rest };

    if (tags) {
      update.tags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('createdBy', 'name email')
      .populate('instructors', 'name email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/courses/:id/publish
// @desc   Publish a course
exports.publishCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await log(req.user._id, 'PUBLISH_COURSE', `Published course: ${course.title}`, req);
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/courses/:id/archive
// @desc   Archive a course
exports.archiveCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: 'archived', archivedAt: new Date() },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await log(req.user._id, 'ARCHIVE_COURSE', `Archived course: ${course.title}`, req);
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/courses/:id
// @desc   Delete a course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await Course.findByIdAndDelete(req.params.id);
    await log(req.user._id, 'DELETE_COURSE', `Deleted course: ${course.title}`, req);

    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// MODULE MANAGEMENT
// ─────────────────────────────────────────────────────────────

// @route  POST /api/courses/:id/modules
// @desc   Add a module to course
exports.addModule = async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const order = course.modules.length;
    course.modules.push({ title, description, order, materials: [], isPublished: false });
    await course.save();

    await course.populate('modules.materials');
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/courses/:id/modules/:moduleId
// @desc   Update a module
exports.updateModule = async (req, res) => {
  try {
    const { title, description, isPublished, order } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    if (title !== undefined) module.title = title;
    if (description !== undefined) module.description = description;
    if (isPublished !== undefined) module.isPublished = isPublished;
    if (order !== undefined) module.order = order;

    await course.save();
    await course.populate('modules.materials');

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/courses/:id/modules/:moduleId
// @desc   Delete a module
exports.deleteModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.modules.pull(req.params.moduleId);
    await course.save();

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/courses/:id/modules/reorder
// @desc   Reorder modules
exports.reorderModules = async (req, res) => {
  try {
    const { moduleIds } = req.body; // Array of module IDs in new order
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Update order for each module
    moduleIds.forEach((id, index) => {
      const module = course.modules.id(id);
      if (module) module.order = index;
    });

    // Sort modules by order
    course.modules.sort((a, b) => a.order - b.order);
    await course.save();

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// MATERIAL MANAGEMENT (within modules)
// ─────────────────────────────────────────────────────────────

// @route  POST /api/courses/:id/modules/:moduleId/materials
// @desc   Add material to module
exports.addMaterialToModule = async (req, res) => {
  try {
    const { materialId } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    // Check if material exists
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Add if not already in module
    if (!module.materials.includes(materialId)) {
      module.materials.push(materialId);
      await course.save();
    }

    await course.populate('modules.materials');
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/courses/:id/modules/:moduleId/materials/:materialId
// @desc   Remove material from module
exports.removeMaterialFromModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const module = course.modules.id(req.params.moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' });
    }

    module.materials.pull(req.params.materialId);
    await course.save();

    await course.populate('modules.materials');
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// ENROLLMENT MANAGEMENT
// ─────────────────────────────────────────────────────────────

// @route  POST /api/courses/:id/enroll
// @desc   Enroll in a course (student) or enroll students (admin/teacher)
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if enrollment is open
    if (!course.enrollmentOpen && req.user.role === 'student') {
      return res.status(400).json({ success: false, message: 'Enrollment is closed for this course' });
    }

    // Check max students
    const activeEnrollments = course.enrolledStudents.filter(e => e.status === 'active').length;
    if (course.maxStudents > 0 && activeEnrollments >= course.maxStudents) {
      return res.status(400).json({ success: false, message: 'Course is full' });
    }

    // Determine student ID (self-enroll or admin enrolling others)
    const studentId = req.body.studentId || req.user._id;

    // Check if already enrolled
    const existing = course.enrolledStudents.find(
      e => e.student.toString() === studentId.toString()
    );

    if (existing) {
      if (existing.status === 'active') {
        return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
      }
      // Re-enroll if dropped
      existing.status = 'active';
      existing.enrolledAt = new Date();
    } else {
      course.enrolledStudents.push({ student: studentId, status: 'active' });
    }

    await course.save();
    await log(req.user._id, 'ENROLL_COURSE', `Enrolled in: ${course.title}`, req);

    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/courses/:id/enroll/bulk
// @desc   Bulk enroll students (admin/teacher only)
exports.bulkEnroll = async (req, res) => {
  try {
    const { studentIds } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    let enrolled = 0;
    for (const studentId of studentIds) {
      const existing = course.enrolledStudents.find(
        e => e.student.toString() === studentId.toString()
      );

      if (!existing) {
        course.enrolledStudents.push({ student: studentId, status: 'active' });
        enrolled++;
      } else if (existing.status !== 'active') {
        existing.status = 'active';
        existing.enrolledAt = new Date();
        enrolled++;
      }
    }

    await course.save();
    await log(req.user._id, 'BULK_ENROLL', `Enrolled ${enrolled} students in: ${course.title}`, req);

    res.json({ success: true, message: `${enrolled} students enrolled` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/courses/:id/enroll
// @desc   Unenroll from course
exports.unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const studentId = req.body.studentId || req.user._id;
    const enrollment = course.enrolledStudents.find(
      e => e.student.toString() === studentId.toString()
    );

    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'Not enrolled in this course' });
    }

    enrollment.status = 'dropped';
    await course.save();

    await log(req.user._id, 'UNENROLL_COURSE', `Unenrolled from: ${course.title}`, req);
    res.json({ success: true, message: 'Unenrolled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/courses/:id/students
// @desc   Get enrolled students list
exports.getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents.student', 'name email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const students = course.enrolledStudents.map(e => ({
      ...e.student.toObject(),
      enrolledAt: e.enrolledAt,
      status: e.status,
    }));

    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// INSTRUCTOR MANAGEMENT
// ─────────────────────────────────────────────────────────────

// @route  POST /api/courses/:id/instructors
// @desc   Add instructor to course
exports.addInstructor = async (req, res) => {
  try {
    const { instructorId } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!course.instructors.includes(instructorId)) {
      course.instructors.push(instructorId);
      await course.save();
    }

    await course.populate('instructors', 'name email');
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/courses/:id/instructors/:instructorId
// @desc   Remove instructor from course
exports.removeInstructor = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.instructors.pull(req.params.instructorId);
    await course.save();

    await course.populate('instructors', 'name email');
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
