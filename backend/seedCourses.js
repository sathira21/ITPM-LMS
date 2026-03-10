const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Material = require('./models/Material');
const User = require('./models/User');

dotenv.config();

const sampleCourses = [
  {
    title: 'Introduction to Computer Science',
    code: 'CS101',
    description: 'Fundamental concepts of computer science including programming basics, data structures, algorithms, and problem-solving techniques.',
    category: 'Computer Science',
    level: 'beginner',
    duration: '12 weeks',
    credits: 3,
    semester: 'Fall 2025',
    tags: ['programming', 'basics', 'algorithms', 'computer science'],
    modules: [
      { title: 'Week 1: Programming Fundamentals', description: 'Variables, data types, operators, and basic I/O', order: 0 },
      { title: 'Week 2: Control Structures', description: 'If-else, loops, switch statements', order: 1 },
      { title: 'Week 3: Functions & Methods', description: 'Function declaration, parameters, return values', order: 2 },
      { title: 'Week 4: Arrays & Collections', description: 'Arrays, lists, and basic data structures', order: 3 },
    ],
  },
  {
    title: 'Database Management Systems',
    code: 'CS201',
    description: 'Learn database design, SQL, normalization, and modern database technologies including both relational and NoSQL databases.',
    category: 'Computer Science',
    level: 'intermediate',
    duration: '14 weeks',
    credits: 4,
    semester: 'Fall 2025',
    tags: ['database', 'sql', 'nosql', 'mongodb'],
    modules: [
      { title: 'Week 1: Database Concepts', description: 'Introduction to DBMS, data models', order: 0 },
      { title: 'Week 2: ER Diagrams', description: 'Entity-Relationship modeling', order: 1 },
      { title: 'Week 3: SQL Fundamentals', description: 'SELECT, INSERT, UPDATE, DELETE', order: 2 },
      { title: 'Week 4: Advanced SQL', description: 'JOINs, subqueries, aggregations', order: 3 },
      { title: 'Week 5: Normalization', description: '1NF, 2NF, 3NF, BCNF', order: 4 },
    ],
  },
  {
    title: 'Full Stack Web Development',
    code: 'WD301',
    description: 'Complete web development course covering HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects.',
    category: 'Web Development',
    level: 'intermediate',
    duration: '16 weeks',
    credits: 4,
    semester: 'Fall 2025',
    tags: ['web', 'react', 'nodejs', 'javascript', 'fullstack'],
    modules: [
      { title: 'Week 1-2: HTML & CSS', description: 'HTML5, CSS3, Flexbox, Grid', order: 0 },
      { title: 'Week 3-4: JavaScript Essentials', description: 'ES6+, DOM manipulation, async/await', order: 1 },
      { title: 'Week 5-6: React Fundamentals', description: 'Components, hooks, state management', order: 2 },
      { title: 'Week 7-8: Node.js & Express', description: 'REST APIs, middleware, authentication', order: 3 },
      { title: 'Week 9-10: MongoDB', description: 'CRUD operations, Mongoose, aggregation', order: 4 },
      { title: 'Week 11-12: Full Stack Project', description: 'Build a complete MERN application', order: 5 },
    ],
  },
  {
    title: 'Data Structures & Algorithms',
    code: 'CS202',
    description: 'Master essential data structures and algorithms. Learn arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming.',
    category: 'Computer Science',
    level: 'intermediate',
    duration: '14 weeks',
    credits: 4,
    semester: 'Spring 2025',
    tags: ['dsa', 'algorithms', 'data structures', 'programming'],
    modules: [
      { title: 'Week 1: Arrays & Strings', description: 'Array operations, string manipulation', order: 0 },
      { title: 'Week 2: Linked Lists', description: 'Singly, doubly, circular linked lists', order: 1 },
      { title: 'Week 3: Stacks & Queues', description: 'Implementation and applications', order: 2 },
      { title: 'Week 4: Trees', description: 'Binary trees, BST, AVL trees', order: 3 },
      { title: 'Week 5: Graphs', description: 'BFS, DFS, shortest path algorithms', order: 4 },
      { title: 'Week 6: Sorting Algorithms', description: 'Quick sort, merge sort, heap sort', order: 5 },
    ],
  },
  {
    title: 'Software Engineering Principles',
    code: 'SE301',
    description: 'Learn software development methodologies, design patterns, testing, version control, and project management.',
    category: 'Software Engineering',
    level: 'intermediate',
    duration: '12 weeks',
    credits: 3,
    semester: 'Fall 2025',
    tags: ['software engineering', 'agile', 'git', 'testing'],
    modules: [
      { title: 'Week 1: SDLC Models', description: 'Waterfall, Agile, Scrum, Kanban', order: 0 },
      { title: 'Week 2: Requirements Engineering', description: 'Gathering, analyzing, documenting requirements', order: 1 },
      { title: 'Week 3: System Design', description: 'UML diagrams, architecture patterns', order: 2 },
      { title: 'Week 4: Version Control', description: 'Git, GitHub, branching strategies', order: 3 },
      { title: 'Week 5: Testing', description: 'Unit testing, integration testing, TDD', order: 4 },
    ],
  },
  {
    title: 'Calculus for Engineers',
    code: 'MA101',
    description: 'Comprehensive calculus course covering limits, derivatives, integrals, and their applications in engineering.',
    category: 'Mathematics',
    level: 'beginner',
    duration: '14 weeks',
    credits: 4,
    semester: 'Fall 2025',
    tags: ['calculus', 'mathematics', 'engineering', 'derivatives'],
    modules: [
      { title: 'Week 1: Limits & Continuity', description: 'Definition of limits, limit laws', order: 0 },
      { title: 'Week 2: Derivatives', description: 'Differentiation rules, chain rule', order: 1 },
      { title: 'Week 3: Applications of Derivatives', description: 'Optimization, related rates', order: 2 },
      { title: 'Week 4: Integration', description: 'Definite and indefinite integrals', order: 3 },
      { title: 'Week 5: Applications of Integration', description: 'Area, volume, work', order: 4 },
    ],
  },
  {
    title: 'Computer Networks',
    code: 'CN301',
    description: 'Study network architectures, protocols, and security. Covers OSI model, TCP/IP, routing, and network administration.',
    category: 'Computer Networks',
    level: 'intermediate',
    duration: '12 weeks',
    credits: 3,
    semester: 'Spring 2025',
    tags: ['networking', 'tcp/ip', 'security', 'protocols'],
    modules: [
      { title: 'Week 1: Network Fundamentals', description: 'Types of networks, topologies', order: 0 },
      { title: 'Week 2: OSI Model', description: '7 layers and their functions', order: 1 },
      { title: 'Week 3: TCP/IP Protocol Suite', description: 'IP addressing, subnetting', order: 2 },
      { title: 'Week 4: Routing & Switching', description: 'Routers, switches, VLANs', order: 3 },
      { title: 'Week 5: Network Security', description: 'Firewalls, VPNs, encryption', order: 4 },
    ],
  },
  {
    title: 'Operating Systems',
    code: 'CS301',
    description: 'Understand operating system concepts including process management, memory management, file systems, and security.',
    category: 'Computer Science',
    level: 'advanced',
    duration: '14 weeks',
    credits: 4,
    semester: 'Fall 2025',
    tags: ['os', 'linux', 'process', 'memory management'],
    modules: [
      { title: 'Week 1: OS Introduction', description: 'Types of OS, system calls', order: 0 },
      { title: 'Week 2: Process Management', description: 'Processes, threads, scheduling', order: 1 },
      { title: 'Week 3: Synchronization', description: 'Mutex, semaphores, deadlocks', order: 2 },
      { title: 'Week 4: Memory Management', description: 'Paging, segmentation, virtual memory', order: 3 },
      { title: 'Week 5: File Systems', description: 'File organization, directory structure', order: 4 },
    ],
  },
  {
    title: 'Mobile App Development',
    code: 'MD401',
    description: 'Build cross-platform mobile applications using React Native. Learn UI design, navigation, APIs, and app deployment.',
    category: 'Mobile Development',
    level: 'intermediate',
    duration: '12 weeks',
    credits: 3,
    semester: 'Spring 2025',
    tags: ['mobile', 'react native', 'android', 'ios'],
    modules: [
      { title: 'Week 1: React Native Setup', description: 'Environment setup, first app', order: 0 },
      { title: 'Week 2: Components & Styling', description: 'Core components, StyleSheet', order: 1 },
      { title: 'Week 3: Navigation', description: 'Stack, tab, drawer navigation', order: 2 },
      { title: 'Week 4: State Management', description: 'Redux, Context API', order: 3 },
      { title: 'Week 5: API Integration', description: 'REST APIs, async storage', order: 4 },
    ],
  },
  {
    title: 'Artificial Intelligence Fundamentals',
    code: 'AI401',
    description: 'Introduction to AI concepts including machine learning, neural networks, natural language processing, and computer vision.',
    category: 'Artificial Intelligence',
    level: 'advanced',
    duration: '16 weeks',
    credits: 4,
    semester: 'Fall 2025',
    tags: ['ai', 'machine learning', 'deep learning', 'python'],
    modules: [
      { title: 'Week 1: Introduction to AI', description: 'History, applications, ethics', order: 0 },
      { title: 'Week 2: Machine Learning Basics', description: 'Supervised, unsupervised learning', order: 1 },
      { title: 'Week 3: Neural Networks', description: 'Perceptrons, activation functions', order: 2 },
      { title: 'Week 4: Deep Learning', description: 'CNNs, RNNs, transformers', order: 3 },
      { title: 'Week 5: NLP', description: 'Text processing, sentiment analysis', order: 4 },
      { title: 'Week 6: Computer Vision', description: 'Image classification, object detection', order: 5 },
    ],
  },
];

