# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app/api-gateway

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code (but not src - it will be mounted)
COPY tsconfig.json ./

# Build the TypeScript code (will be done at runtime with mounted src)
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev"]
