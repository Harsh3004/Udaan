import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    pendingMessages: [],
    typingUsers: {},
    socketConnected: false,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setSocketConnected(state, action) {
            state.socketConnected = action.payload;
        },
        addPendingMessage(state, action) {
            state.pendingMessages.push(action.payload);
        },
        removePendingMessage(state, action) {
            state.pendingMessages = state.pendingMessages.filter(
                msg => msg.tempId !== action.payload
            );
        },
        setTypingStatus(state, action) {
            const { courseId, userId, isTyping } = action.payload;
            if (!state.typingUsers[courseId]) {
                state.typingUsers[courseId] = {};
            }
            if (isTyping) {
                state.typingUsers[courseId][userId] = true;
            } else {
                delete state.typingUsers[courseId][userId];
            }
        },
        clearTyping(state, action) {
            const { courseId } = action.payload;
            delete state.typingUsers[courseId];
        },
        updateConversations(state, action) {
        }
    }
});

export const {
    setSocketConnected,
    addPendingMessage,
    removePendingMessage,
    setTypingStatus,
    clearTyping,
    updateConversations
} = chatSlice.actions;
export default chatSlice.reducer;