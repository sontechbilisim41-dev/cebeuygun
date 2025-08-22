import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  error,
}) => {
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Bağlantı Hatası</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${
      isConnected ? 'text-green-600' : 'text-gray-400'
    }`}>
      {isConnected ? (
        <Wifi className="w-5 h-5" />
      ) : (
        <WifiOff className="w-5 h-5" />
      )}
      <span className="text-sm font-medium">
        {isConnected ? 'Bağlı' : 'Bağlantı Kesildi'}
      </span>
    </div>
  );
};