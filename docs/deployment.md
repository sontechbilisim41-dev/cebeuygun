# Deployment Guide

Complete guide for deploying the CebeUygun e-commerce platform with CI/CD pipelines, security scanning, and canary deployments.

## 🎯 Overview

The deployment infrastructure provides:
- **Multi-environment support** (preview, staging, production)
- **Automated CI/CD pipelines** with GitHub Actions
- **Security scanning** with Trivy, Semgrep, and OWASP ZAP
- **Canary deployments** for zero-downtime releases
- **Auto-scaling** with Horizontal Pod Autoscalers
- **Comprehensive monitoring** with observability stack

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub        │───▶│  GitHub Actions  │───▶│   Kubernetes    │
│   Repository    │    │   CI/CD Pipeline │    │    Cluster      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Container     │    │   Security       │    │   Observability │
│   Registry      │    │   Scanning       │    │     Stack       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### **Prerequisites**
- Kubernetes cluster (1.24+)
- kubectl configured
- Helm 3.x installed
- Docker registry access

### **Initial Setup**

1. **Configure secrets**
   ```bash
   # GitHub repository secrets
   KUBE_CONFIG: <base64-encoded-kubeconfig>
   GITHUB_TOKEN: <github-token>
   SNYK_TOKEN: <snyk-token>
   ```

2. **Deploy observability stack**
   ```bash
   ./infra/scripts/setup-observability.sh setup
   ```

3. **Deploy platform**
   ```bash
   ./scripts/deploy.sh deploy
   ```

## 📋 CI/CD Pipeline

### **Pipeline Stages**

1. **Code Quality**
   - ESLint + TypeScript checking
   - Unit and integration tests
   - Code coverage reporting

2. **Security Scanning**
   - **SAST**: Semgrep, CodeQL, ESLint Security
   - **Dependency Scan**: npm audit, Snyk
   - **Container Scan**: Trivy, Grype
   - **DAST**: OWASP ZAP (for preview environments)

3. **Build & Push**
   - Multi-service matrix builds
   - Docker image building with BuildKit
   - Container registry push with metadata

4. **Deployment**
   - **Preview**: Automatic PR environments
   - **Staging**: Develop branch deployments
   - **Production**: Canary deployments

### **Workflow Triggers**

```yaml
# Automatic triggers
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *' # Daily security scans
```

## 🔄 Deployment Strategies

### **Preview Environments**
- **Automatic creation** for each pull request
- **Isolated namespaces** with resource limits
- **Automatic cleanup** when PR is closed
- **URL format**: `https://pr-{number}.preview.cebeuygun.com`

### **Canary Deployments**
```bash
# Automated canary flow
1. Deploy canary (10% traffic)
2. Monitor metrics for 5 minutes
3. Promote to 50% traffic
4. Monitor for 5 more minutes
5. Full promotion (100% traffic)
6. Update stable deployment
```

### **Rollback Strategy**
```bash
# Automatic rollback triggers
- Error rate > 1%
- Response time > 500ms
- Health check failures > 3
- Manual rollback command
```

## 🛡️ Security Features

### **Container Security**
- **Vulnerability scanning** with Trivy and Grype
- **Base image updates** with automated PRs
- **Non-root containers** with read-only filesystems
- **Security contexts** with dropped capabilities

### **Network Security**
- **Network policies** for pod-to-pod communication
- **Ingress security** with rate limiting and CORS
- **TLS termination** with automatic certificate management
- **Service mesh** with Istio for advanced traffic management

### **Secrets Management**
- **Kubernetes secrets** for sensitive data
- **External secrets operator** for cloud integration
- **Secret rotation** with automated updates
- **Encryption at rest** for etcd

## 📊 Monitoring & Observability

### **Metrics Collection**
- **Prometheus** for metrics scraping
- **Custom metrics** for business KPIs
- **SLA monitoring** with automated alerting
- **Resource utilization** tracking

### **Logging**
- **Structured logging** with JSON format
- **Centralized collection** with Elasticsearch
- **Log correlation** with trace IDs
- **Retention policies** (30 days default)

