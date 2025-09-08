# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app/product-service

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY src ./src
COPY tsconfig.json ./

# Build the TypeScript code
RUN npm run build

# Expose the REST API port and gRPC port
EXPOSE 3002
EXPOSE 50051

# Command to run the application
CMD ["npm", "start"]
