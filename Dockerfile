FROM node:lts-alpine3.20 AS builder
LABEL authors="ryanmccoy"

WORKDIR /app
COPY ../ .
RUN npm install
RUN npm run build

FROM node:lts-alpine3.20 AS runner
WORKDIR /app

COPY --from=builder /app/package.json .
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

EXPOSE 3000
CMD ["node", "server.js"]