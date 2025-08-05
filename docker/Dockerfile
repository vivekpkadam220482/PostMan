# Gmail API E2E Testing Docker Image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    git

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Install Newman globally
RUN npm install -g newman newman-reporter-htmlextra

# Copy application files
COPY . .

# Create reports directory
RUN mkdir -p reports

# Set permissions for scripts
RUN chmod +x scripts/*.sh

# Create non-root user for security
RUN addgroup -g 1001 testuser && \
    adduser -D -u 1001 -G testuser testuser && \
    chown -R testuser:testuser /app

USER testuser

# Default command
CMD ["npm", "run", "test:smoke"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node --version || exit 1

# Labels
LABEL maintainer="your-email@example.com"
LABEL description="Gmail API E2E Testing Suite with Postman and Newman"
LABEL version="1.0.0"