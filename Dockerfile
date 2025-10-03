FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM mcr.microsoft.com/playwright:v1.55.0-noble AS runner
RUN npx playwright install chromium --with-deps

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist /app/dist

CMD ["npm", "start"]
