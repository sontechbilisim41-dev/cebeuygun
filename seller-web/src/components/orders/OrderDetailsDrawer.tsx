import React from 'react';
import { 
  Drawer, 
  Descriptions, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Divider,
  Timeline,
  Card,
  Button,
} from 'antd';
import { 
  PhoneOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Order, OrderItem } from '@/types';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface OrderDetailsDrawerProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  open,
  order,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!order) return null;

  const itemColumns = [
    {
      title: t('order.product'),
      key: 'product',
      render: (item: OrderItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{item.productName}</div>
          {item.variantName && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {item.variantName}
            </Text>
          )}
          {item.notes && (
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
              {item.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('order.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center' as const,
    },
    {
      title: t('order.unitPrice'),
      key: 'unitPrice',
      width: 100,
      align: 'right' as const,
      render: (item: OrderItem) => (
        `${(item.unitPrice.amount / 100).toFixed(2)} ${item.unitPrice.currency}`
      ),
    },
    {
      title: t('order.totalPrice'),
      key: 'totalPrice',
      width: 100,
      align: 'right' as const,
      render: (item: OrderItem) => (
        <strong>
          {(item.totalPrice.amount / 100).toFixed(2)} {item.totalPrice.currency}
        </strong>
      ),
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      confirmed: 'blue',
      preparing: 'cyan',
      ready: 'green',
      dispatched: 'purple',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getTimelineItems = () => {
    const items = [
      {
        color: 'blue',
        children: (
          <div>
            <div style={{ fontWeight: 500 }}>Sipariş Oluşturuldu</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {dayjs(order.createdAt).format('DD.MM.YYYY HH:mm')}
            </div>
          </div>
        ),
      },
    ];

    // Add status-specific timeline items
    if (['confirmed', 'preparing', 'ready', 'dispatched', 'delivered'].includes(order.status)) {
      items.push({
        color: 'green',
        children: (
          <div>
            <div style={{ fontWeight: 500 }}>Sipariş Onaylandı</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {dayjs(order.updatedAt).format('DD.MM.YYYY HH:mm')}
            </div>
          </div>
        ),
      });
    }

    if (['preparing', 'ready', 'dispatched', 'delivered'].includes(order.status)) {
      items.push({
        color: 'cyan',
        children: (
          <div>
            <div style={{ fontWeight: 500 }}>Hazırlanıyor</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Tahmini süre: {order.items.reduce((max, item) => 
                Math.max(max, 15), 0)} dakika
            </div>
          </div>
        ),
      });
    }

    if (['ready', 'dispatched', 'delivered'].includes(order.status)) {
      items.push({
        color: 'orange',
        children: (
          <div>
            <div style={{ fontWeight: 500 }}>Teslimat Hazır</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Kurye bekleniyor
            </div>
          </div>
        ),
      });
    }

    if (['dispatched', 'delivered'].includes(order.status)) {
      items.push({
        color: 'purple',
        children: (
          <div>
            <div style={{ fontWeight: 500 }}>Kurye Atandı</div>
            {order.courierName && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {order.courierName} - {order.courierPhone}
              </div>
            )}
          </div>
        ),
      });
    }

    if (order.status === 'delivered') {
      items.push({
        color: 'green',
        children: (
          <div>
            <div style={{ fontWeight: 500 }}>Teslim Edildi</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {order.actualDeliveryTime ? 
                dayjs(order.actualDeliveryTime).format('DD.MM.YYYY HH:mm') :
                'Teslim zamanı güncelleniyor'
              }
            </div>
          </div>
        ),
      });
    }

    if (order.status === 'cancelled') {
      items.push({
        color: 'red',
        children: (
          <div>
            <div style={{ fontWeight: 500 }}>İptal Edildi</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {dayjs(order.updatedAt).format('DD.MM.YYYY HH:mm')}
            </div>
          </div>
        ),
      });
    }

    return items;
  };

  return (
    <Drawer
      title={
        <Space>
          <span>Sipariş Detayları</span>
          <Tag color={getStatusColor(order.status)}>
            #{order.orderNumber}
          </Tag>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={720}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Order Summary */}
        <Card size="small" title="Sipariş Özeti">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Sipariş No">
              #{order.orderNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Durum">
              <Tag color={getStatusColor(order.status)}>
                {order.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Toplam Tutar">
              <strong>
                {(order.totalAmount.amount / 100).toFixed(2)} {order.totalAmount.currency}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Teslimat Tipi">
              {order.isExpressDelivery ? (
                <Tag color="red">Express Teslimat</Tag>
              ) : (
                <Tag color="blue">Standart Teslimat</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Customer Information */}
        <Card size="small" title={<><UserOutlined /> Müşteri Bilgileri</>}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Ad Soyad">
              {order.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Telefon">
              <Space>
                <PhoneOutlined />
                <Button type="link" href={`tel:${order.customerPhone}`} style={{ padding: 0 }}>
                  {order.customerPhone}
                </Button>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Teslimat Adresi">
              <Space direction="vertical" size="small">
                <div>
                  <EnvironmentOutlined style={{ marginRight: '4px' }} />
                  {order.deliveryAddress.street}
                </div>
                <Text type="secondary">
                  {order.deliveryAddress.district}, {order.deliveryAddress.city}
                </Text>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Courier Information */}
        {order.courierId && (
          <Card size="small" title={<><TruckOutlined /> Kurye Bilgileri</>}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Kurye">
                {order.courierName || 'Bilgi güncelleniyor...'}
              </Descriptions.Item>
              {order.courierPhone && (
                <Descriptions.Item label="Telefon">
                  <Button type="link" href={`tel:${order.courierPhone}`} style={{ padding: 0 }}>
                    <PhoneOutlined /> {order.courierPhone}
                  </Button>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tahmini Teslimat">
                <Space>
                  <ClockCircleOutlined />
                  {order.estimatedDeliveryTime ? 
                    dayjs(order.estimatedDeliveryTime).format('HH:mm') :
                    'Hesaplanıyor...'
                  }
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Order Items */}
        <Card size="small" title="Sipariş Ürünleri">
          <Table
            columns={itemColumns}
            dataSource={order.items}
            rowKey="id"
            pagination={false}
            size="small"
            summary={(data) => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}>
                    <strong>Toplam</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center">
                    <strong>
                      {data.reduce((sum, item) => sum + item.quantity, 0)}
                    </strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <strong>
                      {(order.totalAmount.amount / 100).toFixed(2)} {order.totalAmount.currency}
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </Card>

        {/* Order Timeline */}
        <Card size="small" title="Sipariş Geçmişi">
          <Timeline items={getTimelineItems()} />
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card size="small" title="Notlar">
            <Text>{order.notes}</Text>
          </Card>
        )}
      </Space>
    </Drawer>
  );
};