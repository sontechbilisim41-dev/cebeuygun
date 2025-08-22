import React, { useEffect, useMemo } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Input, 
  Select, 
  DatePicker, 
  Card, 
  Typography,
  Tooltip,
  Badge,
  Dropdown,
  Modal,
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useVirtual } from 'react-virtual';
import { useTranslation } from 'react-i18next';
import { useOrdersStore } from '@/stores/orders-store';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiService } from '@/services/api';
import { OrderStatusModal } from './OrderStatusModal';
import { OrderDetailsDrawer } from './OrderDetailsDrawer';
import type { Order, OrderStatus } from '@/types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

export const OrderList: React.FC = () => {
  const { t } = useTranslation();
  const {
    orders,
    filters,
    pagination,
    loading,
    setOrders,
    setFilters,
    setPagination,
    setLoading,
    setError,
    getFilteredOrders,
  } = useOrdersStore();

  const [statusModalOpen, setStatusModalOpen] = React.useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  // WebSocket for real-time updates
  useWebSocket();

  // Fetch orders with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['orders', filters, pagination.page, pagination.limit],
    queryFn: async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          status: filters.status,
          search: filters.searchTerm,
          startDate: filters.dateRange?.[0],
          endDate: filters.dateRange?.[1],
        };

        const response = await apiService.getPaginated<Order>('/orders', params);
        
        if (response.success && response.data) {
          setOrders(response.data);
          setPagination({
            total: response.pagination.total,
            page: response.pagination.page,
          });
          setError(null);
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch orders');
        }
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const filteredOrders = useMemo(() => getFilteredOrders(), [getFilteredOrders]);

  const statusColors: Record<OrderStatus, string> = {
    pending: 'orange',
    confirmed: 'blue',
    preparing: 'cyan',
    ready: 'green',
    dispatched: 'purple',
    delivered: 'success',
    cancelled: 'error',
  };

  const statusTexts: Record<OrderStatus, string> = {
    pending: t('order.status.pending'),
    confirmed: t('order.status.confirmed'),
    preparing: t('order.status.preparing'),
    ready: t('order.status.ready'),
    dispatched: t('order.status.dispatched'),
    delivered: t('order.status.delivered'),
    cancelled: t('order.status.cancelled'),
  };

  const columns = [
    {
      title: t('order.orderNumber'),
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      fixed: 'left' as const,
      render: (orderNumber: string, record: Order) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedOrder(record);
            setDetailsDrawerOpen(true);
          }}
          style={{ padding: 0, height: 'auto' }}
        >
          #{orderNumber}
        </Button>
      ),
    },
    {
      title: t('order.customer'),
      key: 'customer',
      width: 200,
      render: (record: Order) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.customerName}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            <PhoneOutlined style={{ marginRight: '4px' }} />
            {record.customerPhone}
          </Text>
        </div>
      ),
    },
    {
      title: t('order.status'),
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: OrderStatus) => (
        <Tag color={statusColors[status]}>
          {statusTexts[status]}
        </Tag>
      ),
      filters: Object.entries(statusTexts).map(([value, label]) => ({
        text: label,
        value,
      })),
      onFilter: (value: any, record: Order) => record.status === value,
    },
    {
      title: t('order.items'),
      key: 'items',
      width: 100,
      render: (record: Order) => (
        <Tooltip title={record.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}>
          <Badge count={record.items.length} showZero color="blue" />
        </Tooltip>
      ),
    },
    {
      title: t('order.total'),
      key: 'total',
      width: 120,
      render: (record: Order) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 500 }}>
            {(record.totalAmount.amount / 100).toFixed(2)} {record.totalAmount.currency}
          </div>
          {record.isExpressDelivery && (
            <Tag color="red" size="small">Express</Tag>
          )}
        </div>
      ),
    },
    {
      title: t('order.deliveryTime'),
      key: 'deliveryTime',
      width: 150,
      render: (record: Order) => (
        <div>
          {record.estimatedDeliveryTime && (
            <div style={{ fontSize: '12px' }}>
              <ClockCircleOutlined style={{ marginRight: '4px' }} />
              {dayjs(record.estimatedDeliveryTime).format('HH:mm')}
            </div>
          )}
          <Text type="secondary" style={{ fontSize: '11px' }}>
            <EnvironmentOutlined style={{ marginRight: '4px' }} />
            {record.deliveryAddress.district}
          </Text>
        </div>
      ),
    },
    {
      title: t('order.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (createdAt: string) => (
        <div style={{ fontSize: '12px' }}>
          <div>{dayjs(createdAt).format('DD.MM.YYYY')}</div>
          <Text type="secondary">{dayjs(createdAt).format('HH:mm')}</Text>
        </div>
      ),
      sorter: (a: Order, b: Order) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (record: Order) => {
        const canUpdateStatus = ['confirmed', 'preparing', 'ready'].includes(record.status);
        
        const actionItems = [
          {
            key: 'view',
            icon: <EyeOutlined />,
            label: t('common.view'),
            onClick: () => {
              setSelectedOrder(record);
              setDetailsDrawerOpen(true);
            },
          },
          ...(canUpdateStatus ? [{
            key: 'update-status',
            icon: <EditOutlined />,
            label: t('order.updateStatus'),
            onClick: () => {
              setSelectedOrder(record);
              setStatusModalOpen(true);
            },
          }] : []),
        ];

        return (
          <Dropdown menu={{ items: actionItems }} trigger={['click']}>
            <Button type="text" size="small">
              {t('common.actions')}
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setPagination({
      page: pagination.current,
      limit: pagination.pageSize,
    });
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus, notes?: string) => {
    try {
      const response = await apiService.patch(`/orders/${orderId}/status`, {
        status,
        notes,
      });

      if (response.success) {
        // Order will be updated via WebSocket
        setStatusModalOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  return (
    <div>
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px',
        }}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('orders.title')}
          </Typography.Title>
          
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
              loading={isLoading}
            >
              {t('common.refresh')}
            </Button>
          </Space>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          marginBottom: '16px',
          flexWrap: 'wrap',
        }}>
          <Input
            placeholder={t('orders.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={filters.searchTerm}
            onChange={(e) => setFilters({ searchTerm: e.target.value })}
            style={{ width: '300px' }}
            allowClear
          />
          
          <Select
            placeholder={t('orders.filterByStatus')}
            value={filters.status}
            onChange={(status) => setFilters({ status })}
            style={{ width: '150px' }}
            allowClear
          >
            {Object.entries(statusTexts).map(([value, label]) => (
              <Select.Option key={value} value={value}>
                {label}
              </Select.Option>
            ))}
          </Select>
          
          <RangePicker
            value={filters.dateRange ? [dayjs(filters.dateRange[0]), dayjs(filters.dateRange[1])] : null}
            onChange={(dates) => {
              if (dates) {
                setFilters({ 
                  dateRange: [dates[0]!.toISOString(), dates[1]!.toISOString()] 
                });
              } else {
                setFilters({ dateRange: undefined });
              }
            }}
            style={{ width: '250px' }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading || isLoading}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              t('common.pagination.total', { 
                start: range[0], 
                end: range[1], 
                total 
              }),
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200, y: 600 }}
          size="small"
          rowClassName={(record) => {
            if (record.status === 'ready') return 'order-ready';
            if (record.isExpressDelivery) return 'order-express';
            return '';
          }}
        />
      </Card>

      {/* Order Status Update Modal */}
      <OrderStatusModal
        open={statusModalOpen}
        order={selectedOrder}
        onCancel={() => {
          setStatusModalOpen(false);
          setSelectedOrder(null);
        }}
        onSubmit={handleStatusUpdate}
      />

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        open={detailsDrawerOpen}
        order={selectedOrder}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedOrder(null);
        }}
      />

      <style>{`
        .order-ready {
          background-color: #f6ffed !important;
        }
        .order-express {
          border-left: 3px solid #ff4d4f;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};