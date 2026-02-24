FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy server code
COPY . .

# Expose port
EXPOSE 5000

# Set production environment by default
ENV NODE_ENV=production

# Start the server, listening on all interfaces
CMD ["node", "index.js"]
