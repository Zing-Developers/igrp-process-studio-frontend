FROM docker.tools.irn.internal/base/node-builder-22-14:1.1.0 AS base

# Install dependencies only when needed
FROM base AS deps

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app 
 
# Update Corepack to the version with the fix and enable PNPM
# RUN npm install -g corepack@0.31.0 && \
#     corepack enable && \
#     corepack prepare pnpm@9.15.9 --activate
# ADDED CODE 1 END

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml*  ./
RUN npm install -g pnpm@9.15.9 && \
    pnpm install \
      --no-frozen-lockfile \
      --strict-peer-dependencies=false


# Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
#COPY ./env/.env.production .env.production

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# ADDED CODE 2 START
# Set up pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_PUBLIC_BASE_PATH="/apps/igrp-process-studio"
ENV NEXT_PUBLIC_ALLOWED_DOMAINS="backoffice.irn.lan,ppr-backoffice.irn.lan,qld-backoffice.irn.lan,dsv-backoffice.irn.lan,apisix.zingdevelopers.com,*.irn.lan,img.youtube.com,*.nosi.cv,*.railway.app"

# Update Corepack to the version with the fix and enable PNPM
# RUN npm install -g corepack@0.31.0 && \
#     corepack enable && \
#     corepack prepare pnpm@9.15.9 --activate
# ADDED CODE 2 END

RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm@9.15.9 && pnpm run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Production image, copy all the files and run next
FROM docker.tools.irn.internal/base/node-22-14:1.1.0 AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
