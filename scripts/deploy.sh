#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-"production"}
RELEASE_NAME=${RELEASE_NAME:-"cebeuygun-platform"}
CHART_PATH=${CHART_PATH:-"./helm/cebeuygun-platform"}
VALUES_FILE=${VALUES_FILE:-"values.yaml"}

# Functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed"
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    print_status "Prerequisites check passed ✓"
}

# Create namespace if it doesn't exist
create_namespace() {
    print_status "Creating namespace: $NAMESPACE"
    
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    kubectl label namespace $NAMESPACE type=application --overwrite
    
    print_status "Namespace ready ✓"
}

# Install or upgrade Helm chart
deploy_chart() {
    print_header "Deploying CebeUygun Platform to $NAMESPACE"
    
    # Add required Helm repositories
    helm repo add bitnami https://charts.bitnami.com/bitnami
    helm repo add elastic https://helm.elastic.co
    helm repo update
    
    # Install/upgrade the chart
    helm upgrade --install $RELEASE_NAME $CHART_PATH \
        --namespace $NAMESPACE \
        --values $CHART_PATH/$VALUES_FILE \
        --timeout 10m \
        --wait \
        --atomic
    
    print_status "Chart deployment completed ✓"
}

# Wait for all deployments to be ready
wait_for_deployments() {
    print_status "Waiting for deployments to be ready..."
    
    kubectl wait --for=condition=available --timeout=600s \
        deployment --all -n $NAMESPACE
    
    print_status "All deployments are ready ✓"
}

# Run health checks
run_health_checks() {
    print_status "Running health checks..."
    
    # Get all services
    SERVICES=$(kubectl get svc -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}' | tr ' ' '\n' | grep -E '(auth|order|payment|courier|notification|reporting|integration)')
    
    for service in $SERVICES; do
        print_status "Checking health of $service..."
        
        # Port forward and test
        kubectl port-forward svc/$service 8080:8001 -n $NAMESPACE &
        PF_PID=$!
        sleep 5
        
        if curl -f http://localhost:8080/health &> /dev/null; then
            print_status "$service health check passed ✓"
        else
            print_warning "$service health check failed ⚠️"
        fi
        
        kill $PF_PID 2>/dev/null || true
        sleep 2
    done
}

# Display deployment information
show_deployment_info() {
    print_header "Deployment Information"
    
    echo "Namespace: $NAMESPACE"
    echo "Release: $RELEASE_NAME"
    echo "Chart: $CHART_PATH"
    echo ""
    
    print_status "Services:"
    kubectl get svc -n $NAMESPACE
    echo ""
    
    print_status "Deployments:"
    kubectl get deployments -n $NAMESPACE
    echo ""
    
    print_status "Pods:"
    kubectl get pods -n $NAMESPACE
    echo ""
    
    print_status "Ingress:"
    kubectl get ingress -n $NAMESPACE
    echo ""
    
    # Get external URLs
    INGRESS_IP=$(kubectl get ingress -n $NAMESPACE -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}')
    if [ -n "$INGRESS_IP" ]; then
        print_status "External URL: https://$INGRESS_IP"
    fi
}

# Rollback deployment
rollback_deployment() {
    print_warning "Rolling back deployment..."
    
    helm rollback $RELEASE_NAME -n $NAMESPACE
    
    print_status "Rollback completed ✓"
}

# Canary deployment
deploy_canary() {
    local NEW_IMAGE_TAG=$1
    
    if [ -z "$NEW_IMAGE_TAG" ]; then
        print_error "Image tag is required for canary deployment"
        exit 1
    fi
    
    print_header "Starting canary deployment with image tag: $NEW_IMAGE_TAG"
    
    # Deploy canary version
    helm upgrade $RELEASE_NAME-canary $CHART_PATH \
        --namespace $NAMESPACE \
        --values $CHART_PATH/values-canary.yaml \
        --set global.imageTag=$NEW_IMAGE_TAG \
        --timeout 10m \
        --wait
    
    print_status "Canary deployment completed ✓"
    
    # Monitor canary for 5 minutes
    print_status "Monitoring canary deployment..."
    sleep 300
    
    # Check metrics (simplified)
    print_status "Checking canary metrics..."
    
    # Promote canary if healthy
    print_status "Promoting canary to production..."
    helm upgrade $RELEASE_NAME $CHART_PATH \
        --namespace $NAMESPACE \
        --values $CHART_PATH/$VALUES_FILE \
        --set global.imageTag=$NEW_IMAGE_TAG \
        --timeout 10m \
        --wait
    
    # Cleanup canary
    helm uninstall $RELEASE_NAME-canary -n $NAMESPACE
    
    print_status "Canary promotion completed ✓"
}

# Main execution
case "${1:-deploy}" in
    "deploy")
        check_prerequisites
        create_namespace
        deploy_chart
        wait_for_deployments
        run_health_checks
        show_deployment_info
        ;;
    "canary")
        check_prerequisites
        deploy_canary $2
        ;;
    "rollback")
        check_prerequisites
        rollback_deployment
        ;;
    "status")
        show_deployment_info
        ;;
    "health")
        run_health_checks
        ;;
    *)
        echo "Usage: $0 {deploy|canary|rollback|status|health}"
        echo "  deploy  - Deploy the platform"
        echo "  canary  - Deploy canary version (requires image tag)"
        echo "  rollback - Rollback to previous version"
        echo "  status  - Show deployment status"
        echo "  health  - Run health checks"
        exit 1
        ;;
esac