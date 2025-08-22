import React, { useState } from 'react';
import { 
  Card, 
  Tabs, 
  Upload, 
  Button, 
  Table, 
  Progress, 
  Tag, 
  Space, 
  Typography,
  Alert,
  Tooltip,
  Modal,
  List,
} from 'antd';
import { 
  CloudUploadOutlined, 
  DownloadOutlined, 
  FileExcelOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import type { BulkOperation } from '@/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export const BulkOperationsHub: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('upload');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<BulkOperation | null>(null);

  const {
    operations,
    isLoading,
    uploadProgress,
    uploadProductsCsv,
    uploadInventoryCsv,
    uploadPricingCsv,
    downloadTemplate,
    downloadResults,
    retryOperation,
    getOperationProgress,
    getOperationErrors,
    isUploading,
    isDownloadingTemplate,
    isDownloadingResults,
    isRetrying,
  } = useBulkOperations();

  const handleFileUpload = async (file: File, type: string) => {
    const uploadFunctions = {
      products: uploadProductsCsv,
      inventory: uploadInventoryCsv,
      pricing: uploadPricingCsv,
    };

    const uploadFn = uploadFunctions[type as keyof typeof uploadFunctions];
    if (!uploadFn) return false;

    try {
      await uploadFn(file, {
        onProgress: (progress) => {
          console.log(`Upload progress: ${progress}%`);
        },
        onSuccess: (operation) => {
          console.log('Upload successful:', operation);
          setActiveTab('operations'); // Switch to operations tab
        },
        onError: (error) => {
          console.error('Upload failed:', error);
        },
      });
      return false; // Prevent default upload behavior
    } catch (error) {
      return false;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <ClockCircleOutlined />,
      processing: <ReloadOutlined spin />,
      completed: <CheckCircleOutlined />,
      failed: <CloseCircleOutlined />,
    };
    return icons[status] || null;
  };

  const operationsColumns = [
    {
      title: t('bulk.fileName'),
      dataIndex: 'fileName',
      key: 'fileName',
      render: (fileName: string, record: BulkOperation) => (
        <div>
          <div style={{ fontWeight: 500 }}>{fileName}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.type.replace('_', ' ').toUpperCase()}
          </Text>
        </div>
      ),
    },
    {
      title: t('bulk.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {t(`bulk.status.${status}`)}
        </Tag>
      ),
    },
    {
      title: t('bulk.progress'),
      key: 'progress',
      width: 200,
      render: (record: BulkOperation) => {
        const progress = getOperationProgress(record.id);
        const isProcessing = record.status === 'processing';
        
        return (
          <div>
            <Progress 
              percent={progress} 
              size="small" 
              status={record.status === 'failed' ? 'exception' : 
                     record.status === 'completed' ? 'success' : 'active'}
              showInfo={false}
            />
            <div style={{ fontSize: '11px', marginTop: '2px' }}>
              {record.processedRows} / {record.totalRows} satır
              {isProcessing && ' (işleniyor...)'}
            </div>
          </div>
        );
      },
    },
    {
      title: t('bulk.results'),
      key: 'results',
      width: 150,
      render: (record: BulkOperation) => (
        <Space direction="vertical" size="small">
          <div style={{ fontSize: '12px' }}>
            <Text type="success">✓ {record.successRows}</Text>
            {record.errorRows > 0 && (
              <Text type="danger" style={{ marginLeft: '8px' }}>
                ✗ {record.errorRows}
              </Text>
            )}
          </div>
          {record.errorRows > 0 && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setSelectedOperation(record);
                setErrorModalOpen(true);
              }}
              style={{ padding: 0, height: 'auto' }}
            >
              Hataları Görüntüle
            </Button>
          )}
        </Space>
      ),
    },
    {
      title: t('bulk.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => (
        <div style={{ fontSize: '12px' }}>
          <div>{dayjs(createdAt).format('DD.MM.YYYY')}</div>
          <Text type="secondary">{dayjs(createdAt).format('HH:mm')}</Text>
        </div>
      ),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 150,
      render: (record: BulkOperation) => (
        <Space>
          {record.downloadUrl && (
            <Tooltip title={t('bulk.downloadResults')}>
              <Button
                type="text"
                icon={<DownloadOutlined />}
                onClick={() => downloadResults(record.id)}
                loading={isDownloadingResults}
                size="small"
              />
            </Tooltip>
          )}
          
          {record.status === 'failed' && (
            <Tooltip title={t('bulk.retry')}>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => retryOperation(record.id)}
                loading={isRetrying}
                size="small"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const uploadTabs = [
    {
      key: 'products',
      label: t('bulk.products'),
      children: (
        <div>
          <Alert
            message={t('bulk.productsUploadInfo')}
            description={t('bulk.productsUploadDescription')}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => downloadTemplate('products')}
              loading={isDownloadingTemplate}
            >
              {t('bulk.downloadTemplate')}
            </Button>

            <Dragger
              name="file"
              accept=".csv,.xlsx"
              beforeUpload={(file) => handleFileUpload(file, 'products')}
              showUploadList={false}
              disabled={isUploading}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">
                {t('bulk.dragDropText')}
              </p>
              <p className="ant-upload-hint">
                {t('bulk.supportedFormats')}
              </p>
            </Dragger>
          </Space>
        </div>
      ),
    },
    {
      key: 'inventory',
      label: t('bulk.inventory'),
      children: (
        <div>
          <Alert
            message={t('bulk.inventoryUploadInfo')}
            description={t('bulk.inventoryUploadDescription')}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => downloadTemplate('inventory')}
              loading={isDownloadingTemplate}
            >
              {t('bulk.downloadTemplate')}
            </Button>

            <Dragger
              name="file"
              accept=".csv,.xlsx"
              beforeUpload={(file) => handleFileUpload(file, 'inventory')}
              showUploadList={false}
              disabled={isUploading}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">
                {t('bulk.dragDropText')}
              </p>
              <p className="ant-upload-hint">
                {t('bulk.supportedFormats')}
              </p>
            </Dragger>
          </Space>
        </div>
      ),
    },
    {
      key: 'pricing',
      label: t('bulk.pricing'),
      children: (
        <div>
          <Alert
            message={t('bulk.pricingUploadInfo')}
            description={t('bulk.pricingUploadDescription')}
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Button
              icon={<DownloadOutlined />}
              onClick={() => downloadTemplate('pricing')}
              loading={isDownloadingTemplate}
            >
              {t('bulk.downloadTemplate')}
            </Button>

            <Dragger
              name="file"
              accept=".csv,.xlsx"
              beforeUpload={(file) => handleFileUpload(file, 'pricing')}
              showUploadList={false}
              disabled={isUploading}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">
                {t('bulk.dragDropText')}
              </p>
              <p className="ant-upload-hint">
                {t('bulk.supportedFormats')}
              </p>
            </Dragger>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>{t('bulk.title')}</Title>
      
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'upload',
            label: t('bulk.upload'),
            children: (
              <Card>
                <Tabs items={uploadTabs} />
              </Card>
            ),
          },
          {
            key: 'operations',
            label: t('bulk.operations'),
            children: (
              <Card>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px',
                }}>
                  <Title level={5} style={{ margin: 0 }}>
                    {t('bulk.recentOperations')}
                  </Title>
                  
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => window.location.reload()}
                    loading={isLoading}
                  >
                    {t('common.refresh')}
                  </Button>
                </div>

                <Table
                  columns={operationsColumns}
                  dataSource={operations}
                  rowKey="id"
                  loading={isLoading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                  }}
                  size="small"
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Error Details Modal */}
      <Modal
        title={t('bulk.errorDetails')}
        open={errorModalOpen}
        onCancel={() => {
          setErrorModalOpen(false);
          setSelectedOperation(null);
        }}
        footer={[
          <Button key="close" onClick={() => setErrorModalOpen(false)}>
            {t('common.close')}
          </Button>,
        ]}
        width={800}
      >
        {selectedOperation && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>{selectedOperation.fileName}</Text>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {selectedOperation.errorRows} hata / {selectedOperation.totalRows} toplam satır
              </div>
            </div>

            <List
              dataSource={getOperationErrors(selectedOperation.id)}
              renderItem={(error) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <div>
                        <Text strong>Satır {error.row}</Text>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Alan: {error.field}
                        </div>
                      </div>
                      <Tag color="red">{error.value}</Tag>
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '13px' }}>
                      {error.message}
                    </div>
                  </div>
                </List.Item>
              )}
              size="small"
              style={{ maxHeight: '400px', overflow: 'auto' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};