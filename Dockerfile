# Build stage
FROM node:22-alpine AS build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine AS runner

WORKDIR /app

# Copy the build output from the build stage
COPY --from=build /app/.output ./.output

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", ".output/server/index.mjs"]

