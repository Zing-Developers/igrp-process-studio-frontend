FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat && corepack enable
# ENV PNPM_HOME=/pnpm
# ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app

FROM base AS deps
COPY package.json .npmrc ./
COPY pnpm-lock.yaml ./
RUN node -v && pnpm -v
RUN node -e "const fs=require('fs'),p=JSON.parse(fs.readFileSync('package.json'));p.pnpm={onlyBuiltDependencies:['sharp','unrs-resolver']};fs.writeFileSync('package.json',JSON.stringify(p));"
RUN if [ -f pnpm-lock.yaml ]; then \
  echo "Using frozen lockfile" && pnpm i --frozen-lockfile; \
  else \
  echo "No lockfile found, installing dependencies"; \
  fi


FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
#COPY ./env/.env.production .env.production

ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_ALLOWED_DOMAINS

ENV NEXT_PUBLIC_BASE_PATH="/apps/igrp-process-studio"
ENV NEXT_PUBLIC_ALLOWED_DOMAINS="dsv-backoffice.irn.lan,apisix.zingdevelopers.com,*.irn.lan,img.youtube.com,*.nosi.cv,*.railway.app"

RUN pnpm build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

COPY certs/irn/*.crt /usr/local/share/ca-certificates/

RUN apk update \
&& apk upgrade --available \
&& apk add ca-certificates \
&& update-ca-certificates

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
