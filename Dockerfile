# Build stage - force cache bust 2026-01-11
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev deps for building)
RUN npm ci

# Copy all source code
COPY . .

# Build the application (this compiles TypeScript to JavaScript in /app/build)
RUN node ace build --ignore-ts-errors

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built application from build stage
COPY --from=build /app/build ./build

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "build/bin/server.js"]
