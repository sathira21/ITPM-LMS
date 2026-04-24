const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', credentials: true },
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join a ticket room for real-time chat
  socket.on('ticket:join', (ticketId) => {
    socket.join(`ticket:${ticketId}`);
  });

  // Leave a ticket room
  socket.on('ticket:leave', (ticketId) => {
    socket.leave(`ticket:${ticketId}`);
  });

  // Typing indicator
  socket.on('ticket:typing', ({ ticketId, user }) => {
    socket.to(`ticket:${ticketId}`).emit('ticket:typing', { ticketId, user });
  });

  socket.on('ticket:stopTyping', ({ ticketId, user }) => {
    socket.to(`ticket:${ticketId}`).emit('ticket:stopTyping', { ticketId, user });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/guardians',  require('./routes/guardians'));
app.use('/api/dashboard',  require('./routes/dashboard'));
app.use('/api/reports',    require('./routes/reports'));
app.use('/api/groups',     require('./routes/groups'));
app.use('/api/activity',   require('./routes/activity'));
app.use('/api/materials',  require('./routes/materials'));
app.use('/api/feedback',   require('./routes/feedback'));
app.use('/api/quiz',       require('./routes/quiz'));
app.use('/api/progress',   require('./routes/progress'));
app.use('/api/courses',           require('./routes/courses'));
app.use('/api/support-tickets',  require('./routes/supportTickets'));

app.get('/', (req, res) => res.json({ message: 'LMS ERM API Running' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
