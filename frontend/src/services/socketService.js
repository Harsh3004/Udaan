import { io } from 'socket.io-client';
import { store } from '../store';
import { setTypingStatus } from '../slices/chatSlice';

const SOCKET_URL = import.meta.env.VITE_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.isAuthenticated = false;
        this.currentCourseId = null;
        this.authToken = null;
    }

    connect(token) {
        if (token) {
            this.authToken = token;
        }

        if (this.socket) {
            if (this.authToken) {
                this.socket.auth = { token: this.authToken };
            }
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: { token: this.authToken },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
            this.isConnected = true;
            this.isAuthenticated = false;
            if (this.authToken) {
                this.socket.emit('authenticate', this.authToken);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.isConnected = false;
            this.isAuthenticated = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            this.isConnected = false;
        });

        this.socket.on('authenticated', (data) => {
            console.log('Socket authenticated:', data);
            this.isAuthenticated = true;

            if (this.currentCourseId) {
                this.socket.emit('join_course_chat', { courseId: this.currentCourseId });
            }
        });

        this.socket.on('auth_error', (data) => {
            console.error('Socket auth error:', data.message);
            this.disconnect();
        });

        // Listen for new messages
        this.socket.on('new_message', (data) => {
            console.log('New message received:', data);
        });

        // Listen for message deletions
        this.socket.on('message_deleted', (data) => {
            console.log('Message deleted:', data);
        });

        // Listen for typing indicators
        this.socket.on('user_typing', (data) => {
            console.log('User typing:', data);
            store.dispatch(setTypingStatus({
                courseId: data.courseId,
                userId: data.userId,
                isTyping: data.isTyping
            }));
        });

        // Listen for messages read
        this.socket.on('messages_read', (data) => {
            console.log('Messages read:', data);
        });

        return this.socket;
    }

    joinCourseChat(courseId) {
        if (!courseId) {
            return;
        }

        this.currentCourseId = courseId;

        const token = this.authToken || store.getState().auth.token;
        if (!this.socket && token) {
            this.connect(token);
        } else if (this.socket && token) {
            this.socket.auth = { token };
            this.authToken = token;
        }

        if (this.socket?.connected && this.isAuthenticated) {
            this.socket.emit('join_course_chat', { courseId });
        }
    }

    leaveCourseChat(courseId) {
        if (this.socket?.connected) {
            this.socket.emit('leave_course_chat', { courseId });
        }

        if (!courseId || this.currentCourseId === courseId) {
            this.currentCourseId = null;
        }
    }

    sendMessage(courseId, message) {
        if (this.socket?.connected) {
            this.socket.emit('send_message', { courseId, message });
        }
    }

    sendTypingIndicator(courseId, isTyping) {
        if (this.socket?.connected) {
            this.socket.emit('typing', { courseId, isTyping });
        }
    }

    markAsRead(courseId) {
        if (this.socket?.connected) {
            this.socket.emit('mark_read', { courseId });
        }
    }

    deleteMessage(courseId, messageId) {
        if (this.socket?.connected) {
            this.socket.emit('delete_message', { courseId, messageId });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.isConnected = false;
        this.isAuthenticated = false;
        this.currentCourseId = null;
        this.authToken = null;
    }

    isSocketConnected() {
        return this.isConnected && this.socket?.connected;
    }
}

export const socketService = new SocketService();
export default socketService;