# Node v20 LTS
FROM node:iron

RUN apt update
RUN apt install ffmpeg -y

WORKDIR /app

RUN npm i -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY patche[s] ./patches
COPY .npmrc ./
COPY ./apps/api/package.json ./apps/api/package.json
COPY ./packages/prettier/package.json ./packages/prettier/package.json

RUN pnpm fetch

COPY ./apps/api ./apps/api
COPY ./packages/prettier ./packages/prettier

RUN pnpm --filter api install

RUN pnpm --filter api prisma generate
RUN pnpm --filter api build

# Sync the Mongo schema, then start the server. Without a CMD the base image
# falls back to a bare `node` REPL that binds no port and the deploy fails.
CMD ["sh", "-c", "pnpm --filter api prisma db push --skip-generate && pnpm --filter api start:prod"]