async function seedCourses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find admin/teacher user
    let instructor = await User.findOne({ role: 'admin' });
    if (!instructor) {
      instructor = await User.findOne({ role: 'teacher' });
    }
    if (!instructor) {
      console.log('No admin or teacher found. Please create a user first.');
      process.exit(1);
    }

    console.log(`Using ${instructor.name} (${instructor.role}) as instructor`);

    // Find some students to enroll
    const students = await User.find({ role: 'student' }).limit(5);
    console.log(`Found ${students.length} students to enroll`);

    // Get materials to link to modules
    const materials = await Material.find({ status: 'approved' }).limit(50);
    console.log(`Found ${materials.length} materials to link`);

    // Create courses
    let createdCount = 0;
    for (const courseData of sampleCourses) {
      // Check if course already exists
      const existing = await Course.findOne({ code: courseData.code });
      if (existing) {
        console.log(`  - ${courseData.code} already exists, skipping...`);
        continue;
      }

      // Find relevant materials for this course
      const relevantMaterials = materials.filter(m =>
        m.subject.toLowerCase().includes(courseData.category.toLowerCase()) ||
        courseData.tags.some(tag => m.tags.includes(tag))
      );

      // Add materials to modules
      const modulesWithMaterials = courseData.modules.map((mod, idx) => ({
        ...mod,
        isPublished: true,
        materials: relevantMaterials.slice(idx * 2, idx * 2 + 2).map(m => m._id),
      }));

      // Random enrollments
      const enrollments = students.slice(0, Math.floor(Math.random() * students.length) + 1).map(s => ({
        student: s._id,
        enrolledAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        status: 'active',
      }));

      const course = await Course.create({
        ...courseData,
        modules: modulesWithMaterials,
        academicYear: '2025',
        createdBy: instructor._id,
        instructors: [instructor._id],
        enrolledStudents: enrollments,
        status: 'published',
        publishedAt: new Date(),
        maxStudents: 50,
        enrollmentOpen: true,
      });

      console.log(`  ✓ Created: ${course.code} - ${course.title}`);
      createdCount++;
    }

    console.log(`\n✅ Successfully created ${createdCount} courses!`);

    // Show summary
    const allCourses = await Course.find();
    const categories = [...new Set(allCourses.map(c => c.category))];
    console.log('\nCourses by category:');
    for (const cat of categories) {
      const count = allCourses.filter(c => c.category === cat).length;
      console.log(`  - ${cat}: ${count} courses`);
    }

    const totalModules = allCourses.reduce((sum, c) => sum + c.modules.length, 0);
    const totalEnrollments = allCourses.reduce((sum, c) => sum + c.enrolledStudents.length, 0);
    console.log(`\nTotal modules: ${totalModules}`);
    console.log(`Total enrollments: ${totalEnrollments}`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding courses:', err);
    process.exit(1);
  }
}

seedCourses();
