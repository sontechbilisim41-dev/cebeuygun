import React from 'react';
import { Badge, Tooltip } from 'antd';
import { WifiOutlined, DisconnectOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface ConnectionStatusProps {
  isConnected: boolean;
  error?: string | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  error,
}) => {
  const { t } = useTranslation();

  const getStatus = () => {
    if (error) {
      return {
        status: 'error' as const,
        icon: <ExclamationCircleOutlined />,
        text: t('connection.error'),
        tooltip: error,
      };
    }

    if (isConnected) {
      return {
        status: 'success' as const,
        icon: <WifiOutlined />,
        text: t('connection.connected'),
        tooltip: t('connection.realTimeActive'),
      };
    }

    return {
      status: 'default' as const,
      icon: <DisconnectOutlined />,
      text: t('connection.disconnected'),
      tooltip: t('connection.reconnecting'),
    };
  };

  const { status, icon, text, tooltip } = getStatus();

  return (
    <Tooltip title={tooltip}>
      <Badge status={status} text={
        <span style={{ 
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          {icon}
          {text}
        </span>
      } />
    </Tooltip>
  );
};