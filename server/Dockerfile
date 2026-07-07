FROM node:24-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Environment setup
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
