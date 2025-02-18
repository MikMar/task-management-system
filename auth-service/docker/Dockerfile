# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json (if exists)
COPY package*.json ./

# Install dependencies (optional, you can skip this step)
#RUN npm install

# Copy all project files (optional, you can skip this too)
COPY . .

# Expose gRPC port
EXPOSE 50051

# Default to a shell (so the container doesn't exit immediately)
CMD ["/bin/sh"]
