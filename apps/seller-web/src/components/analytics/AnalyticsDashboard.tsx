import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  DatePicker, 
  Select, 
  Space, 
  Typography,
  Spin,
} from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  TrendingUpOutlined,
  UserOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { Line, Column, Pie } from '@ant-design/plots';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiService } from '@/services/api';
import type { SalesMetrics, OrderAnalytics } from '@/types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export const AnalyticsDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');

  // Fetch sales metrics
  const { data: salesMetrics, isLoading: salesLoading } = useQuery({
    queryKey: ['analytics', 'sales', dateRange, period],
    queryFn: async () => {
      const response = await apiService.get<SalesMetrics>('/analytics/sales', {
        params: {
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
          period,
        },
      });
      return response.data;
    },
  });

  // Fetch order analytics
  const { data: orderAnalytics, isLoading: ordersLoading } = useQuery({
    queryKey: ['analytics', 'orders', dateRange],
    queryFn: async () => {
      const response = await apiService.get<OrderAnalytics>('/analytics/orders', {
        params: {
          startDate: dateRange[0].toISOString(),
          endDate: dateRange[1].toISOString(),
        },
      });
      return response.data;
    },
  });

  // Chart configurations
  const revenueChartConfig = {
    data: salesMetrics?.dailyRevenue || [],
    xField: 'date',
    yField: 'revenue',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: 'Gelir',
        value: `${datum.revenue.toFixed(2)} TRY`,
      }),
    },
  };

  const ordersChartConfig = {
    data: orderAnalytics?.ordersByHour || [],
    xField: 'hour',
    yField: 'count',
    color: '#52c41a',
    columnWidthRatio: 0.8,
    tooltip: {
      formatter: (datum: any) => ({
        name: 'Sipariş Sayısı',
        value: datum.count,
      }),
    },
  };

  const statusPieConfig = {
    data: Object.entries(orderAnalytics?.ordersByStatus || {}).map(([status, count]) => ({
      type: status,
      value: count,
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} ({percentage})',
    },
    interactions: [{ type: 'element-active' }],
  };

  const isLoading = salesLoading || ordersLoading;

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <Title level={4} style={{ margin: 0 }}>
          {t('analytics.title')}
        </Title>
        
        <Space>
          <Select
            value={period}
            onChange={setPeriod}
            style={{ width: '120px' }}
          >
            <Select.Option value="day">{t('analytics.daily')}</Select.Option>
            <Select.Option value="week">{t('analytics.weekly')}</Select.Option>
            <Select.Option value="month">{t('analytics.monthly')}</Select.Option>
          </Select>
          
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              if (dates) {
                setDateRange([dates[0]!, dates[1]!]);
              }
            }}
            presets={[
              { label: t('analytics.last7Days'), value: [dayjs().subtract(7, 'days'), dayjs()] },
              { label: t('analytics.last30Days'), value: [dayjs().subtract(30, 'days'), dayjs()] },
              { label: t('analytics.thisMonth'), value: [dayjs().startOf('month'), dayjs()] },
            ]}
          />
        </Space>
      </div>

      <Spin spinning={isLoading}>
        {/* Key Metrics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('analytics.totalRevenue')}
                value={salesMetrics?.totalRevenue.amount ? salesMetrics.totalRevenue.amount / 100 : 0}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix="TRY"
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('analytics.totalOrders')}
                value={salesMetrics?.totalOrders || 0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ShoppingCartOutlined />}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('analytics.averageOrderValue')}
                value={salesMetrics?.averageOrderValue.amount ? salesMetrics.averageOrderValue.amount / 100 : 0}
                precision={2}
                valueStyle={{ color: '#722ed1' }}
                prefix={<TrendingUpOutlined />}
                suffix="TRY"
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={t('analytics.conversionRate')}
                value={salesMetrics?.conversionRate || 0}
                precision={1}
                valueStyle={{ color: '#eb2f96' }}
                prefix={<UserOutlined />}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card title={t('analytics.revenueOverTime')}>
              <Line {...revenueChartConfig} height={300} />
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card title={t('analytics.ordersByStatus')}>
              <Pie {...statusPieConfig} height={300} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} lg={12}>
            <Card title={t('analytics.ordersByHour')}>
              <Column {...ordersChartConfig} height={250} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title={t('analytics.topProducts')}>
              <div style={{ maxHeight: '250px', overflow: 'auto' }}>
                {orderAnalytics?.topProducts.map((product, index) => (
                  <div
                    key={product.productId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: index < orderAnalytics.topProducts.length - 1 ? '1px solid #f0f0f0' : 'none',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{product.productName}</div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {product.quantity} adet satıldı
                      </Text>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 500 }}>
                        {(product.revenue.amount / 100).toFixed(2)} TRY
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};