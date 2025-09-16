FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install

CMD tail -f /dev/null

RUN npm run build

FROM mcr.microsoft.com/playwright:v1.55.0-noble as runner

# CMD tail -f /dev/null

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist /app/dist

CMD ["npm", "start"]
