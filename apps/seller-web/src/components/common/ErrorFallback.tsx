import React from 'react';
import { Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const { t } = useTranslation();

  return (
    <Result
      status="500"
      title="Bir hata oluştu"
      subTitle="Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin."
      extra={
        <Button type="primary" onClick={resetErrorBoundary}>
          Sayfayı Yenile
        </Button>
      }
    >
      {import.meta.env.DEV && (
        <div style={{ 
          textAlign: 'left', 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '4px',
          marginTop: '16px',
        }}>
          <pre style={{ fontSize: '12px', margin: 0 }}>
            {error.message}
            {error.stack}
          </pre>
        </div>
      )}
    </Result>
  );
};