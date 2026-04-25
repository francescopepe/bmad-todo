# Stage 1: Install dependencies
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# Stage 2: Build application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Generate init SQL from Prisma schema (single source of truth)
RUN npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/init.sql
ENV DATABASE_URL=file:/tmp/build.db
RUN npm run build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create data directory for SQLite volume mount
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Copy standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma/init.sql ./prisma/init.sql

# Copy database initialization script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/init-db.mjs ./scripts/init-db.mjs

USER nextjs

EXPOSE 3000

CMD ["sh", "-c", "node scripts/init-db.mjs && node server.js"]
