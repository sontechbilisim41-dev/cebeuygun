import React from 'react';
import { Helmet } from 'react-helmet-async';
import { OrderList } from '@/components/orders/OrderList';

const Orders: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Siparişler - Cebeuygun Satıcı Paneli</title>
        <meta name="description" content="Siparişlerinizi yönetin ve durumlarını güncelleyin" />
      </Helmet>
      
      <OrderList />
    </>
  );
};

export default Orders;