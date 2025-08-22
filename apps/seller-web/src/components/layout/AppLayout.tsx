import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge, Button, Drawer, Typography } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  InboxOutlined,
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloudUploadOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/app-store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const { user, notifications, logout } = useAppStore();
  const { isConnected, error: wsError } = useWebSocket();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: t('menu.dashboard'),
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: t('menu.orders'),
    },
    {
      key: '/products',
      icon: <InboxOutlined />,
      label: t('menu.products'),
    },
    {
      key: '/bulk-operations',
      icon: <CloudUploadOutlined />,
      label: t('menu.bulkOperations'),
    },
    {
      key: '/campaigns',
      icon: <TagsOutlined />,
      label: t('menu.campaigns'),
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: t('menu.analytics'),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('menu.profile'),
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('menu.settings'),
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('menu.logout'),
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={240}
        style={{
          background: '#fff',
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #f0f0f0',
          textAlign: 'center',
        }}>
          <Text strong style={{ fontSize: collapsed ? '14px' : '18px' }}>
            {collapsed ? 'CB' : 'Cebeuygun'}
          </Text>
          {!collapsed && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Satıcı Paneli
            </div>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ border: 'none' }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px' }}
            />
            
            <ConnectionStatus isConnected={isConnected} error={wsError} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Badge count={unreadCount} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                onClick={() => setNotificationDrawerOpen(true)}
                style={{ fontSize: '16px' }}
              />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background-color 0.2s',
              }}>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text>{user?.firstName} {user?.lastName}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)',
        }}>
          <Outlet />
        </Content>
      </Layout>

      <Drawer
        title={t('notifications.title')}
        placement="right"
        onClose={() => setNotificationDrawerOpen(false)}
        open={notificationDrawerOpen}
        width={400}
      >
        <NotificationPanel />
      </Drawer>
    </Layout>
  );
};