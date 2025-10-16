# Use Node 20 Alpine
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (needed for build)
RUN npm install

# Copy source code
COPY . .

# Install all dependencies including devDependencies
RUN npm install
RUN npm install @nestjs/cli


# Build NestJS app
RUN npm run build

# --- Production image ---
FROM node:20-alpine

WORKDIR /app

# Copy package.json and install only production deps
COPY package*.json ./
RUN npm install --production

# Copy built output from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 6969

# Start app
CMD ["node", "dist/main.js"]
