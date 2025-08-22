# Observability Infrastructure

Comprehensive monitoring, logging, and tracing infrastructure for the e-commerce platform microservices.

## 🎯 Overview

This infrastructure provides complete observability with:
- **OpenTelemetry** for distributed tracing and metrics collection
- **Prometheus + Grafana** for metrics monitoring and visualization
- **ELK Stack** for centralized logging and analysis
- **Jaeger** for distributed tracing visualization
- **Alertmanager** for intelligent alerting and incident management

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Microservices │───▶│ OpenTelemetry    │───▶│   Exporters     │
│                 │    │   Collector      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Prometheus    │    │   Elasticsearch  │    │     Jaeger      │
│   (Metrics)     │    │     (Logs)       │    │   (Traces)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│    Grafana      │    │     Kibana       │    │  Jaeger UI      │
│ (Visualization) │    │  (Log Analysis)  │    │ (Trace Analysis)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### **Prerequisites**
- Kubernetes cluster (1.24+)
- kubectl configured
- Docker installed
- 16GB+ RAM recommended

### **Deployment**

1. **Deploy infrastructure**
   ```bash
   chmod +x infra/scripts/setup-observability.sh
   ./infra/scripts/setup-observability.sh setup
   ```

2. **Verify deployment**
   ```bash
   ./infra/scripts/setup-observability.sh verify
   ```

3. **Generate test traces**
   ```bash
   ./infra/scripts/generate-traces.sh trace
   ./infra/scripts/generate-traces.sh load 100
   ```

### **Access URLs**
- **Grafana**: http://localhost:3000 (admin/admin123)
- **Kibana**: http://localhost:5601
- **Jaeger**: http://localhost:16686
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093

## 📊 Key Features

### **Distributed Tracing**
- **End-to-end tracing** of Order → Assign → Deliver workflow
- **Single trace ID** tracking across all microservices
- **Performance bottleneck** identification
- **Error correlation** across service boundaries

### **Metrics Collection**
- **Business KPIs**: Order volume, GMV, delivery times
- **Technical metrics**: Response times, error rates, throughput
- **Infrastructure metrics**: CPU, memory, disk usage
- **Custom metrics**: Business-specific measurements

### **Centralized Logging**
- **Structured logging** with JSON format
- **Log correlation** with trace and span IDs
- **Real-time log streaming** and analysis
- **Log retention** policies (30 days default)

### **Intelligent Alerting**
- **SLA monitoring** with automatic violation detection
- **Multi-channel alerts**: Email, Slack, PagerDuty
- **Alert grouping** and deduplication
- **Escalation policies** for critical issues

## 🔧 Configuration

### **OpenTelemetry Instrumentation**

Add to your service's package.json:
```json
{
  "scripts": {
    "start": "node --require ./instrumentation.js dist/index.js"
  }
}
```

Copy instrumentation.js to your service:
```bash
cp infra/otel/instrumentation.js services/your-service/
```

### **Custom Metrics Example**
```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('order-service', '1.0.0');

// Counter for orders
const orderCounter = meter.createCounter('orders_created_total', {
  description: 'Total number of orders created',
});

// Histogram for processing time
const processingTime = meter.createHistogram('order_processing_duration_seconds', {
  description: 'Order processing duration in seconds',
});

// Usage
orderCounter.add(1, { 
  restaurant_id: 'rest_123',
  region: 'istanbul' 
});

processingTime.record(0.150, { 
  order_type: 'delivery',
  payment_method: 'card' 
});
```

### **Custom Tracing Example**
```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('order-service', '1.0.0');

async function processOrder(orderId: string) {
  const span = tracer.startSpan('process_order');
  
  try {
    span.setAttributes({
      'order.id': orderId,
      'operation.type': 'business_logic',
    });
    
    // Your business logic here
    const result = await orderLogic(orderId);
    
    span.setStatus({ code: 1 }); // OK
    return result;
  } catch (error) {
    span.recordException(error);
    span.setStatus({ 
      code: 2, // ERROR
      message: error.message 
    });
    throw error;
  } finally {
    span.end();
  }
}
```

