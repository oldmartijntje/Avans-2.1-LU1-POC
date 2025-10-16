FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies to allow build
RUN npm install

# Copy rest of the code
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 6969

# Run the compiled app directly
CMD ["node", "dist/main.js"]
