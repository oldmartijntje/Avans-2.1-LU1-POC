FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Build frontend if you have a build step (skip if not)
# RUN npm run build

# Expose app port
EXPOSE 6969

# Run app
CMD ["node", "server.js"]

