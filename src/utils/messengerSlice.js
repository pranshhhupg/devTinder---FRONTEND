import { createSlice } from '@reduxjs/toolkit';

/**
 * messengerSlice
 *
 * Holds:
 *  - conversations : array of { chatId, user, lastMessage, unreadCount, updatedAt }
 *                    sorted by most recent activity (backend sorts, we keep order)
 *  - totalUnread   : total unread message count across all conversations
 *                    (used for the NavBar red-dot badge)
 */
const messengerSlice = createSlice({
  name: 'messenger',
  initialState: {
    conversations: [],
    totalUnread: 0,
  },
  reducers: {
    // Set full conversation list (on initial load / refresh)
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.totalUnread = action.payload.reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      );
    },

    // Called when a new message arrives via socket (newMessageNotification)
    // Bumps unread count for the sender and moves them to the top
    bumpConversation: (state, action) => {
      const { fromUserId, fromFirstName, fromLastName, fromPhotoUrl, text, createdAt } =
        action.payload;

      const idx = state.conversations.findIndex(
        (c) => c.user?._id === fromUserId
      );

      if (idx !== -1) {
        const updated = {
          ...state.conversations[idx],
          lastMessage: { text, createdAt },
          unreadCount: (state.conversations[idx].unreadCount || 0) + 1,
          updatedAt: createdAt,
        };
        // Remove from current position and put at top
        state.conversations.splice(idx, 1);
        state.conversations.unshift(updated);
      } else {
        // New conversation we haven't loaded yet — prepend a stub
        state.conversations.unshift({
          chatId: null,
          user: {
            _id: fromUserId,
            firstName: fromFirstName,
            lastName: fromLastName,
            photoUrl: fromPhotoUrl,
          },
          lastMessage: { text, createdAt },
          unreadCount: 1,
          updatedAt: createdAt,
        });
      }

      state.totalUnread = state.conversations.reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      );
    },

    // Called when user opens a conversation — zero out unread for that user
    markConversationRead: (state, action) => {
      const { userId } = action.payload;
      const idx = state.conversations.findIndex(
        (c) => c.user?._id === userId
      );
      if (idx !== -1) {
        const prev = state.conversations[idx].unreadCount || 0;
        state.conversations[idx].unreadCount = 0;
        state.totalUnread = Math.max(0, state.totalUnread - prev);
      }
    },

    // Update last message for a conversation (sent by me — no unread bump)
    updateLastMessage: (state, action) => {
      const { targetUserId, text, createdAt } = action.payload;
      const idx = state.conversations.findIndex(
        (c) => c.user?._id === targetUserId
      );
      if (idx !== -1) {
        state.conversations[idx].lastMessage = { text, createdAt };
        state.conversations[idx].updatedAt = createdAt;
        // Move to top
        const updated = state.conversations.splice(idx, 1)[0];
        state.conversations.unshift(updated);
      }
    },

    clearMessenger: () => ({ conversations: [], totalUnread: 0 }),
  },
});

export const {
  setConversations,
  bumpConversation,
  markConversationRead,
  updateLastMessage,
  clearMessenger,
} = messengerSlice.actions;

export default messengerSlice.reducer;