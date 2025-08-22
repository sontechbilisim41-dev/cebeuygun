#!/bin/bash

# Script to generate sample traces for testing the observability stack

set -e

echo "🔄 Generating sample traces for Order → Assign → Deliver flow..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Configuration
API_BASE_URL=${API_BASE_URL:-"http://localhost:3000"}
OTEL_COLLECTOR_URL=${OTEL_COLLECTOR_URL:-"http://localhost:4318"}

# Generate trace ID
generate_trace_id() {
    openssl rand -hex 16
}

# Generate span ID
generate_span_id() {
    openssl rand -hex 8
}

# Send trace data to OpenTelemetry Collector
send_trace() {
    local trace_id=$1
    local span_id=$2
    local parent_span_id=$3
    local service_name=$4
    local operation_name=$5
    local duration_ms=$6
    local status_code=$7
    local attributes=$8

    local start_time=$(date -u +%s%N)
    local end_time=$((start_time + duration_ms * 1000000))

    curl -s -X POST "${OTEL_COLLECTOR_URL}/v1/traces" \
        -H "Content-Type: application/json" \
        -d "{
            \"resourceSpans\": [{
                \"resource\": {
                    \"attributes\": [
                        {\"key\": \"service.name\", \"value\": {\"stringValue\": \"${service_name}\"}},
                        {\"key\": \"service.version\", \"value\": {\"stringValue\": \"1.0.0\"}},
                        {\"key\": \"deployment.environment\", \"value\": {\"stringValue\": \"development\"}}
                    ]
                },
                \"scopeSpans\": [{
                    \"scope\": {
                        \"name\": \"${service_name}\",
                        \"version\": \"1.0.0\"
                    },
                    \"spans\": [{
                        \"traceId\": \"${trace_id}\",
                        \"spanId\": \"${span_id}\",
                        \"parentSpanId\": \"${parent_span_id}\",
                        \"name\": \"${operation_name}\",
                        \"kind\": 1,
                        \"startTimeUnixNano\": \"${start_time}\",
                        \"endTimeUnixNano\": \"${end_time}\",
                        \"status\": {\"code\": ${status_code}},
                        \"attributes\": ${attributes}
                    }]
                }]
            }]
        }" > /dev/null
}

