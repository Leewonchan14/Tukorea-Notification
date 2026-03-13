# Stage 1: Build the application
FROM node:24-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN --mount=type=cache,target=/var/cache/apk \
  apk add python3 make g++ pkgconfig libsecret-dev coreutils

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies required for build)
RUN --mount=type=cache,target=/root/.npm \
  npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Install production dependencies
FROM node:24-alpine AS prod-deps

WORKDIR /app

# Install build dependencies for native modules (e.g., sharp)
RUN --mount=type=cache,target=/var/cache/apk \
  apk add python3 make g++ pkgconfig libsecret-dev coreutils

COPY package.json package-lock.json* ./

# Install only production dependencies
RUN --mount=type=cache,target=/root/.npm \
  npm install --omit=dev

# Stage 3: Final production image
FROM node:24-alpine AS runner

WORKDIR /app

# Install runtime dependencies and build tools for global package
# We install build tools temporarily to build @google/gemini-cli's native deps
RUN --mount=type=cache,target=/var/cache/apk \
  apk add curl libsecret coreutils python3 make g++ pkgconfig

RUN --mount=type=cache,target=/root/.npm \
  npm install -g npm@11.11.1 && \
  npm i -g @google/gemini-cli --unsafe-perm

# Copy package.json for npm run start
COPY package.json ./

# Copy node_modules and dist from previous stages
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY *.md ./

# Start the application
CMD ["npm", "run", "start"]