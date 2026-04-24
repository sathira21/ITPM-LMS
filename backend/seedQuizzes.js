require('dotenv').config();
const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const User = require('./models/User');

const QUIZZES = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of core JavaScript concepts including variables, data types, functions, and control flow.',
    subject: 'Web Development',
    module: 'Week 2 – JavaScript Basics',
    timeLimit: 15,
    passingScore: 60,
    allowRetake: true,
    maxAttempts: 3,
    isPublished: true,
    questions: [
      {
        type: 'mcq',
        question: 'Which keyword is used to declare a constant in JavaScript?',
        options: ['var', 'let', 'const', 'define'],
        correctAnswer: '2',
        explanation: 'The "const" keyword is used to declare constants that cannot be reassigned.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'What is the output of: typeof null?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correctAnswer: '2',
        explanation: 'This is a well-known JavaScript bug. typeof null returns "object" due to legacy reasons.',
        points: 2,
      },
      {
        type: 'true_false',
        question: 'JavaScript is a statically typed language.',
        correctAnswer: 'false',
        explanation: 'JavaScript is dynamically typed — variables can hold any type of value.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Which array method creates a new array with the results of calling a function on every element?',
        options: ['forEach()', 'filter()', 'map()', 'reduce()'],
        correctAnswer: '2',
        explanation: 'map() creates a new array by calling the provided function on each element.',
        points: 2,
      },
      {
        type: 'true_false',
        question: '"==" and "===" perform the same comparison in JavaScript.',
        correctAnswer: 'false',
        explanation: '"==" performs type coercion, while "===" checks both value and type.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'What will console.log(2 + "2") output?',
        options: ['4', '"22"', 'NaN', 'TypeError'],
        correctAnswer: '1',
        explanation: 'JavaScript concatenates when one operand is a string, resulting in "22".',
        points: 2,
      },
      {
        type: 'short_answer',
        question: 'What built-in method converts a JSON string to a JavaScript object?',
        correctAnswer: 'JSON.parse',
        explanation: 'JSON.parse() parses a JSON string and returns the corresponding JavaScript value.',
        points: 3,
      },
      {
        type: 'mcq',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['unshift()', 'push()', 'append()', 'concat()'],
        correctAnswer: '1',
        explanation: 'push() adds one or more elements to the end of an array and returns the new length.',
        points: 2,
      },
      {
        type: 'true_false',
        question: 'Arrow functions have their own "this" context.',
        correctAnswer: 'false',
        explanation: 'Arrow functions inherit "this" from the enclosing lexical scope.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'What does the spread operator (...) do?',
        options: ['Deletes array elements', 'Expands an iterable into individual elements', 'Creates a deep copy', 'Merges only objects'],
        correctAnswer: '1',
        explanation: 'The spread operator expands an iterable (array, string, etc.) into individual elements.',
        points: 2,
      },
    ],
  },

  {
    title: 'Database Design & SQL',
    description: 'Evaluate your understanding of relational database concepts, SQL queries, normalization, and data modeling.',
    subject: 'Database Systems',
    module: 'Week 4 – SQL & Relational Databases',
    timeLimit: 20,
    passingScore: 65,
    allowRetake: true,
    maxAttempts: 2,
    isPublished: true,
    questions: [
      {
        type: 'mcq',
        question: 'Which SQL statement is used to retrieve data from a database?',
        options: ['GET', 'SELECT', 'FETCH', 'RETRIEVE'],
        correctAnswer: '1',
        explanation: 'SELECT is the SQL command used to query and retrieve data from tables.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'What is a PRIMARY KEY?',
        options: ['The first column in a table', 'A column that uniquely identifies each row', 'An encrypted column', 'A column that allows NULL values'],
        correctAnswer: '1',
        explanation: 'A PRIMARY KEY uniquely identifies each record in a table and cannot be NULL.',
        points: 2,
      },
      {
        type: 'true_false',
        question: 'A FOREIGN KEY can reference a PRIMARY KEY in another table.',
        correctAnswer: 'true',
        explanation: 'Foreign keys establish relationships between tables by referencing primary keys.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Which normal form eliminates transitive dependencies?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: '2',
        explanation: 'Third Normal Form (3NF) eliminates transitive dependencies on non-key attributes.',
        points: 3,
      },
      {
        type: 'mcq',
        question: 'Which JOIN returns all records from both tables?',
        options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
        correctAnswer: '3',
        explanation: 'FULL OUTER JOIN returns all records when there is a match in either table.',
        points: 2,
      },
      {
        type: 'short_answer',
        question: 'What SQL clause is used to filter groups created by GROUP BY?',
        correctAnswer: 'HAVING',
        explanation: 'HAVING filters groups after GROUP BY, while WHERE filters individual rows before grouping.',
        points: 3,
      },
      {
        type: 'true_false',
        question: 'An INDEX speeds up data retrieval but can slow down INSERT operations.',
        correctAnswer: 'true',
        explanation: 'Indexes improve read performance but add overhead to write operations since the index must be updated.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'What does ACID stand for in database transactions?',
        options: ['Atomicity, Consistency, Isolation, Durability', 'Access, Control, Integrity, Data', 'Automatic, Concurrent, Isolated, Durable', 'Audit, Compliance, Integration, Design'],
        correctAnswer: '0',
        explanation: 'ACID ensures reliable processing of database transactions.',
        points: 2,
      },
    ],
  },

  {
    title: 'React.js Essentials',
    description: 'Challenge yourself on React components, hooks, state management, and the virtual DOM.',
    subject: 'Web Development',
    module: 'Week 6 – React Fundamentals',
    timeLimit: 20,
    passingScore: 60,
    allowRetake: true,
    maxAttempts: 3,
    isPublished: true,
    questions: [
      {
        type: 'mcq',
        question: 'What hook is used to manage state in a functional component?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: '1',
        explanation: 'useState is the primary hook for adding state to functional components.',
        points: 1,
      },
      {
        type: 'true_false',
        question: 'In React, props are read-only and cannot be modified by the child component.',
        correctAnswer: 'true',
        explanation: 'Props follow a one-way data flow from parent to child. Children cannot modify props directly.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'What does the virtual DOM help with?',
        options: ['Direct manipulation of HTML', 'Efficient re-rendering by diffing changes', 'Server-side rendering only', 'CSS animations'],
        correctAnswer: '1',
        explanation: 'The virtual DOM minimizes costly DOM updates by comparing old and new virtual trees and updating only what changed.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'Which hook is used for side effects like data fetching?',
        options: ['useState', 'useEffect', 'useMemo', 'useCallback'],
        correctAnswer: '1',
        explanation: 'useEffect is designed for side effects like API calls, subscriptions, and timers.',
        points: 2,
      },
      {
        type: 'short_answer',
        question: 'What is the name of the syntax extension that lets you write HTML-like code in JavaScript?',
        correctAnswer: 'JSX',
        explanation: 'JSX (JavaScript XML) allows writing HTML elements directly in JavaScript code.',
        points: 2,
      },
      {
        type: 'true_false',
        question: 'useEffect with an empty dependency array [] runs on every re-render.',
        correctAnswer: 'false',
        explanation: 'An empty dependency array causes useEffect to run only once after the initial render (like componentDidMount).',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'How do you pass data from a parent to a child component?',
        options: ['Using state', 'Using props', 'Using context only', 'Using event emitters'],
        correctAnswer: '1',
        explanation: 'Props (properties) are used to pass data from parent to child components.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'What is the correct way to conditionally render a component?',
        options: ['if-else inside JSX', '{condition && <Component />}', 'switch statement in render', 'All of the above can work'],
        correctAnswer: '3',
        explanation: 'React supports conditional rendering via ternary operators, && short-circuit, and even if-else before the return statement.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'Which hook provides a way to share values between components without prop drilling?',
        options: ['useState', 'useRef', 'useContext', 'useMemo'],
        correctAnswer: '2',
        explanation: 'useContext allows consuming context values, avoiding prop drilling through intermediate components.',
        points: 2,
      },
      {
        type: 'true_false',
        question: 'React components must always return a single root element.',
        correctAnswer: 'true',
        explanation: 'Components must return a single root element, though fragments (<></>) can be used to group multiple elements without an extra DOM node.',
        points: 1,
      },
    ],
  },

  {
    title: 'Python Programming Basics',
    description: 'Test your Python fundamentals including data types, control structures, functions, and OOP basics.',
    subject: 'Programming',
    module: 'Week 1 – Introduction to Python',
    timeLimit: 15,
    passingScore: 55,
    allowRetake: true,
    maxAttempts: 5,
    isPublished: true,
    questions: [
      {
        type: 'mcq',
        question: 'What is the output of: print(type([]))?',
        options: ["<class 'array'>", "<class 'list'>", "<class 'tuple'>", "<class 'set'>"],
        correctAnswer: '1',
        explanation: '[] creates a list in Python, so type([]) returns <class \'list\'>.',
        points: 1,
      },
      {
        type: 'true_false',
        question: 'Python uses indentation to define code blocks.',
        correctAnswer: 'true',
        explanation: 'Unlike many languages that use braces {}, Python uses indentation (whitespace) to define blocks.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Which keyword is used to create a function in Python?',
        options: ['function', 'func', 'def', 'lambda'],
        correctAnswer: '2',
        explanation: 'The "def" keyword is used to define a function in Python.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'What does the "self" parameter refer to in a class method?',
        options: ['The class itself', 'The instance of the class', 'The parent class', 'The module'],
        correctAnswer: '1',
        explanation: '"self" refers to the current instance of the class, allowing access to its attributes and methods.',
        points: 2,
      },
      {
        type: 'short_answer',
        question: 'What built-in function returns the number of elements in a list?',
        correctAnswer: 'len',
        explanation: 'len() returns the number of items in a container (list, string, dict, etc.).',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'What is a dictionary in Python?',
        options: ['An ordered sequence', 'A key-value pair collection', 'An immutable list', 'A set of unique values'],
        correctAnswer: '1',
        explanation: 'A dictionary stores data as key-value pairs, accessed by unique keys.',
        points: 2,
      },
      {
        type: 'true_false',
        question: 'Tuples are mutable in Python.',
        correctAnswer: 'false',
        explanation: 'Tuples are immutable — once created, their elements cannot be changed.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'What does "pip" stand for in Python?',
        options: ['Python Install Program', 'Pip Installs Packages', 'Package Installer for Python', 'Python Integrated Platform'],
        correctAnswer: '1',
        explanation: '"pip" is a recursive acronym that stands for "Pip Installs Packages".',
        points: 1,
      },
    ],
  },

  {
    title: 'Networking & Internet Fundamentals',
    description: 'Assess your understanding of OSI model, TCP/IP, HTTP protocols, DNS, and network security basics.',
    subject: 'Computer Networks',
    module: 'Week 3 – Network Protocols',
    timeLimit: 18,
    passingScore: 60,
    allowRetake: true,
    maxAttempts: 3,
    isPublished: true,
    questions: [
      {
        type: 'mcq',
        question: 'How many layers does the OSI model have?',
        options: ['4', '5', '6', '7'],
        correctAnswer: '3',
        explanation: 'The OSI (Open Systems Interconnection) model has 7 layers.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'Which protocol is used to resolve domain names to IP addresses?',
        options: ['FTP', 'DNS', 'DHCP', 'SMTP'],
        correctAnswer: '1',
        explanation: 'DNS (Domain Name System) translates human-readable domain names to IP addresses.',
        points: 2,
      },
      {
        type: 'true_false',
        question: 'HTTP is a stateless protocol.',
        correctAnswer: 'true',
        explanation: 'HTTP does not retain session information between requests. Cookies/sessions are used to maintain state.',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'What port does HTTPS use by default?',
        options: ['80', '8080', '443', '3000'],
        correctAnswer: '2',
        explanation: 'HTTPS uses port 443 by default, while HTTP uses port 80.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'Which layer of the OSI model handles routing?',
        options: ['Data Link', 'Network', 'Transport', 'Session'],
        correctAnswer: '1',
        explanation: 'The Network layer (Layer 3) handles logical addressing and routing (IP, ICMP).',
        points: 2,
      },
      {
        type: 'short_answer',
        question: 'What does TCP stand for?',
        correctAnswer: 'Transmission Control Protocol',
        explanation: 'TCP provides reliable, ordered delivery of data between applications.',
        points: 2,
      },
      {
        type: 'true_false',
        question: 'A firewall only protects against external threats.',
        correctAnswer: 'false',
        explanation: 'Firewalls can also control outbound traffic and protect against internal threats.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'What is the purpose of a subnet mask?',
        options: ['Encrypt network traffic', 'Divide a network into smaller segments', 'Speed up internet connection', 'Assign domain names'],
        correctAnswer: '1',
        explanation: 'A subnet mask defines the network portion and host portion of an IP address, enabling network segmentation.',
        points: 2,
      },
    ],
  },

  {
    title: 'Data Structures & Algorithms',
    description: 'Test your knowledge of arrays, linked lists, trees, sorting algorithms, and Big-O notation.',
    subject: 'Computer Science',
    module: 'Week 8 – DSA Fundamentals',
    timeLimit: 25,
    passingScore: 65,
    allowRetake: true,
    maxAttempts: 2,
    isPublished: true,
    questions: [
      {
        type: 'mcq',
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: '1',
        explanation: 'Binary search halves the search space each iteration, giving O(log n) time complexity.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'Which data structure follows FIFO (First In, First Out)?',
        options: ['Stack', 'Queue', 'Tree', 'Graph'],
        correctAnswer: '1',
        explanation: 'A Queue follows FIFO — the first element added is the first one removed.',
        points: 1,
      },
      {
        type: 'true_false',
        question: 'A stack follows LIFO (Last In, First Out) principle.',
        correctAnswer: 'true',
        explanation: 'Stacks use LIFO — the most recently added element is removed first (like a stack of plates).',
        points: 1,
      },
      {
        type: 'mcq',
        question: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correctAnswer: '2',
        explanation: 'QuickSort has O(n²) worst case when the pivot selection is poor (e.g., already sorted array with first element as pivot).',
        points: 3,
      },
      {
        type: 'mcq',
        question: 'Which traversal visits root → left → right?',
        options: ['Inorder', 'Preorder', 'Postorder', 'Level-order'],
        correctAnswer: '1',
        explanation: 'Preorder traversal visits the root first, then left subtree, then right subtree.',
        points: 2,
      },
      {
        type: 'short_answer',
        question: 'What data structure uses key-value pairs and provides O(1) average lookup time?',
        correctAnswer: 'Hash Table',
        explanation: 'Hash tables (hash maps) store key-value pairs and use hashing for O(1) average-case lookups.',
        points: 3,
      },
      {
        type: 'true_false',
        question: 'A balanced binary search tree guarantees O(log n) search time.',
        correctAnswer: 'true',
        explanation: 'Balanced BSTs (like AVL or Red-Black trees) maintain O(log n) height, ensuring efficient search.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'What is the space complexity of Merge Sort?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correctAnswer: '2',
        explanation: 'Merge Sort requires O(n) extra space for the temporary arrays used during merging.',
        points: 2,
      },
      {
        type: 'mcq',
        question: 'Which of the following is NOT a linear data structure?',
        options: ['Array', 'Linked List', 'Binary Tree', 'Queue'],
        correctAnswer: '2',
        explanation: 'A Binary Tree is a hierarchical (non-linear) data structure, unlike arrays, linked lists, and queues.',
        points: 2,
      },
      {
        type: 'true_false',
        question: 'BFS (Breadth-First Search) uses a stack.',
        correctAnswer: 'false',
        explanation: 'BFS uses a queue. DFS (Depth-First Search) uses a stack (or recursion).',
        points: 2,
      },
    ],
  },
];

async function seedQuizzes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the teacher/admin user to set as createdBy
    let creator = await User.findOne({ role: 'teacher' });
    if (!creator) creator = await User.findOne({ role: 'admin' });
    if (!creator) {
      console.error('No teacher or admin user found. Run seed.js first!');
      process.exit(1);
    }

    console.log(`Using creator: ${creator.name} (${creator.email})\n`);

    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes\n');

    for (const q of QUIZZES) {
      const quiz = await Quiz.create({ ...q, createdBy: creator._id });
      console.log(`✅ Created: ${quiz.title} (${quiz.questions.length} questions, ${quiz.totalPoints} pts, ${quiz.timeLimit}min)`);
    }

    console.log(`\n🎉 Done! ${QUIZZES.length} quizzes seeded successfully.`);
    console.log('\nQuizzes created:');
    QUIZZES.forEach((q, i) => console.log(`  ${i + 1}. ${q.title} — ${q.subject} — ${q.questions.length} questions`));
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seedQuizzes();
