import React from 'react';
import { List, Button, Typography, Empty, Badge, Space, Divider } from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined,
  ExternalLinkOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/app-store';
import type { Notification } from '@/types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;

export const NotificationPanel: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, markNotificationRead, clearNotifications } = useAppStore();

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      info: <BellOutlined style={{ color: '#1890ff' }} />,
      success: <CheckOutlined style={{ color: '#52c41a' }} />,
      warning: <ExternalLinkOutlined style={{ color: '#faad14' }} />,
      error: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
    };
    return icons[type] || <BellOutlined />;
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markNotificationRead(notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const renderNotification = (notification: Notification) => (
    <List.Item
      key={notification.id}
      style={{
        padding: '12px 16px',
        cursor: notification.actionUrl ? 'pointer' : 'default',
        backgroundColor: notification.read ? 'transparent' : '#f6ffed',
        borderLeft: notification.read ? 'none' : '3px solid #52c41a',
      }}
      onClick={() => handleNotificationClick(notification)}
    >
      <List.Item.Meta
        avatar={
          <Badge dot={!notification.read}>
            {getNotificationIcon(notification.type)}
          </Badge>
        }
        title={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
            <span style={{ 
              fontWeight: notification.read ? 'normal' : 'bold',
              fontSize: '14px',
            }}>
              {notification.title}
            </span>
            <Text type="secondary" style={{ fontSize: '11px' }}>
              {dayjs(notification.timestamp).fromNow()}
            </Text>
          </div>
        }
        description={
          <div>
            <div style={{ 
              fontSize: '13px',
              color: notification.read ? '#666' : '#333',
              marginBottom: '4px',
            }}>
              {notification.message}
            </div>
            {notification.actionUrl && (
              <Text type="secondary" style={{ fontSize: '11px' }}>
                <ExternalLinkOutlined style={{ marginRight: '4px' }} />
                {t('notifications.clickToView')}
              </Text>
            )}
          </div>
        }
      />
    </List.Item>
  );

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <Space>
          <Badge count={unreadNotifications.length} size="small">
            <BellOutlined />
          </Badge>
          <Text strong>{t('notifications.title')}</Text>
        </Space>
        
        {notifications.length > 0 && (
          <Button 
            type="text" 
            size="small"
            onClick={clearNotifications}
          >
            {t('notifications.clearAll')}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('notifications.empty')}
        />
      ) : (
        <div>
          {unreadNotifications.length > 0 && (
            <>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t('notifications.unread')} ({unreadNotifications.length})
              </Text>
              <List
                dataSource={unreadNotifications}
                renderItem={renderNotification}
                size="small"
                style={{ marginBottom: '16px' }}
              />
            </>
          )}

          {readNotifications.length > 0 && (
            <>
              {unreadNotifications.length > 0 && <Divider />}
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {t('notifications.read')} ({readNotifications.length})
              </Text>
              <List
                dataSource={readNotifications.slice(0, 10)} // Show only last 10 read
                renderItem={renderNotification}
                size="small"
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};