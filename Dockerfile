FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

# - target: npm 캐시가 저장될 경로
# - id: 캐시 저장소의 고유 식별자
RUN --mount=type=cache,target=/root/.npm,id=npm_cache \
  npm install

COPY . .
RUN npm run build

FROM mcr.microsoft.com/playwright:v1.55.0-noble AS runner

# install gemini-cli
RUN npm i -g @google/gemini-cli

WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm,id=npm_cache \
  npm install --omit=dev

RUN npx playwright install chromium --with-deps

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/*.md /app

CMD ["npm", "start"]