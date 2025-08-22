const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-otlp-http');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');

// Environment configuration
const serviceName = process.env.SERVICE_NAME || 'unknown-service';
const serviceVersion = process.env.SERVICE_VERSION || '1.0.0';
const environment = process.env.ENVIRONMENT || 'development';
const otelCollectorUrl = process.env.OTEL_COLLECTOR_URL || 'http://localhost:4318';

// Create resource
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
  [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
  [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'cebeuygun',
  [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.HOSTNAME || 'localhost',
});

// Configure exporters
const traceExporter = new OTLPTraceExporter({
  url: `${otelCollectorUrl}/v1/traces`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const metricExporter = new OTLPMetricExporter({
  url: `${otelCollectorUrl}/v1/metrics`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const logExporter = new OTLPLogExporter({
  url: `${otelCollectorUrl}/v1/logs`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configure SDK
const sdk = new NodeSDK({
  resource,
  
  // Automatic instrumentation
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable specific instrumentations if needed
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
        requestHook: (span, info) => {
          span.setAttributes({
            'http.request.body.size': info.request.headers['content-length'] || 0,
            'user.id': info.request.user?.id,
            'request.id': info.request.headers['x-request-id'],
          });
        },
        responseHook: (span, info) => {
          span.setAttributes({
            'http.response.body.size': info.response.get('content-length') || 0,
          });
        },
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        requestHook: (span, request) => {
          span.setAttributes({
            'http.request.method': request.method,
            'http.url': request.url,
          });
        },
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
        enhancedDatabaseReporting: true,
      },
      '@opentelemetry/instrumentation-redis': {
        enabled: true,
        dbStatementSerializer: (cmdName, cmdArgs) => {
          return `${cmdName} ${cmdArgs.slice(0, 2).join(' ')}`;
        },
      },
    }),
  ],
  
  // Trace configuration
  spanProcessor: new BatchSpanProcessor(traceExporter, {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 1000,
    exportTimeoutMillis: 30000,
  }),
  
  // Metric configuration
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 10000,
    exportTimeoutMillis: 5000,
  }),
  
  // Log configuration
  logRecordProcessor: new BatchLogRecordProcessor(logExporter, {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 1000,
    exportTimeoutMillis: 30000,
  }),
});

// Custom span attributes for business context
const addBusinessContext = (span, context) => {
  if (context.orderId) {
    span.setAttributes({
      'business.order.id': context.orderId,
      'business.order.status': context.orderStatus,
      'business.customer.id': context.customerId,
      'business.restaurant.id': context.restaurantId,
    });
  }
  
  if (context.userId) {
    span.setAttributes({
      'user.id': context.userId,
      'user.role': context.userRole,
    });
  }
  
  if (context.paymentId) {
    span.setAttributes({
      'business.payment.id': context.paymentId,
      'business.payment.method': context.paymentMethod,
      'business.payment.amount': context.paymentAmount,
    });
  }
};

// Error tracking
const trackError = (span, error, context = {}) => {
  span.recordException(error);
  span.setStatus({
    code: 2, // ERROR
    message: error.message,
  });
  
  span.setAttributes({
    'error.type': error.constructor.name,
    'error.message': error.message,
    'error.stack': error.stack,
    ...context,
  });
};

// Performance monitoring
const trackPerformance = (span, operation, duration, context = {}) => {
  span.setAttributes({
    'performance.operation': operation,
    'performance.duration_ms': duration,
    'performance.slow_query': duration > 1000,
    ...context,
  });
};

// Initialize SDK
sdk.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('OpenTelemetry terminated'))
    .catch((error) => console.log('Error terminating OpenTelemetry', error))
    .finally(() => process.exit(0));
});

module.exports = {
  addBusinessContext,
  trackError,
  trackPerformance,
};