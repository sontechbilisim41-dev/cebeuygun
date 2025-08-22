# Multi-stage build for production optimization
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S support-bridge -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=support-bridge:nodejs /app/dist ./dist
COPY --from=builder --chown=support-bridge:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=support-bridge:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown support-bridge:nodejs logs

# Switch to non-root user
USER support-bridge

# Expose port
EXPOSE 8009

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8009/health', (res) => { \
    process.exit(res.statusCode === 200 ? 0 : 1) \
  }).on('error', () => process.exit(1))"

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

# Labels for metadata
LABEL maintainer="cebeuygun-team"
LABEL service="support-bridge"
LABEL version="1.0.0"
LABEL description="Customer Support Bridge Service"