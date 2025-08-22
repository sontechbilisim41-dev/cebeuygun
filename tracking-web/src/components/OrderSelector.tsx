import React from 'react';
import { Package, ChevronDown } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  customerName: string;
  deliveryAddress: string;
  estimatedArrival?: string;
}

interface OrderSelectorProps {
  orders: Order[];
  selectedOrderId: string;
  onOrderChange: (orderId: string) => void;
}

export const OrderSelector: React.FC<OrderSelectorProps> = ({
  orders,
  selectedOrderId,
  onOrderChange,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'on_the_way':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-yellow-100 text-yellow-800';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Teslim Edildi';
      case 'on_the_way':
        return 'Yolda';
      case 'picked_up':
        return 'Alındı';
      case 'assigned':
        return 'Kurye Atandı';
      default:
        return 'Hazırlanıyor';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Package className="w-5 h-5" />
          <span>Sipariş Seçimi</span>
        </h3>
      </div>
      
      <div className="p-4">
        <div className="relative">
          <select
            value={selectedOrderId}
            onChange={(e) => onOrderChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                #{order.id.slice(-8)} - {order.customerName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
        
        {/* Order List */}
        <div className="mt-4 space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => onOrderChange(order.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedOrderId === order.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  #{order.id.slice(-8)}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-1">{order.customerName}</p>
              <p className="text-xs text-gray-500">{order.deliveryAddress}</p>
              
              {order.estimatedArrival && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(order.estimatedArrival).toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};