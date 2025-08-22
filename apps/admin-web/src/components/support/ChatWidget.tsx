import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  AttachFile as AttachIcon,
  Phone as PhoneIcon,
  MoreVert as MoreIcon,
  SmartToy as MacroIcon,
} from '@mui/icons-material';

interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'customer' | 'agent' | 'system';
  content: string;
  timestamp: string;
  attachments?: any[];
}

interface ChatSession {
  id: string;
  customerId: string;
  orderId?: string;
  status: string;
  agentId?: string;
}

interface Macro {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface ChatWidgetProps {
  customerId: string;
  orderId?: string;
  customerInfo?: any;
  onClose?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'center';
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  customerId,
  orderId,
  customerInfo,
  onClose,
  position = 'bottom-right',
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [showMacros, setShowMacros] = useState(false);
  const [macros, setMacros] = useState<Macro[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    initializeChat();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    const newSocket = io('http://localhost:8009', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      
      // Join chat
      newSocket.emit('join_chat', {
        customerId,
        orderId,
        customerInfo,
      });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('session_created', (data) => {
      setSession(data.session);
    });

    newSocket.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      
      if (isMinimized && message.senderType === 'agent') {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('agent_joined', (data) => {
      const systemMessage: ChatMessage = {
        id: `sys_${Date.now()}`,
        senderId: 'system',
        senderType: 'system',
        content: `${data.agent.name} sohbete katıldı`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('user_typing', (data) => {
      if (data.userType === 'agent') {
        setAgentTyping(data.isTyping);
      }
    });

    newSocket.on('queued', (data) => {
      const systemMessage: ChatMessage = {
        id: `sys_${Date.now()}`,
        senderId: 'system',
        senderType: 'system',
        content: `Sırada ${data.position}. pozisyondasınız. Lütfen bekleyin.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    newSocket.on('call_escalated', (data) => {
      const systemMessage: ChatMessage = {
        id: `sys_${Date.now()}`,
        senderId: 'system',
        senderType: 'system',
        content: 'Talebiniz acil destek hattına yönlendirildi. Kısa süre içinde aranacaksınız.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    setSocket(newSocket);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !session) return;

    socket.emit('send_message', {
      sessionId: session.id,
      content: newMessage.trim(),
      messageType: 'text',
    });

    setNewMessage('');
    setIsTyping(false);
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      socket?.emit('typing', { sessionId: session?.id, isTyping: true });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket?.emit('typing', { sessionId: session?.id, isTyping: false });
    }, 3000);
  };

  const escalateToCall = () => {
    if (!socket || !session) return;

    socket.emit('escalate_call', {
      sessionId: session.id,
      reason: 'customer_request',
    });
  };

  const loadMacros = async () => {
    try {
      const response = await fetch('/api/chat/macros');
      const data = await response.json();
      setMacros(data.data || []);
    } catch (error) {
      console.error('Load macros error:', error);
    }
  };

  const useMacro = async (macroId: string) => {
    try {
      const response = await fetch(`/api/chat/macros/${macroId}/use`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variables: {
            customerName: customerInfo?.name || 'Müşteri',
            orderId: orderId || '',
          },
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setNewMessage(data.data.content);
      }
    } catch (error) {
      console.error('Use macro error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setUnreadCount(0);
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'bottom-left':
        return { bottom: 20, left: 20 };
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default:
        return { bottom: 20, right: 20 };
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isMinimized) {
    return (
      <Box
        sx={{
          position: 'fixed',
          ...getPositionStyles(),
          zIndex: 1000,
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Button
            variant="contained"
            onClick={toggleMinimize}
            sx={{
              borderRadius: '50%',
              width: 60,
              height: 60,
              minWidth: 60,
              bgcolor: '#667eea',
              '&:hover': { bgcolor: '#5a6fd8' },
            }}
          >
            💬
          </Button>
        </Badge>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        ...getPositionStyles(),
        width: 380,
        height: 500,
        zIndex: 1000,
      }}
    >
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#667eea',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.2)' }}>
              💬
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="600">
                Müşteri Desteği
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: isConnected ? '#2ed573' : '#ff4757',
                  }}
                />
                <Typography variant="caption">
                  {isConnected ? 'Bağlı' : 'Bağlanıyor...'}
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box>
            <IconButton size="small" sx={{ color: 'white' }} onClick={escalateToCall}>
              <PhoneIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: 'white' }} onClick={toggleMinimize}>
              <MoreIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 1,
            bgcolor: '#f8f9fa',
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.senderType === 'customer' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: message.senderType === 'customer' ? '#667eea' : '#fff',
                  color: message.senderType === 'customer' ? 'white' : 'text.primary',
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2">{message.content}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                    display: 'block',
                    textAlign: 'right',
                    mt: 0.5,
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
            </Box>
          ))}
          
          {agentTyping && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: '#fff',
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                  Destek temsilcisi yazıyor...
                </Typography>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Mesajınızı yazın..."
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              multiline
              maxRows={3}
            />
            <IconButton
              onClick={() => {
                loadMacros();
                setShowMacros(true);
              }}
              size="small"
            >
              <MacroIcon />
            </IconButton>
            <IconButton onClick={sendMessage} disabled={!newMessage.trim()}>
              <SendIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button size="small" startIcon={<AttachIcon />}>
              Dosya Ekle
            </Button>
            <Chip
              label={orderId ? `Sipariş: ${orderId.slice(-6)}` : 'Genel Destek'}
              size="small"
              color={orderId ? 'primary' : 'default'}
            />
          </Box>
        </Box>
      </Card>

      {/* Macros Dialog */}
      <Dialog open={showMacros} onClose={() => setShowMacros(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hızlı Yanıtlar</DialogTitle>
        <DialogContent>
          <List>
            {macros.map((macro) => (
              <ListItem key={macro.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    useMacro(macro.id);
                    setShowMacros(false);
                  }}
                >
                  <ListItemText
                    primary={macro.title}
                    secondary={macro.content.substring(0, 100) + '...'}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};