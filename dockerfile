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

# Build the NestJS application with error checking
RUN npm run build || (echo "Build failed!" && exit 1)

# Verify dist directory exists and show contents
RUN echo "=== Checking dist folder ===" && \
    ls -la && \
    if [ -d "dist" ]; then \
    echo "=== dist folder contents ===" && \
    ls -laR dist; \
    else \
    echo "ERROR: dist folder does not exist!" && \
    exit 1; \
    fi

# Expose the application port
EXPOSE 6969

# Command to run the application
CMD ["npm", "run", "start:prod"]