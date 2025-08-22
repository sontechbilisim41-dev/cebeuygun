import React from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import {
  Typography,
  Box,
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  Cancel as CancelIcon,
  Schedule as PendingIcon,
  LocalShipping as DeliveryIcon,
  Restaurant as PreparingIcon,
  Assignment as ReceivedIcon,
} from '@mui/icons-material';

interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

interface OrderTimelineProps {
  timeline: TimelineEvent[];
  currentStatus: string;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ 
  timeline, 
  currentStatus 
}) => {
  const getStatusIcon = (status: string, isCompleted: boolean) => {
    const iconProps = {
      fontSize: 'small' as const,
      color: isCompleted ? 'inherit' : 'disabled' as const,
    };

    switch (status) {
      case 'received':
        return <ReceivedIcon {...iconProps} />;
      case 'preparing':
        return <PreparingIcon {...iconProps} />;
      case 'ready':
        return <CheckCircle {...iconProps} />;
      case 'delivering':
        return <DeliveryIcon {...iconProps} />;
      case 'delivered':
        return <CompletedIcon {...iconProps} />;
      case 'cancelled':
        return <CancelIcon {...iconProps} />;
      default:
        return <PendingIcon {...iconProps} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'received': return 'Sipariş Alındı';
      case 'preparing': return 'Hazırlanıyor';
      case 'ready': return 'Hazır';
      case 'delivering': return 'Teslim Ediliyor';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getStatusColor = (status: string, isCompleted: boolean) => {
    if (!isCompleted) return 'grey';
    
    switch (status) {
      case 'received': return 'info';
      case 'preparing': return 'warning';
      case 'ready': return 'primary';
      case 'delivering': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'grey';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determine which events are completed
  const statusOrder = ['received', 'preparing', 'ready', 'delivering', 'delivered'];
  const currentStatusIndex = statusOrder.indexOf(currentStatus);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📋 Sipariş Zaman Çizelgesi
      </Typography>
      
      <Timeline position="right">
        {timeline.map((event, index) => {
          const eventStatusIndex = statusOrder.indexOf(event.status);
          const isCompleted = eventStatusIndex <= currentStatusIndex;
          const isActive = event.status === currentStatus;
          
          return (
            <TimelineItem key={index}>
              <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
                <Typography variant="caption">
                  {formatTime(event.timestamp)}
                </Typography>
              </TimelineOppositeContent>
              
              <TimelineSeparator>
                <TimelineDot 
                  color={getStatusColor(event.status, isCompleted) as any}
                  variant={isActive ? 'filled' : isCompleted ? 'filled' : 'outlined'}
                  sx={{ 
                    p: 1,
                    border: isActive ? 3 : 1,
                    borderColor: isActive ? 'primary.main' : 'inherit',
                  }}
                >
                  {getStatusIcon(event.status, isCompleted)}
                </TimelineDot>
                {index < timeline.length - 1 && (
                  <TimelineConnector 
                    sx={{ 
                      bgcolor: isCompleted ? 'primary.main' : 'grey.300',
                      width: 2,
                    }} 
                  />
                )}
              </TimelineSeparator>
              
              <TimelineContent sx={{ flex: 1 }}>
                <Typography 
                  variant="body1" 
                  fontWeight={isActive ? 700 : 600}
                  color={isActive ? 'primary.main' : 'text.primary'}
                >
                  {getStatusText(event.status)}
                </Typography>
                {event.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {event.note}
                  </Typography>
                )}
                {isActive && (
                  <Box sx={{ 
                    display: 'inline-block', 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    px: 1, 
                    py: 0.5, 
                    borderRadius: 1, 
                    fontSize: '0.75rem',
                    mt: 0.5,
                  }}>
                    Mevcut Durum
                  </Box>
                )}
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Box>
  );
};