import React from 'react';
import { Modal, Form, Select, Input, Alert, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import type { Order, OrderStatus, OrderStatusUpdateForm } from '@/types';

interface OrderStatusModalProps {
  open: boolean;
  order: Order | null;
  onCancel: () => void;
  onSubmit: (orderId: string, status: OrderStatus, notes?: string) => Promise<void>;
}

export const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  open,
  order,
  onCancel,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<OrderStatusUpdateForm>();
  const [loading, setLoading] = React.useState(false);

  const statusOptions = [
    { value: 'confirmed', label: t('order.status.confirmed'), disabled: false },
    { value: 'preparing', label: t('order.status.preparing'), disabled: false },
    { value: 'ready', label: t('order.status.ready'), disabled: false },
    { value: 'dispatched', label: t('order.status.dispatched'), disabled: true }, // Courier updates this
    { value: 'delivered', label: t('order.status.delivered'), disabled: true }, // Courier updates this
    { value: 'cancelled', label: t('order.status.cancelled'), disabled: false },
  ];

  const getAvailableStatuses = (currentStatus: OrderStatus): typeof statusOptions => {
    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['cancelled'], // Courier will update to dispatched
      dispatched: [], // Only courier can update
      delivered: [], // Final state
      cancelled: [], // Final state
    };

    const availableStatuses = statusFlow[currentStatus] || [];
    
    return statusOptions.map(option => ({
      ...option,
      disabled: !availableStatuses.includes(option.value as OrderStatus),
    }));
  };

  const handleSubmit = async () => {
    if (!order) return;

    try {
      setLoading(true);
      const values = await form.validateFields();
      await onSubmit(order.id, values.status, values.notes);
      form.resetFields();
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  React.useEffect(() => {
    if (open && order) {
      form.setFieldsValue({
        status: order.status,
        notes: '',
      });
    }
  }, [open, order, form]);

  if (!order) return null;

  const availableStatuses = getAvailableStatuses(order.status);
  const hasAvailableStatuses = availableStatuses.some(s => !s.disabled);

  return (
    <Modal
      title={t('order.updateStatus')}
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('common.update')}
      cancelText={t('common.cancel')}
      okButtonProps={{ disabled: !hasAvailableStatuses }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <div style={{ marginBottom: '8px' }}>
            <strong>{t('order.orderNumber')}:</strong> #{order.orderNumber}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>{t('order.customer')}:</strong> {order.customerName}
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>{t('order.currentStatus')}:</strong>{' '}
            <span style={{ color: '#1890ff' }}>
              {statusTexts[order.status]}
            </span>
          </div>
        </div>

        {!hasAvailableStatuses && (
          <Alert
            message={t('order.noStatusUpdatesAvailable')}
            description={t('order.statusUpdateDescription')}
            type="info"
            showIcon
          />
        )}

        {hasAvailableStatuses && (
          <Form form={form} layout="vertical">
            <Form.Item
              name="status"
              label={t('order.newStatus')}
              rules={[{ required: true, message: t('order.statusRequired') }]}
            >
              <Select placeholder={t('order.selectStatus')}>
                {availableStatuses.map(option => (
                  <Select.Option 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="notes"
              label={t('order.notes')}
            >
              <Input.TextArea
                rows={3}
                placeholder={t('order.notesPlaceholder')}
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        )}
      </Space>
    </Modal>
  );
};