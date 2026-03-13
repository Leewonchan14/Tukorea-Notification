FROM node:24-alpine

WORKDIR /app

RUN --mount=type=cache,target=/var/cache/apk \
  apk add python3 make g++ pkgconfig libsecret-dev coreutils

RUN --mount=type=cache,target=/root/.npm \
  npm install -g npm@11.11.1 && \
  npm i -g @google/gemini-cli --unsafe-perm

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
  npm install

COPY . .

CMD npm run dev