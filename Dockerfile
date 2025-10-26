FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM mcr.microsoft.com/playwright:v1.55.0-noble AS runner

# install gemini-cli
RUN npm i -g @google/gemini-cli

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev
RUN npx playwright install chromium --with-deps

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/*.md /app

CMD ["npm", "start"]