### **Distributed Tracing**
- **OpenTelemetry** instrumentation
- **End-to-end tracing** of order flows
- **Performance analysis** with Jaeger
- **Service dependency mapping**

## 🔧 Configuration Management

### **Kustomize Structure**
```
k8s/
├── base/                 # Base configurations
│   ├── auth-service/
│   ├── order-service/
│   └── ...
├── overlays/            # Environment-specific overlays
│   ├── production/
│   ├── staging/
│   └── preview/
```

### **Helm Charts**
```
helm/cebeuygun-platform/
├── Chart.yaml           # Chart metadata
├── values.yaml          # Default values
├── templates/           # Kubernetes templates
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── hpa.yaml
```

## 🚨 Alerting Rules

### **SLA Violations**
- **Error Rate**: > 0.1% triggers critical alert
- **Response Time**: > 300ms (95th percentile)
- **Order Processing**: > 5 minutes end-to-end
- **Payment Success**: < 99% success rate

### **Infrastructure Alerts**
- **High CPU**: > 80% for 10 minutes
- **High Memory**: > 85% for 5 minutes
- **Disk Space**: < 10% remaining
- **Pod Crashes**: > 3 restarts in 5 minutes

### **Business Alerts**
- **Order Volume Drop**: 50% decrease from baseline
- **High Cancellation Rate**: > 15% in 15 minutes
- **Payment Gateway Down**: Immediate alert
- **Courier Shortage**: < 5 available couriers

## 🔧 Operations

### **Daily Operations**
```bash
# Check deployment status
./scripts/deploy.sh status

# Run health checks
./scripts/deploy.sh health

# View logs
kubectl logs -f deployment/auth-service -n production

# Check metrics
curl http://prometheus:9090/api/v1/query?query=up
```

### **Troubleshooting**
```bash
# Check pod status
kubectl get pods -n production

# Describe failing pod
kubectl describe pod <pod-name> -n production

# Check events
kubectl get events -n production --sort-by='.lastTimestamp'

# Port forward for debugging
kubectl port-forward svc/auth-service 8001:8001 -n production
```

### **Scaling Operations**
```bash
# Manual scaling
kubectl scale deployment auth-service --replicas=10 -n production

# Check HPA status
kubectl get hpa -n production

# Update HPA thresholds
kubectl patch hpa auth-service-hpa -p '{"spec":{"targetCPUUtilizationPercentage":60}}'
```

## 🔄 Maintenance

### **Regular Tasks**
- **Weekly**: Review security scan results
- **Monthly**: Update base images and dependencies
- **Quarterly**: Review and update resource limits
- **Annually**: Security audit and penetration testing

### **Backup & Recovery**
- **Database backups**: Daily automated backups
- **Configuration backups**: Git-based version control
- **Disaster recovery**: Multi-region deployment capability
- **RTO/RPO**: 15 minutes RTO, 1 hour RPO

## 📈 Performance Optimization

### **Resource Tuning**
- **CPU requests**: Set to 80% of typical usage
- **Memory requests**: Set to 90% of typical usage
- **HPA thresholds**: Tune based on traffic patterns
- **Node affinity**: Spread pods across availability zones

### **Network Optimization**
- **Connection pooling**: Configure for databases and Redis
- **Keep-alive**: Enable for HTTP connections
- **Compression**: Enable gzip for API responses
- **CDN**: Use for static assets

## 🎯 Best Practices

### **Development**
- **Feature flags** for gradual rollouts
- **Database migrations** with backward compatibility
- **API versioning** for breaking changes
- **Circuit breakers** for external dependencies

### **Security**
- **Principle of least privilege** for service accounts
- **Regular security updates** with automated scanning
- **Secrets rotation** with zero-downtime updates
- **Network segmentation** with policies

### **Monitoring**
- **SLI/SLO definition** for all critical services
- **Runbook automation** for common incidents
- **Capacity planning** based on growth projections
- **Cost optimization** with resource right-sizing

---

**Pipeline Version**: 1.0.0  
**Last Updated**: 2024-01-20  
**Maintained By**: DevOps Team