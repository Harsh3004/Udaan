const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

function initSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL_DEV || process.env.CLIENT_URL_PROD || '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        // Authenticate user on connection
        socket.on('authenticate', (token) => {
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                socket.userId = decoded.id;
                socket.role = decoded.role;
                socket.userData = decoded;

                // Join user to their personal room
                socket.join(`user:${socket.userId}`);
                console.log(`User ${socket.userId} authenticated as ${socket.role}`);

                // Confirm authentication
                socket.emit('authenticated', { success: true, userId: socket.userId });
            } catch (error) {
                console.error('Socket authentication error:', error.message);
                socket.emit('auth_error', { message: 'Authentication failed' });
                socket.disconnect();
            }
        });

        // Join chat room for a specific course
        socket.on('join_course_chat', ({ courseId }) => {
            if (socket.userId) {
                socket.join(`course:${courseId}`);
                console.log(`User ${socket.userId} joined course chat: ${courseId}`);
            }
        });

        // Leave chat room
        socket.on('leave_course_chat', ({ courseId }) => {
            if (socket.userId) {
                socket.leave(`course:${courseId}`);
                console.log(`User ${socket.userId} left course chat: ${courseId}`);
            }
        });

        // Handle typing indicator
        socket.on('typing', ({ courseId, isTyping }) => {
            if (socket.userId && courseId) {
                // Broadcast to others in the course chat room (not self)
                socket.to(`course:${courseId}`).emit('user_typing', {
                    userId: socket.userId,
                    isTyping,
                    courseId
                });
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

// Function to emit event from controllers
function emitNewMessage(courseId, message) {
    if (io) {
        io.to(`course:${courseId}`).emit('new_message', {
            courseId,
            message,
            senderId: message.sender?._id || message.sender
        });
    }
}

function emitMessageDeleted(courseId, messageId, deletedBy) {
    if (io) {
        io.to(`course:${courseId}`).emit('message_deleted', {
            courseId,
            messageId,
            deletedBy
        });
    }
}

function emitMessagesRead(courseId, readBy) {
    if (io) {
        io.to(`course:${courseId}`).emit('messages_read', {
            courseId,
            readBy
        });
    }
}

function getIO() {
    return io;
}

module.exports = {
    initSocket,
    emitNewMessage,
    emitMessageDeleted,
    emitMessagesRead,
    getIO
};