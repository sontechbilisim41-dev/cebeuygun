import React, { useState, useEffect } from 'react';
import { OrderTracker } from '@/components/OrderTracker';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { OrderSelector } from '@/components/OrderSelector';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MapPin, Package, Clock } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  customerName: string;
  deliveryAddress: string;
  estimatedArrival?: string;
}

const mockOrders: Order[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    status: 'assigned',
    customerName: 'Ahmet Yılmaz',
    deliveryAddress: 'Beyoğlu, İstanbul',
    estimatedArrival: '2025-01-18T15:30:00Z',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    status: 'on_the_way',
    customerName: 'Fatma Demir',
    deliveryAddress: 'Kadıköy, İstanbul',
    estimatedArrival: '2025-01-18T15:45:00Z',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    status: 'picked_up',
    customerName: 'Mehmet Kaya',
    deliveryAddress: 'Şişli, İstanbul',
    estimatedArrival: '2025-01-18T16:00:00Z',
  },
];

function App() {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(mockOrders[0].id);
  const [selectedOrder, setSelectedOrder] = useState<Order>(mockOrders[0]);
  
  const {
    isConnected,
    courierLocation,
    orderStatus,
    connectionError,
    subscribeToOrder,
    disconnect,
  } = useWebSocket();

  useEffect(() => {
    const order = mockOrders.find(o => o.id === selectedOrderId);
    if (order) {
      setSelectedOrder(order);
      subscribeToOrder(selectedOrderId);
    }
  }, [selectedOrderId, subscribeToOrder]);

  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Cebeuygun - Sipariş Takip
              </h1>
            </div>
            <ConnectionStatus 
              isConnected={isConnected} 
              error={connectionError} 
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Selection & Info */}
          <div className="lg:col-span-1 space-y-6">
            <OrderSelector
              orders={mockOrders}
              selectedOrderId={selectedOrderId}
              onOrderChange={handleOrderChange}
            />
            
            {/* Order Details Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sipariş Detayları
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Sipariş #{selectedOrder.id.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.customerName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Teslimat Adresi
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.deliveryAddress}
                    </p>
                  </div>
                </div>
                
                {selectedOrder.estimatedArrival && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Tahmini Varış
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedOrder.estimatedArrival).toLocaleTimeString('tr-TR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Status Badge */}
              <div className="mt-4 pt-4 border-t">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  orderStatus?.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  orderStatus?.status === 'on_the_way' ? 'bg-blue-100 text-blue-800' :
                  orderStatus?.status === 'picked_up' ? 'bg-yellow-100 text-yellow-800' :
                  orderStatus?.status === 'assigned' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {orderStatus?.status === 'delivered' ? 'Teslim Edildi' :
                   orderStatus?.status === 'on_the_way' ? 'Yolda' :
                   orderStatus?.status === 'picked_up' ? 'Alındı' :
                   orderStatus?.status === 'assigned' ? 'Kurye Atandı' :
                   'Hazırlanıyor'}
                </span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <OrderTracker
              orderId={selectedOrderId}
              courierLocation={courierLocation}
              orderStatus={orderStatus}
              isConnected={isConnected}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;