
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api-client';

interface Message {
  id: number;
  user_id: number;
  customer_name: string;
  order_id?: number;
  product_id?: number;
  subject: string;
  message: string;
  sender_type: 'customer' | 'vendor';
  is_read: boolean;
  parent_message_id?: number;
  create_time: string;
  replies?: Message[];
}

interface MessageTemplate {
  id: number;
  title: string;
  content: string;
  category: string;
  usage_count: number;
}

interface MessagesState {
  messages: Message[];
  templates: MessageTemplate[];
  selectedMessage: Message | null;
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: MessagesState = {
  messages: [],
  templates: [],
  selectedMessage: null,
  loading: false,
  error: null,
  unreadCount: 0,
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (vendorId: number) => {
    const response = await api.get(`/vendor/${vendorId}/messages`);
    return response;
  }
);

export const fetchMessageTemplates = createAsyncThunk(
  'messages/fetchTemplates',
  async (vendorId: number) => {
    const response = await api.get(`/vendor/${vendorId}/message-templates`);
    return response;
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ vendorId, messageData }: { vendorId: number; messageData: any }) => {
    const response = await api.post(`/vendor/${vendorId}/messages`, messageData);
    return response;
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (messageId: number) => {
    const response = await api.put(`/vendor/messages/${messageId}/read`);
    return response;
  }
);

export const createTemplate = createAsyncThunk(
  'messages/createTemplate',
  async ({ vendorId, templateData }: { vendorId: number; templateData: any }) => {
    const response = await api.post(`/vendor/${vendorId}/message-templates`, templateData);
    return response;
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setSelectedMessage: (state, action: PayloadAction<Message | null>) => {
      state.selectedMessage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.data;
        state.unreadCount = action.payload.data.filter((m: Message) => !m.is_read).length;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Mesajlar yüklenemedi';
      })
      // Fetch templates
      .addCase(fetchMessageTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
      })
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.unshift(action.payload);
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index].is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Create template
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload);
      });
  },
});

export const { setSelectedMessage, clearError } = messagesSlice.actions;
export default messagesSlice.reducer;
