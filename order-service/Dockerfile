# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app/order-service

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application code (but not src - it will be mounted)
COPY tsconfig.json ./

# Build the TypeScript code (will be done at runtime with mounted src)
# RUN npm run build

# Expose the port the app runs on
EXPOSE 3003
EXPOSE 50052

# Command to run the application in development mode
CMD ["npm", "run", "dev"]
