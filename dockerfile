# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Verify the build output RIGHT before running
RUN echo "=== Final verification before CMD ===" && \
    ls -la && \
    if [ -d "dist" ]; then \
    echo "=== dist exists ===" && \
    ls -laR dist/ && \
    echo "=== Attempting to find main.js ===" && \
    find dist -name "main.js" -type f; \
    else \
    echo "ERROR: No dist folder!" && \
    exit 1; \
    fi

# Expose the application port
EXPOSE 6969

# Add a debug entrypoint to see what's happening at runtime
CMD ["sh", "-c", "echo 'Runtime check:' && ls -la dist/ && node dist/main.js"]