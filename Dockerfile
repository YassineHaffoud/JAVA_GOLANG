FROM node:18-slim

# Installer Redis, sqlite, build tools
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      redis-server \
      sqlite3 libsqlite3-dev build-essential python3 \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copier et installer toutes les dépendances prod
COPY package*.json ./
RUN npm ci --only=production

# Copier ensuite le code de l'app
COPY . .

# Persistance
VOLUME ["/app/data"]

# Ports
EXPOSE 3000 6379

# Démarrer Redis, puis votre app directement avec Node
CMD ["sh", "-c", "redis-server --protected-mode no --dir /app/data & node src/index.js"]
