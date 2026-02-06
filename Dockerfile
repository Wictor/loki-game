FROM node:20-slim

WORKDIR /app

# Copy shared types first
COPY shared/ ./shared/

# Copy server
COPY server/package.json server/package-lock.json* ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm install --production=false

# Copy server source
COPY server/ ./

WORKDIR /app/server

EXPOSE 3001

CMD ["npx", "tsx", "src/index.ts"]
