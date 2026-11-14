
FROM node:22-alpine AS builder
WORKDIR /app
COPY frontend-shop-nuxt/package*.json ./
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5 && \
    npm ci
COPY frontend-shop-nuxt/ ./
ARG NUXT_PUBLIC_API_BASE=http://localhost:5000/api
ARG NUXT_PUBLIC_SOCKET_BASE=
ARG NUXT_API_BASE_INTERNAL=http://backend:5000/api
ENV NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE
ENV NUXT_PUBLIC_SOCKET_BASE=$NUXT_PUBLIC_SOCKET_BASE
ENV NUXT_API_BASE_INTERNAL=$NUXT_API_BASE_INTERNAL
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.output ./output
EXPOSE 3000
CMD ["node", "output/server/index.mjs"]
