const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Material = require('./models/Material');
const User = require('./models/User');

dotenv.config();

const sampleMaterials = [
  // Computer Science
  {
    title: 'Introduction to Programming - Lecture 1',
    description: 'Basic concepts of programming, variables, data types, and operators.',
    subject: 'Computer Science',
    module: 'Week 1: Programming Fundamentals',
    week: 1,
    contentType: 'file',
    fileType: 'pdf',
    fileName: 'intro-programming-lecture1.pdf',
    fileSize: 2500000,
    tags: ['programming', 'basics', 'lecture'],
  },
  {
    title: 'Python Basics Tutorial',
    description: 'Complete beginner tutorial for Python programming language.',
    subject: 'Computer Science',
    module: 'Week 2: Python Programming',
    week: 2,
    contentType: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    youtubeId: 'kqtD5dpn9C8',
    thumbnailUrl: 'https://img.youtube.com/vi/kqtD5dpn9C8/mqdefault.jpg',
    fileType: 'youtube',
    tags: ['python', 'tutorial', 'video'],
  },
  {
    title: 'Data Structures & Algorithms Guide',
    description: 'Comprehensive guide covering arrays, linked lists, trees, and graphs.',
    subject: 'Computer Science',
    module: 'Week 3: Data Structures',
    week: 3,
    contentType: 'file',
    fileType: 'pdf',
    fileName: 'dsa-guide.pdf',
    fileSize: 5200000,
    tags: ['dsa', 'algorithms', 'data structures'],
  },
  {
    title: 'Object Oriented Programming Slides',
    description: 'OOP concepts: Classes, Objects, Inheritance, Polymorphism, Encapsulation.',
    subject: 'Computer Science',
    module: 'Week 4: OOP Concepts',
    week: 4,
    contentType: 'file',
    fileType: 'ppt',
    fileName: 'oop-concepts.pptx',
    fileSize: 3800000,
    tags: ['oop', 'java', 'lecture', 'slides'],
  },

  // Database Systems
  {
    title: 'Database Design Fundamentals',
    description: 'Introduction to database concepts, ER diagrams, and normalization.',
    subject: 'Database Systems',
    module: 'Week 1: Database Basics',
    week: 1,
    contentType: 'file',
    fileType: 'pdf',
    fileName: 'db-fundamentals.pdf',
    fileSize: 1800000,
    tags: ['database', 'er diagram', 'normalization'],
  },
  {
    title: 'SQL Tutorial for Beginners',
    description: 'Learn SQL from scratch - SELECT, INSERT, UPDATE, DELETE operations.',
    subject: 'Database Systems',
    module: 'Week 2: SQL Basics',
    week: 2,
    contentType: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    youtubeId: 'HXV3zeQKqGY',
    thumbnailUrl: 'https://img.youtube.com/vi/HXV3zeQKqGY/mqdefault.jpg',
    fileType: 'youtube',
    tags: ['sql', 'tutorial', 'database'],
  },
  {
    title: 'MongoDB Documentation',
    description: 'Official MongoDB documentation and getting started guide.',
    subject: 'Database Systems',
    module: 'Week 5: NoSQL Databases',
    week: 5,
    contentType: 'link',
    externalUrl: 'https://docs.mongodb.com/manual/',
    fileType: 'link',
    tags: ['mongodb', 'nosql', 'documentation'],
  },

  // Mathematics
  {
    title: 'Calculus I - Limits and Derivatives',
    description: 'Introduction to limits, continuity, and basic derivatives.',
    subject: 'Mathematics',
    module: 'Week 1: Calculus Fundamentals',
    week: 1,
    contentType: 'file',
    fileType: 'pdf',
    fileName: 'calculus-limits.pdf',
    fileSize: 2100000,
    tags: ['calculus', 'limits', 'derivatives', 'math'],
  },
  {
    title: 'Linear Algebra Lecture Notes',
    description: 'Vectors, matrices, linear transformations, and eigenvalues.',
    subject: 'Mathematics',
    module: 'Week 3: Linear Algebra',
    week: 3,
    contentType: 'file',
    fileType: 'pdf',
    fileName: 'linear-algebra-notes.pdf',
    fileSize: 3500000,
    tags: ['linear algebra', 'matrices', 'vectors'],
  },
  {
    title: 'Statistics & Probability Basics',
    description: 'Mean, median, mode, standard deviation, probability distributions.',
    subject: 'Mathematics',
    module: 'Week 5: Statistics',
    week: 5,
    contentType: 'file',
    fileType: 'ppt',
    fileName: 'statistics-basics.pptx',
    fileSize: 2800000,
    tags: ['statistics', 'probability', 'math'],
  },

  // Web Development
  {
    title: 'HTML & CSS Crash Course',
    description: 'Learn HTML5 and CSS3 fundamentals in this comprehensive guide.',
    subject: 'Web Development',
    module: 'Week 1: Frontend Basics',
    week: 1,
    contentType: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=mU6anWqZJcc',
    youtubeId: 'mU6anWqZJcc',
    thumbnailUrl: 'https://img.youtube.com/vi/mU6anWqZJcc/mqdefault.jpg',
    fileType: 'youtube',
    tags: ['html', 'css', 'frontend', 'web'],
  },
  {
    title: 'JavaScript ES6+ Features',
    description: 'Modern JavaScript features: arrow functions, destructuring, promises, async/await.',
    subject: 'Web Development',
    module: 'Week 2: JavaScript',
    week: 2,
    contentType: 'file',
    fileType: 'pdf',
    fileName: 'javascript-es6.pdf',
    fileSize: 1500000,
    tags: ['javascript', 'es6', 'web'],
  },
  {
    title: 'React.js Official Documentation',
    description: 'Official React documentation - components, hooks, and best practices.',
    subject: 'Web Development',
    module: 'Week 4: React Framework',
    week: 4,
    contentType: 'link',
    externalUrl: 'https://react.dev/learn',
    fileType: 'link',
    tags: ['react', 'javascript', 'frontend'],
  },
  {
    title: 'Node.js & Express Tutorial',
    description: 'Build REST APIs with Node.js and Express framework.',
    subject: 'Web Development',
    module: 'Week 5: Backend Development',
    week: 5,
    contentType: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
    youtubeId: 'Oe421EPjeBE',
    thumbnailUrl: 'https://img.youtube.com/vi/Oe421EPjeBE/mqdefault.jpg',
    fileType: 'youtube',
    tags: ['nodejs', 'express', 'api', 'backend'],
  },

  // Software Engineering
  {
    title: 'Agile & Scrum Methodology',
    description: 'Introduction to Agile development, Scrum framework, sprints, and user stories.',
    subject: 'Software Engineering',
    module: 'Week 1: Development Methodologies',
    week: 1,
    contentType: 'file',
    fileType: 'ppt',
    fileName: 'agile-scrum.pptx',
    fileSize: 4200000,
    tags: ['agile', 'scrum', 'methodology'],
  },
  {
    title: 'Git & GitHub Tutorial',
    description: 'Version control with Git - branching, merging, pull requests.',
    subject: 'Software Engineering',
    module: 'Week 2: Version Control',
    week: 2,
    contentType: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
    youtubeId: 'RGOj5yH7evk',
    thumbnailUrl: 'https://img.youtube.com/vi/RGOj5yH7evk/mqdefault.jpg',
    fileType: 'youtube',
    tags: ['git', 'github', 'version control'],
  },
  {
    title: 'Software Testing Best Practices',
    description: 'Unit testing, integration testing, test-driven development (TDD).',
    subject: 'Software Engineering',
    module: 'Week 4: Testing',
    week: 4,
    contentType: 'file',
    fileType: 'pdf',
    fileName: 'testing-practices.pdf',
    fileSize: 1900000,
    tags: ['testing', 'tdd', 'unit test'],
  },

  // Networking
  {
    title: 'Computer Networks Fundamentals',
    description: 'OSI model, TCP/IP, networking protocols and architecture.',
    subject: 'Computer Networks',
    module: 'Week 1: Network Basics',
    week: 1,
    contentType: 'file',
    fileType: 'pdf',
    fileName: 'networks-fundamentals.pdf',
    fileSize: 3200000,
    tags: ['networking', 'osi', 'tcp/ip'],
  },
  {
    title: 'Network Security Essentials',
    description: 'Firewalls, encryption, VPNs, and security best practices.',
    subject: 'Computer Networks',
    module: 'Week 6: Network Security',
    week: 6,
    contentType: 'file',
    fileType: 'ppt',
    fileName: 'network-security.pptx',
    fileSize: 2600000,
    tags: ['security', 'firewall', 'encryption'],
  },

  // Operating Systems
  {
    title: 'Operating System Concepts',
    description: 'Process management, memory management, file systems.',
    subject: 'Operating Systems',
    module: 'Week 1: OS Fundamentals',
    week: 1,
    contentType: 'file',
    fileType: 'pdf',
    fileName: 'os-concepts.pdf',
    fileSize: 4500000,
    tags: ['os', 'process', 'memory'],
  },
  {
    title: 'Linux Command Line Tutorial',
    description: 'Essential Linux commands for developers and system administrators.',
    subject: 'Operating Systems',
    module: 'Week 3: Linux Basics',
    week: 3,
    contentType: 'youtube',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZtqBQ68cfJc',
    youtubeId: 'ZtqBQ68cfJc',
    thumbnailUrl: 'https://img.youtube.com/vi/ZtqBQ68cfJc/mqdefault.jpg',
    fileType: 'youtube',
    tags: ['linux', 'command line', 'terminal'],
  },
];

async function seedMaterials() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find an admin user to set as uploader
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      admin = await User.findOne({ role: 'teacher' });
    }
    if (!admin) {
      console.log('No admin or teacher found. Please create a user first.');
      process.exit(1);
    }

    console.log(`Using ${admin.name} (${admin.role}) as uploader`);

    // Clear existing sample materials (optional - comment out if you want to keep existing)
    // await Material.deleteMany({ uploadedBy: admin._id });

    // Insert materials
    const materials = sampleMaterials.map(m => ({
      ...m,
      academicYear: '2025',
      uploadedBy: admin._id,
      status: 'approved',
      approvedBy: admin._id,
      approvedAt: new Date(),
      downloadCount: Math.floor(Math.random() * 50),
      version: '1.0',
    }));

    const result = await Material.insertMany(materials);
    console.log(`✅ Successfully added ${result.length} materials!`);

    // Show summary
    const subjects = [...new Set(materials.map(m => m.subject))];
    console.log('\nMaterials by subject:');
    for (const subject of subjects) {
      const count = materials.filter(m => m.subject === subject).length;
      console.log(`  - ${subject}: ${count} materials`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding materials:', err);
    process.exit(1);
  }
}

seedMaterials();
