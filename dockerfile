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

# Build the NestJS application with verbose output
RUN npm run build && ls -la && ls -la dist

# Expose the application port
EXPOSE 6969

# Command to run the application
CMD ["npm", "run", "start:prod"]