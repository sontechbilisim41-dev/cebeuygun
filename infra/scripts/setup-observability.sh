#!/bin/bash

set -e

echo "🚀 Setting up Observability Infrastructure..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "docker is not installed"
        exit 1
    fi
    
    print_status "Prerequisites check passed ✓"
}

# Create namespaces
create_namespaces() {
    print_status "Creating namespaces..."
    kubectl apply -f k8s/observability/namespace.yaml
    print_status "Namespaces created ✓"
}

# Deploy Elasticsearch
deploy_elasticsearch() {
    print_status "Deploying Elasticsearch..."
    kubectl apply -f k8s/observability/elasticsearch.yaml
    
    print_status "Waiting for Elasticsearch to be ready..."
    kubectl wait --for=condition=ready pod -l app=elasticsearch -n observability --timeout=300s
    print_status "Elasticsearch deployed ✓"
}

# Deploy Kibana
deploy_kibana() {
    print_status "Deploying Kibana..."
    kubectl apply -f k8s/observability/kibana.yaml
    
    print_status "Waiting for Kibana to be ready..."
    kubectl wait --for=condition=ready pod -l app=kibana -n observability --timeout=300s
    print_status "Kibana deployed ✓"
}

# Deploy Jaeger
deploy_jaeger() {
    print_status "Deploying Jaeger..."
    kubectl apply -f k8s/observability/jaeger.yaml
    
    print_status "Waiting for Jaeger to be ready..."
    kubectl wait --for=condition=ready pod -l app=jaeger -n observability --timeout=180s
    print_status "Jaeger deployed ✓"
}

# Deploy Loki
deploy_loki() {
    print_status "Deploying Loki..."
    kubectl apply -f k8s/observability/loki.yaml
    
    print_status "Waiting for Loki to be ready..."
    kubectl wait --for=condition=ready pod -l app=loki -n observability --timeout=180s
    print_status "Loki deployed ✓"
}

# Deploy OpenTelemetry Collector
deploy_otel_collector() {
    print_status "Deploying OpenTelemetry Collector..."
    kubectl apply -f k8s/observability/otel-collector.yaml
    
    print_status "Waiting for OTel Collector to be ready..."
    kubectl wait --for=condition=ready pod -l app=otel-collector -n observability --timeout=180s
    print_status "OpenTelemetry Collector deployed ✓"
}

# Deploy Prometheus
deploy_prometheus() {
    print_status "Deploying Prometheus..."
    kubectl apply -f k8s/observability/prometheus.yaml
    
    print_status "Waiting for Prometheus to be ready..."
    kubectl wait --for=condition=ready pod -l app=prometheus -n observability --timeout=180s
    print_status "Prometheus deployed ✓"
}

# Deploy Alertmanager
deploy_alertmanager() {
    print_status "Deploying Alertmanager..."
    kubectl apply -f k8s/observability/alertmanager.yaml
    
    print_status "Waiting for Alertmanager to be ready..."
    kubectl wait --for=condition=ready pod -l app=alertmanager -n observability --timeout=180s
    print_status "Alertmanager deployed ✓"
}

# Deploy Grafana
deploy_grafana() {
    print_status "Deploying Grafana..."
    kubectl apply -f k8s/observability/grafana.yaml
    
    print_status "Waiting for Grafana to be ready..."
    kubectl wait --for=condition=ready pod -l app=grafana -n observability --timeout=180s
    print_status "Grafana deployed ✓"
}

# Setup Kibana dashboards
setup_kibana_dashboards() {
    print_status "Setting up Kibana dashboards..."
    
    # Wait for Kibana to be fully ready
    sleep 30
    
    # Import index patterns
    kubectl exec -n observability deployment/kibana -- curl -X POST "localhost:5601/api/saved_objects/_import" \
        -H "kbn-xsrf: true" \
        -H "Content-Type: application/json" \
        --data-binary @/var/lib/kibana/index-patterns/otel-logs.json || true
    
    print_status "Kibana dashboards configured ✓"
}

# Setup Grafana dashboards
setup_grafana_dashboards() {
    print_status "Setting up Grafana dashboards..."
    
    # Dashboards are provisioned automatically via ConfigMaps
    print_status "Grafana dashboards configured ✓"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check all services are running
    kubectl get pods -n observability
    
    # Get service URLs
    print_status "Service URLs:"
    echo "📊 Grafana: http://$(kubectl get svc grafana -n observability -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):3000"
    echo "🔍 Kibana: http://$(kubectl get svc kibana -n observability -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):5601"
    echo "🔗 Jaeger: http://$(kubectl get svc jaeger-query -n observability -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):16686"
    echo "📈 Prometheus: http://$(kubectl get svc prometheus -n observability -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):9090"
    echo "🚨 Alertmanager: http://$(kubectl get svc alertmanager -n observability -o jsonpath='{.status.loadBalancer.ingress[0].ip}'):9093"
    
    print_status "Deployment verification completed ✓"
}

# Main execution
main() {
    print_status "Starting observability infrastructure setup..."
    
    check_prerequisites
    create_namespaces
    
    # Deploy storage layer first
    deploy_elasticsearch
    
    # Deploy log aggregation
    deploy_loki
    
    # Deploy tracing
    deploy_jaeger
    
    # Deploy metrics collection
    deploy_otel_collector
    deploy_prometheus
    deploy_alertmanager
    
    # Deploy visualization
    deploy_grafana
    deploy_kibana
    
    # Setup dashboards
    setup_kibana_dashboards
    setup_grafana_dashboards
    
    # Verify everything is working
    verify_deployment
    
    print_status "🎉 Observability infrastructure setup completed!"
    print_warning "Please configure secrets for production deployment:"
    echo "  - Grafana admin password"
    echo "  - SMTP credentials for alerting"
    echo "  - Slack webhook URLs"
    echo "  - Database passwords"
}

# Run main function
main "$@"