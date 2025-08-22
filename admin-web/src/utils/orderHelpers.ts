// Order Management Utility Functions

export const formatCurrency = (amount: number, currency: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(amount / 100);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('tr-TR');
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    'received': 'Sipariş Alındı',
    'preparing': 'Hazırlanıyor',
    'ready': 'Hazır',
    'delivering': 'Teslim Ediliyor',
    'delivered': 'Teslim Edildi',
    'cancelled': 'İptal Edildi',
  };
  
  return statusMap[status] || status;
};

export const getTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    'product': 'Ürün',
    'food': 'Yemek',
    'grocery': 'Market',
  };
  
  return typeMap[type] || type;
};

export const getTypeIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    'product': '📦',
    'food': '🍕',
    'grocery': '🛒',
  };
  
  return iconMap[type] || '📋';
};

export const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const colorMap: Record<string, any> = {
    'received': 'info',
    'preparing': 'warning',
    'ready': 'primary',
    'delivering': 'secondary',
    'delivered': 'success',
    'cancelled': 'error',
  };
  
  return colorMap[status] || 'default';
};

export const getOrderPriority = (order: any): 'low' | 'medium' | 'high' | 'urgent' => {
  // Determine priority based on order characteristics
  const orderAge = Date.now() - new Date(order.date).getTime();
  const ageInHours = orderAge / (1000 * 60 * 60);
  
  // High value orders
  if (order.amount.total > 50000) return 'high';
  
  // Old orders
  if (ageInHours > 2 && order.status !== 'delivered') return 'urgent';
  if (ageInHours > 1 && order.status !== 'delivered') return 'high';
  
  // Food orders (time sensitive)
  if (order.type === 'food' && ageInHours > 0.5) return 'high';
  
  return 'medium';
};

export const calculateDeliveryTime = (order: any): string => {
  if (order.status === 'delivered') {
    const orderTime = new Date(order.date).getTime();
    const deliveredTime = order.timeline.find((t: any) => t.status === 'delivered')?.timestamp;
    
    if (deliveredTime) {
      const duration = new Date(deliveredTime).getTime() - orderTime;
      const minutes = Math.floor(duration / (1000 * 60));
      return `${minutes} dakika`;
    }
  }
  
  return 'Devam ediyor';
};

export const getEstimatedDeliveryTime = (order: any): string => {
  const baseTime = {
    'food': 30,
    'grocery': 45,
    'product': 60,
  };
  
  const estimatedMinutes = baseTime[order.type as keyof typeof baseTime] || 45;
  const orderTime = new Date(order.date);
  const estimatedTime = new Date(orderTime.getTime() + estimatedMinutes * 60 * 1000);
  
  return estimatedTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const validateOrderUpdate = (orderId: string, newStatus: string): { valid: boolean; error?: string } => {
  if (!orderId) {
    return { valid: false, error: 'Sipariş ID gerekli' };
  }
  
  const validStatuses = ['received', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
  if (!validStatuses.includes(newStatus)) {
    return { valid: false, error: 'Geçersiz sipariş durumu' };
  }
  
  return { valid: true };
};

export const generateOrderReport = (orders: any[]): {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  statusBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
} => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount.total, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const statusBreakdown = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const typeBreakdown = orders.reduce((acc, order) => {
    acc[order.type] = (acc[order.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    statusBreakdown,
    typeBreakdown,
  };
};

export const searchOrders = (orders: Order[], searchTerm: string): Order[] => {
  if (!searchTerm.trim()) return orders;
  
  const term = searchTerm.toLowerCase();
  
  return orders.filter(order => 
    order.orderNumber.toLowerCase().includes(term) ||
    order.customer.name.toLowerCase().includes(term) ||
    order.customer.phone.includes(term) ||
    order.seller.name.toLowerCase().includes(term) ||
    order.deliveryAddress.fullAddress.toLowerCase().includes(term)
  );
};

export const sortOrders = (orders: Order[], sortBy: string, sortDirection: 'asc' | 'desc' = 'desc'): Order[] => {
  return [...orders].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'amount':
        aValue = a.amount.total;
        bValue = b.amount.total;
        break;
      case 'customer':
        aValue = a.customer.name.toLowerCase();
        bValue = b.customer.name.toLowerCase();
        break;
      case 'seller':
        aValue = a.seller.name.toLowerCase();
        bValue = b.seller.name.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
};

export const getOrderStatistics = (orders: Order[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(order => 
    new Date(order.date) >= today
  );
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  
  const weekOrders = orders.filter(order => 
    new Date(order.date) >= thisWeekStart
  );
  
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const monthOrders = orders.filter(order => 
    new Date(order.date) >= thisMonthStart
  );
  
  return {
    today: {
      count: todayOrders.length,
      revenue: todayOrders.reduce((sum, order) => sum + order.amount.total, 0),
    },
    week: {
      count: weekOrders.length,
      revenue: weekOrders.reduce((sum, order) => sum + order.amount.total, 0),
    },
    month: {
      count: monthOrders.length,
      revenue: monthOrders.reduce((sum, order) => sum + order.amount.total, 0),
    },
  };
};