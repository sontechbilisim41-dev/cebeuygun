#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
MAX_AGE_HOURS=${MAX_AGE_HOURS:-24}
DRY_RUN=${DRY_RUN:-false}

cleanup_old_previews() {
    print_status "Cleaning up preview environments older than $MAX_AGE_HOURS hours..."
    
    # Get all preview namespaces
    PREVIEW_NAMESPACES=$(kubectl get namespaces -l type=preview -o jsonpath='{.items[*].metadata.name}')
    
    if [ -z "$PREVIEW_NAMESPACES" ]; then
        print_status "No preview environments found"
        return
    fi
    
    for namespace in $PREVIEW_NAMESPACES; do
        # Get namespace creation time
        CREATION_TIME=$(kubectl get namespace $namespace -o jsonpath='{.metadata.creationTimestamp}')
        CREATION_TIMESTAMP=$(date -d "$CREATION_TIME" +%s)
        CURRENT_TIMESTAMP=$(date +%s)
        AGE_HOURS=$(( (CURRENT_TIMESTAMP - CREATION_TIMESTAMP) / 3600 ))
        
        if [ $AGE_HOURS -gt $MAX_AGE_HOURS ]; then
            print_warning "Preview environment $namespace is $AGE_HOURS hours old (threshold: $MAX_AGE_HOURS hours)"
            
            if [ "$DRY_RUN" = "true" ]; then
                print_status "DRY RUN: Would delete namespace $namespace"
            else
                print_status "Deleting namespace $namespace..."
                kubectl delete namespace $namespace --timeout=300s
                print_status "Namespace $namespace deleted ✓"
            fi
        else
            print_status "Preview environment $namespace is $AGE_HOURS hours old (keeping)"
        fi
    done
}

cleanup_failed_deployments() {
    print_status "Cleaning up failed deployments..."
    
    # Get failed deployments
    FAILED_DEPLOYMENTS=$(kubectl get deployments --all-namespaces -o json | \
        jq -r '.items[] | select(.status.conditions[]? | select(.type=="Available" and .status=="False")) | "\(.metadata.namespace)/\(.metadata.name)"')
    
    if [ -z "$FAILED_DEPLOYMENTS" ]; then
        print_status "No failed deployments found"
        return
    fi
    
    for deployment in $FAILED_DEPLOYMENTS; do
        NAMESPACE=$(echo $deployment | cut -d'/' -f1)
        DEPLOYMENT_NAME=$(echo $deployment | cut -d'/' -f2)
        
        # Only cleanup preview environments
        if [[ $NAMESPACE == preview-* ]]; then
            print_warning "Found failed deployment: $deployment"
            
            if [ "$DRY_RUN" = "true" ]; then
                print_status "DRY RUN: Would delete deployment $deployment"
            else
                print_status "Deleting failed deployment $deployment..."
                kubectl delete deployment $DEPLOYMENT_NAME -n $NAMESPACE --timeout=60s
                print_status "Failed deployment deleted ✓"
            fi
        fi
    done
}

cleanup_unused_images() {
    print_status "Cleaning up unused container images..."
    
    # This would typically be done by a DaemonSet or external tool
    print_status "Image cleanup should be handled by node-level garbage collection"
}

generate_cleanup_report() {
    print_status "Generating cleanup report..."
    
    REPORT_FILE="cleanup-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "# Preview Environment Cleanup Report"
        echo "Generated: $(date)"
        echo "Max Age: $MAX_AGE_HOURS hours"
        echo "Dry Run: $DRY_RUN"
        echo ""
        
        echo "## Current Preview Environments"
        kubectl get namespaces -l type=preview --no-headers | while read namespace status age; do
            echo "- $namespace (Age: $age)"
        done
        
        echo ""
        echo "## Resource Usage"
        kubectl top nodes 2>/dev/null || echo "Metrics server not available"
        
    } > $REPORT_FILE
    
    print_status "Cleanup report saved to $REPORT_FILE"
}

# Main execution
case "${1:-cleanup}" in
    "cleanup")
        cleanup_old_previews
        cleanup_failed_deployments
        generate_cleanup_report
        ;;
    "report")
        generate_cleanup_report
        ;;
    "images")
        cleanup_unused_images
        ;;
    *)
        echo "Usage: $0 {cleanup|report|images}"
        echo "  cleanup - Clean up old preview environments"
        echo "  report  - Generate cleanup report"
        echo "  images  - Clean up unused container images"
        echo ""
        echo "Environment variables:"
        echo "  MAX_AGE_HOURS - Maximum age for preview environments (default: 24)"
        echo "  DRY_RUN       - Set to 'true' for dry run mode (default: false)"
        exit 1
        ;;
esac