# Simulate complete order flow
simulate_order_flow() {
    local order_id="order_$(date +%s)_$(shuf -i 1000-9999 -n 1)"
    local customer_id="customer_$(shuf -i 1000-9999 -n 1)"
    local restaurant_id="restaurant_$(shuf -i 100-999 -n 1)"
    local courier_id="courier_$(shuf -i 100-999 -n 1)"
    
    local trace_id=$(generate_trace_id)
    
    print_status "Simulating order flow for Order ID: ${order_id}"
    print_status "Trace ID: ${trace_id}"
    
    # Root span - Order Creation
    local root_span_id=$(generate_span_id)
    send_trace "${trace_id}" "${root_span_id}" "" "order-service" "create_order" 150 1 \
        "[
            {\"key\": \"order.id\", \"value\": {\"stringValue\": \"${order_id}\"}},
            {\"key\": \"customer.id\", \"value\": {\"stringValue\": \"${customer_id}\"}},
            {\"key\": \"restaurant.id\", \"value\": {\"stringValue\": \"${restaurant_id}\"}},
            {\"key\": \"order.amount\", \"value\": {\"doubleValue\": 45.50}},
            {\"key\": \"http.method\", \"value\": {\"stringValue\": \"POST\"}},
            {\"key\": \"http.status_code\", \"value\": {\"intValue\": 201}}
        ]"
    
    sleep 0.1
    
    # Payment Processing
    local payment_span_id=$(generate_span_id)
    send_trace "${trace_id}" "${payment_span_id}" "${root_span_id}" "payment-service" "process_payment" 800 1 \
        "[
            {\"key\": \"payment.id\", \"value\": {\"stringValue\": \"pay_${order_id}\"}},
            {\"key\": \"payment.method\", \"value\": {\"stringValue\": \"credit_card\"}},
            {\"key\": \"payment.amount\", \"value\": {\"doubleValue\": 45.50}},
            {\"key\": \"payment.gateway\", \"value\": {\"stringValue\": \"stripe\"}}
        ]"
    
    sleep 0.2
    
    # Restaurant Notification
    local notification_span_id=$(generate_span_id)
    send_trace "${trace_id}" "${notification_span_id}" "${root_span_id}" "notification-service" "notify_restaurant" 50 1 \
        "[
            {\"key\": \"notification.type\", \"value\": {\"stringValue\": \"new_order\"}},
            {\"key\": \"notification.recipient\", \"value\": {\"stringValue\": \"${restaurant_id}\"}},
            {\"key\": \"notification.channel\", \"value\": {\"stringValue\": \"push\"}}
        ]"
    
    sleep 0.3
    
    # Courier Assignment
    local assignment_span_id=$(generate_span_id)
    send_trace "${trace_id}" "${assignment_span_id}" "${root_span_id}" "courier-service" "assign_courier" 2000 1 \
        "[
            {\"key\": \"courier.id\", \"value\": {\"stringValue\": \"${courier_id}\"}},
            {\"key\": \"assignment.distance\", \"value\": {\"doubleValue\": 3.2}},
            {\"key\": \"assignment.estimated_time\", \"value\": {\"intValue\": 25}}
        ]"
    
    sleep 0.5
    
    # Pickup Confirmation
    local pickup_span_id=$(generate_span_id)
    send_trace "${trace_id}" "${pickup_span_id}" "${assignment_span_id}" "courier-service" "confirm_pickup" 100 1 \
        "[
            {\"key\": \"pickup.location\", \"value\": {\"stringValue\": \"${restaurant_id}\"}},
            {\"key\": \"pickup.time\", \"value\": {\"stringValue\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}}
        ]"
    
    sleep 0.8
    
    # Delivery Completion
    local delivery_span_id=$(generate_span_id)
    local delivery_duration=$((RANDOM % 1000 + 500))
    send_trace "${trace_id}" "${delivery_span_id}" "${assignment_span_id}" "courier-service" "complete_delivery" ${delivery_duration} 1 \
        "[
            {\"key\": \"delivery.location\", \"value\": {\"stringValue\": \"customer_address\"}},
            {\"key\": \"delivery.time\", \"value\": {\"stringValue\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}},
            {\"key\": \"delivery.proof\", \"value\": {\"stringValue\": \"photo_verification\"}}
        ]"
    
    sleep 0.2
    
    # Order Completion
    local completion_span_id=$(generate_span_id)
    send_trace "${trace_id}" "${completion_span_id}" "${root_span_id}" "order-service" "complete_order" 80 1 \
        "[
            {\"key\": \"order.status\", \"value\": {\"stringValue\": \"delivered\"}},
            {\"key\": \"order.completion_time\", \"value\": {\"stringValue\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}}
        ]"
    
    print_status "Order flow trace generated ✓"
}

# Generate error traces
simulate_error_scenarios() {
    print_status "Generating error scenario traces..."
    
    # Payment failure
    local trace_id=$(generate_trace_id)
    local span_id=$(generate_span_id)
    send_trace "${trace_id}" "${span_id}" "" "payment-service" "process_payment" 1200 2 \
        "[
            {\"key\": \"error.type\", \"value\": {\"stringValue\": \"payment_declined\"}},
            {\"key\": \"error.message\", \"value\": {\"stringValue\": \"Insufficient funds\"}},
            {\"key\": \"payment.gateway\", \"value\": {\"stringValue\": \"stripe\"}}
        ]"
    
    # Courier assignment timeout
    local trace_id=$(generate_trace_id)
    local span_id=$(generate_span_id)
    send_trace "${trace_id}" "${span_id}" "" "courier-service" "assign_courier" 30000 2 \
        "[
            {\"key\": \"error.type\", \"value\": {\"stringValue\": \"assignment_timeout\"}},
            {\"key\": \"error.message\", \"value\": {\"stringValue\": \"No available couriers\"}},
            {\"key\": \"assignment.attempts\", \"value\": {\"intValue\": 5}}
        ]"
    
    print_status "Error scenarios generated ✓"
}

# Generate load test traces
generate_load_test() {
    local count=${1:-10}
    print_status "Generating ${count} order flow traces for load testing..."
    
    for i in $(seq 1 $count); do
        simulate_order_flow &
        
        # Add some randomness
        sleep $(echo "scale=2; ${RANDOM}/32767 * 2" | bc)
    done
    
    wait
    print_status "Load test traces generated ✓"
}

# Main execution
case "${1:-setup}" in
    "setup")
        check_prerequisites
        create_namespaces
        deploy_elasticsearch
        deploy_kibana
        deploy_jaeger
        deploy_loki
        deploy_otel_collector
        deploy_prometheus
        deploy_alertmanager
        deploy_grafana
        setup_kibana_dashboards
        setup_grafana_dashboards
        print_status "🎉 Observability infrastructure setup completed!"
        ;;
    "trace")
        simulate_order_flow
        ;;
    "errors")
        simulate_error_scenarios
        ;;
    "load")
        generate_load_test ${2:-50}
        ;;
    "verify")
        verify_deployment
        ;;
    *)
        echo "Usage: $0 {setup|trace|errors|load|verify}"
        echo "  setup  - Deploy complete observability infrastructure"
        echo "  trace  - Generate single order flow trace"
        echo "  errors - Generate error scenario traces"
        echo "  load   - Generate multiple traces for load testing"
        echo "  verify - Verify deployment status"
        exit 1
        ;;
esac