## 📈 Dashboards

### **Platform Overview Dashboard**
- Request rate and error rate monitoring
- Response time percentiles
- Service dependency mapping
- Active order tracking

### **Business Metrics Dashboard**
- Daily GMV and order volume
- Regional performance analysis
- Top-performing products
- Delivery performance metrics

### **Order Flow Tracing Dashboard**
- Complete order lifecycle visualization
- Service interaction mapping
- Performance bottleneck identification
- Error correlation analysis

## 🚨 Alerting Rules

### **SLA Violations**
- **Error Rate**: > 0.1% triggers critical alert
- **Response Time**: > 300ms (95th percentile) triggers critical alert
- **Order Processing**: > 5 minutes triggers critical alert
- **Payment Success**: < 99% triggers critical alert

### **Business Alerts**
- **Order Volume Drop**: 50% decrease triggers warning
- **High Cancellation Rate**: > 15% triggers warning
- **Courier Shortage**: < 5 available triggers warning
- **Payment Gateway Down**: Immediate critical alert

### **Infrastructure Alerts**
- **High Memory Usage**: > 85% triggers warning
- **High CPU Usage**: > 80% triggers warning
- **Disk Space Low**: < 10% triggers critical alert
- **Database Connections**: > 80 active connections triggers warning

## 🔍 Troubleshooting

### **Common Issues**

1. **Missing traces**
   ```bash
   # Check OTel Collector logs
   kubectl logs -n observability deployment/otel-collector
   
   # Verify service instrumentation
   curl http://service:port/metrics
   ```

2. **High memory usage**
   ```bash
   # Check Elasticsearch heap
   kubectl exec -n observability elasticsearch-0 -- curl localhost:9200/_cat/nodes?v
   
   # Adjust JVM settings if needed
   ```

3. **Alert not firing**
   ```bash
   # Check Prometheus targets
   curl http://prometheus:9090/api/v1/targets
   
   # Verify alert rules
   curl http://prometheus:9090/api/v1/rules
   ```

### **Performance Tuning**

1. **Elasticsearch optimization**
   ```yaml
   # Increase heap size for large deployments
   ES_JAVA_OPTS: "-Xms4g -Xmx4g"
   
   # Adjust index settings
   number_of_shards: 3
   number_of_replicas: 1
   ```

2. **Prometheus optimization**
   ```yaml
   # Increase retention for production
   --storage.tsdb.retention.time=180d
   
   # Adjust scrape intervals
   scrape_interval: 30s
   ```

3. **OTel Collector tuning**
   ```yaml
   # Increase batch sizes for high throughput
   batch:
     send_batch_size: 2048
     timeout: 2s
   ```

## 📋 Maintenance

### **Daily Tasks**
- Monitor dashboard alerts
- Check service health status
- Review error logs in Kibana
- Verify trace completeness

### **Weekly Tasks**
- Analyze performance trends
- Review SLA compliance
- Update alert thresholds
- Clean up old indices

### **Monthly Tasks**
- Capacity planning review
- Dashboard optimization
- Alert rule refinement
- Performance baseline updates

## 🔐 Security

### **Access Control**
- Grafana: Role-based access control
- Kibana: Index-level permissions
- Prometheus: Query restrictions
- Jaeger: Read-only access for developers

### **Data Protection**
- TLS encryption for all communications
- Sensitive data masking in logs
- Retention policies for compliance
- Audit logging for access

## 📚 Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Grafana Dashboard Design](https://grafana.com/docs/grafana/latest/best-practices/)
- [Elasticsearch Performance Tuning](https://www.elastic.co/guide/en/elasticsearch/reference/current/tune-for-search-speed.html)

---

**Infrastructure Version**: 1.0.0  
**Last Updated**: 2024-01-20  
**Maintained By**: Platform Team