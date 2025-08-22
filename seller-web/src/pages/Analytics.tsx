import React from 'react';
import { Helmet } from 'react-helmet-async';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

const Analytics: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Analitik - Cebeuygun Satıcı Paneli</title>
        <meta name="description" content="Satış performansınızı analiz edin" />
      </Helmet>
      
      <AnalyticsDashboard />
    </>
  );
};

export default Analytics;