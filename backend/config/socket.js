const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const allowedOrigins = [
    process.env.CLIENT_URL_DEV,
    process.env.CLIENT_URL_PROD
].filter(Boolean);

function initSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: allowedOrigins.length > 0 ? allowedOrigins : false,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {

        socket.on('authenticate', (token) => {
            try {
                const decoded = jwt.verify(token, process.env.SECRET_KEY);
                socket.userId = decoded.id;
                socket.role = decoded.role;
                socket.userData = decoded;

                socket.join(`user:${socket.userId}`);

                socket.emit('authenticated', { success: true, userId: socket.userId });
            } catch (error) {
                console.error('Socket auth error:', error.message);
                socket.emit('auth_error', { message: 'Authentication failed' });
                socket.disconnect();
            }
        });

        socket.on('join_course_chat', ({ courseId }) => {
            if (socket.userId) {
                socket.join(`course:${courseId}`);
            }
        });

        socket.on('leave_course_chat', ({ courseId }) => {
            if (socket.userId) {
                socket.leave(`course:${courseId}`);
            }
        });

        socket.on('typing', ({ courseId, isTyping }) => {
            if (socket.userId && courseId) {
                socket.to(`course:${courseId}`).emit('user_typing', {
                    userId: socket.userId,
                    isTyping,
                    courseId
                });
            }
        });

        socket.on('disconnect', () => {
            // connection lifecycle managed by Socket.IO internally
        });
    });

    return io;
}

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