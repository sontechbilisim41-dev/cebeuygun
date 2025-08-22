import React from 'react';
import { Helmet } from 'react-helmet-async';
import { BulkOperationsHub } from '@/components/bulk/BulkOperationsHub';

const BulkOperations: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Toplu İşlemler - Cebeuygun Satıcı Paneli</title>
        <meta name="description" content="Ürün, stok ve fiyat güncellemelerini toplu olarak yapın" />
      </Helmet>
      
      <BulkOperationsHub />
    </>
  );
};

export default BulkOperations;